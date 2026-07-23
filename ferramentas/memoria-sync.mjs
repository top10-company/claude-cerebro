#!/usr/bin/env node
/**
 * memoria-sync.mjs — põe a memória do Claude sob versionamento, nos dois sentidos.
 *
 * POR QUE ISTO EXISTE (o caso que o motivou, medido em 22/jul/2026):
 * a memória de um projeto tinha 143 entradas no índice e **66 apontavam para arquivos que não
 * existiam mais** — 46%. Sem backup, sem histórico, sem qualquer registro de quando sumiram. O que
 * sobrou de cada uma foi a linha de resumo no índice.
 *
 * Memória que vive só num disco não é memória: é um arquivo esperando para sumir. Sob
 * versionamento, some com histórico — dá para recuperar, e dá para ver quando e por quê.
 *
 * E resolve o segundo problema junto: a mesma memória em duas máquinas. `puxar` na segunda máquina
 * entrega o contexto idêntico, sem copiar arquivo à mão.
 *
 * USO
 *   node memoria-sync.mjs enviar   [--seco]   disco → repositório (rode antes de registrar)
 *   node memoria-sync.mjs puxar    [--seco]   repositório → disco (na outra máquina)
 *   node memoria-sync.mjs conferir            só relata: links mortos, órfãos, divergência
 *
 * CONFIGURAÇÃO — variáveis de ambiente, com default sensato:
 *   CLAUDE_MEMORIA   pasta de memória do Claude   (default: ~/.claude/projects/<slug>/memory)
 *   CLAUDE_CONTEXTO  repositório de contexto      (default: ~/claude-contexto)
 *
 * NUNCA apaga sem dizer. `puxar` só sobrescreve arquivo cujo conteúdo difere, e lista o que mudou.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

const acao = process.argv[2];
const SECO = process.argv.includes("--seco");
if (!["enviar", "puxar", "conferir"].includes(acao)) {
  console.error("uso: node memoria-sync.mjs enviar|puxar|conferir [--seco]");
  process.exit(2);
}

// ── de onde e para onde ──────────────────────────────────────────────────────
const CONTEXTO = process.env.CLAUDE_CONTEXTO || join(homedir(), "claude-contexto");
const DESTINO = join(CONTEXTO, "memoria");

function acharMemoria() {
  if (process.env.CLAUDE_MEMORIA) return process.env.CLAUDE_MEMORIA;
  const raiz = join(homedir(), ".claude", "projects");
  if (!existsSync(raiz)) return null;
  // sem projeto declarado, usa a memória com mais arquivos — quase sempre a do trabalho principal
  const cands = readdirSync(raiz)
    .map(d => join(raiz, d, "memory"))
    .filter(p => existsSync(p))
    .map(p => ({ p, n: readdirSync(p).filter(f => f.endsWith(".md")).length }))
    .sort((a, b) => b.n - a.n);
  return cands[0]?.p || null;
}

const ORIGEM = acharMemoria();
if (!ORIGEM || !existsSync(ORIGEM)) {
  console.error(`✗ não achei a pasta de memória. Declare CLAUDE_MEMORIA=<caminho>`);
  process.exit(1);
}

const md = d => (existsSync(d) ? readdirSync(d).filter(f => f.endsWith(".md")) : []);
const ler = f => { try { return readFileSync(f, "utf8"); } catch { return null; } };

// ── O GUARDIÃO DE SEGREDOS ────────────────────────────────────────────────────
// Foi a falta disto que deixou uma memória com PII de admin de domínio ir parar num repo (22/jul).
// A fronteira NÃO é e-mail pessoal (isso é esperado num repo de contexto privado) — é VALOR DE
// SEGREDO VIVO: chave de API, token, chave privada, senha escrita. Esses nunca vão pro git; vivem
// no cofre (secret.mjs). E memória marcada `sensitive: true` no frontmatter também não sobe.
const PADROES_SEGREDO = [
  { nome: "chave privada", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { nome: "chave estilo AWS", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { nome: "chave do Google", re: /\bAIza[0-9A-Za-z_\-]{35}\b/ },
  { nome: "token OpenAI/Anthropic", re: /\b(sk|pk)-[A-Za-z0-9]{20,}\b/ },
  { nome: "token do GitHub", re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { nome: "atribuição de segredo com valor", re: /\b(secret|token|senha|password|api[_-]?key|refresh[_-]?token|client[_-]?secret)\b["']?\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/i },
];
function varreSegredo(texto) {
  for (const p of PADROES_SEGREDO) { const m = texto.match(p.re); if (m) return { tipo: p.nome, trecho: m[0].slice(0, 6) + "…" }; }
  return null;
}
const ehSensivel = texto => /^\s*sensitive:\s*true\s*$/im.test(texto.split(/^---$/m)[1] || "");

// ── conferência: o que está podre ────────────────────────────────────────────
function conferir(dir, rotulo) {
  const arquivos = md(dir);
  const indice = join(dir, "MEMORY.md");
  const txt = ler(indice) || "";
  const links = [...txt.matchAll(/\]\(([^)]+\.md)\)/g)].map(m => m[1]);

  const mortos = links.filter(l => !existsSync(join(dir, l)));
  const noIndice = new Set(links);
  const orfaos = arquivos.filter(f => f !== "MEMORY.md" && !noIndice.has(f));

  console.log(`\n── ${rotulo} ──`);
  console.log(`   ${arquivos.length - (arquivos.includes("MEMORY.md") ? 1 : 0)} memória(s) · ${links.length} link(s) no índice`);
  if (mortos.length) {
    console.log(`   ✗ ${mortos.length} link(s) MORTO(s) — o índice cita, o arquivo não existe:`);
    for (const m of mortos.slice(0, 8)) console.log(`      ${m}`);
    if (mortos.length > 8) console.log(`      … +${mortos.length - 8}`);
    console.log(`      ⚠ o resumo de cada um ainda está no índice — é o que sobrou. Resgate antes de limpar.`);
  }
  if (orfaos.length) {
    console.log(`   ▲ ${orfaos.length} arquivo(s) FORA do índice (existem e ninguém acha):`);
    for (const o of orfaos.slice(0, 8)) console.log(`      ${o}`);
  }
  if (!mortos.length && !orfaos.length) console.log(`   ✓ índice e disco batem`);
  return { arquivos, mortos, orfaos };
}

// ── ação ─────────────────────────────────────────────────────────────────────
if (acao === "conferir") {
  conferir(ORIGEM, `disco  ${ORIGEM}`);
  if (existsSync(DESTINO)) conferir(DESTINO, `repo   ${DESTINO}`);
  process.exit(0);
}

const [de, para] = acao === "enviar" ? [ORIGEM, DESTINO] : [DESTINO, ORIGEM];
if (!existsSync(de)) { console.error(`✗ origem não existe: ${de}`); process.exit(1); }
if (!SECO) mkdirSync(para, { recursive: true });

let novos = 0, mudados = 0, iguais = 0, barrados = 0;
const mudou = [], bloqueios = [];
for (const f of md(de)) {
  const a = join(de, f), b = join(para, f);
  const agora = ler(a) || "";

  // GUARDIÃO: ao ENVIAR (disco → repo), nunca deixa segredo vivo ou memória sensível entrar no git
  if (acao === "enviar" && f !== "MEMORY.md") {
    const seg = varreSegredo(agora);
    if (seg) { barrados++; bloqueios.push(`  ⛔ ${f} — ${seg.tipo} (${seg.trecho}) → cofre, não git`); continue; }
    if (ehSensivel(agora) && !/secret\.mjs get/.test(agora)) {
      barrados++; bloqueios.push(`  ⛔ ${f} — marcada sensitive:true sem ponteiro pro cofre`); continue;
    }
  }

  const antes = ler(b);
  if (antes === null) { novos++; mudou.push(`+ ${f}`); }
  else if (antes !== agora) { mudados++; mudou.push(`~ ${f}`); }
  else { iguais++; continue; }
  if (!SECO) copyFileSync(a, b);
}
if (bloqueios.length) {
  console.log(`\n⛔ ${barrados} memória(s) BARRADA(s) do git (segredo vivo ou sensível):`);
  bloqueios.forEach(b => console.log(b));
  console.log(`   valor de segredo vive no cofre: node ferramentas/secret.mjs set <nome> --de-arquivo <memória>`);
}

// o que existe no DESTINO e não na origem: nunca apaga sozinho — só denuncia
const soNoDestino = md(para).filter(f => !existsSync(join(de, f)));

console.log(`\n${acao === "enviar" ? "disco → repositório" : "repositório → disco"}${SECO ? "  (SECO)" : ""}`);
console.log(`  ${novos} novo(s) · ${mudados} alterado(s) · ${iguais} igual(is)`);
for (const m of mudou.slice(0, 15)) console.log(`     ${m}`);
if (mudou.length > 15) console.log(`     … +${mudou.length - 15}`);

if (soNoDestino.length) {
  console.log(`\n  ▲ ${soNoDestino.length} arquivo(s) existem no destino e NÃO na origem — NÃO foram apagados:`);
  for (const s of soNoDestino.slice(0, 10)) console.log(`     ${s}`);
  console.log(`     (apagar memória é decisão humana; este script nunca a toma)`);
}

conferir(de, "conferência da origem");

if (acao === "enviar" && !SECO) {
  console.log(`\n  → agora registre: git -C ${CONTEXTO} add memoria && git -C ${CONTEXTO} commit`);
}
