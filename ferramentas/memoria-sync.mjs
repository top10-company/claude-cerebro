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
 * ABRANGÊNCIA: percorre TODOS os projetos com memória, não só o maior. Cada um vira uma subpasta
 * no repo, espelhando o disco:
 *
 *     ~/.claude/projects/<slug>/memory/*.md   ⇄   <CLAUDE_CONTEXTO>/memoria/<slug>/*.md
 *
 * A subpasta preserva de onde a memória veio — é o que permite ao `puxar` devolver cada arquivo ao
 * projeto certo, e o que impede os MEMORY.md (um índice por projeto) de colidirem entre si.
 *
 * CONFIGURAÇÃO — variáveis de ambiente, com default sensato:
 *   CLAUDE_MEMORIA   força UM projeto só           (default: todos em ~/.claude/projects/)
 *   CLAUDE_CONTEXTO  repositório de contexto       (default: ~/claude-contexto)
 *
 * ⚠️ CLAUDE_CONTEXTO precisa apontar para um repositório GIT DE VERDADE. Se o default cair numa
 * pasta solta, o script copia, manda rodar `git -C` nela, o comando falha — e a memória fica
 * exatamente onde não devia: fora do versionamento. Foi o que aconteceu até 23/jul/2026.
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

// A TRAVA: um destino sem .git não versiona nada. O script copiaria os arquivos, mandaria rodar
// `git -C <destino> add`, o comando falharia — e a memória ficaria fora do versionamento com toda
// a aparência de sucesso. Foi o que rodou nesta máquina até 23/jul/2026: CLAUDE_CONTEXTO não estava
// definida, o default caiu numa pasta solta, e 97 memórias moraram lá sem backup nenhum.
// Isto NÃO é aviso: é parada. Salvar no lugar errado é pior que não salvar, porque parece salvo.
if (!existsSync(join(CONTEXTO, ".git"))) {
  console.error(`✗ ${CONTEXTO} não é um repositório git — não adianta copiar memória para lá.`);
  console.error(`  Aponte CLAUDE_CONTEXTO para o repositório de contexto:`);
  console.error(`      export CLAUDE_CONTEXTO=~/www/<seu-repo-de-contexto>`);
  console.error(`  (ou rode 'git init' nesse caminho, se ele for mesmo o repositório)`);
  process.exit(1);
}

// TODOS os projetos com memória — um por pasta em ~/.claude/projects/<slug>/memory.
//
// Antes daqui saía UM só: "a memória com mais arquivos, quase sempre a do trabalho principal".
// Não era. Medido em 23/jul/2026: 207 memórias no disco espalhadas por 12 projetos, e só 93
// versionadas — 114 nunca chegavam ao git, num script que existe justamente porque memória
// perdida não volta. Quem escreve memória num projeto secundário não tinha backup nenhum.
//
// Cada projeto vira uma subpasta no repo (memoria/<slug>/), preservando de onde a memória veio:
// sem isso o `puxar` não saberia onde devolver cada arquivo na outra máquina, e os MEMORY.md
// (um índice por projeto) colidiriam entre si.
function acharMemorias() {
  if (process.env.CLAUDE_MEMORIA) {
    return [{ slug: basename(join(process.env.CLAUDE_MEMORIA, "..")), dir: process.env.CLAUDE_MEMORIA }];
  }
  const raiz = join(homedir(), ".claude", "projects");
  if (!existsSync(raiz)) return [];
  return readdirSync(raiz)
    .map(slug => ({ slug, dir: join(raiz, slug, "memory") }))
    .filter(x => existsSync(x.dir) && readdirSync(x.dir).some(f => f.endsWith(".md")))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const PROJETOS = acharMemorias();
if (!PROJETOS.length) {
  console.error(`✗ não achei nenhuma pasta de memória. Declare CLAUDE_MEMORIA=<caminho>`);
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
  for (const { slug, dir } of PROJETOS) {
    conferir(dir, `disco  ${slug}`);
    const espelho = join(DESTINO, slug);
    if (existsSync(espelho)) conferir(espelho, `repo   ${slug}`);
  }
  process.exit(0);
}

let novos = 0, mudados = 0, iguais = 0, barrados = 0;
const mudou = [], bloqueios = [], sobras = [];

for (const { slug, dir } of PROJETOS) {
  const espelho = join(DESTINO, slug);
  const [de, para] = acao === "enviar" ? [dir, espelho] : [espelho, dir];
  if (!existsSync(de)) continue; // projeto ainda sem espelho no repo (ao puxar) — nada a fazer
  if (!SECO) mkdirSync(para, { recursive: true });

  for (const f of md(de)) {
    const a = join(de, f), b = join(para, f);
    const agora = ler(a) || "";

    // GUARDIÃO: ao ENVIAR (disco → repo), nunca deixa segredo vivo ou memória sensível entrar no git
    if (acao === "enviar" && f !== "MEMORY.md") {
      const seg = varreSegredo(agora);
      if (seg) { barrados++; bloqueios.push(`  ⛔ ${slug}/${f} — ${seg.tipo} (${seg.trecho}) → cofre, não git`); continue; }
      if (ehSensivel(agora) && !/secret\.mjs get/.test(agora)) {
        barrados++; bloqueios.push(`  ⛔ ${slug}/${f} — marcada sensitive:true sem ponteiro pro cofre`); continue;
      }
    }

    const antes = ler(b);
    if (antes === null) { novos++; mudou.push(`+ ${slug}/${f}`); }
    else if (antes !== agora) { mudados++; mudou.push(`~ ${slug}/${f}`); }
    else { iguais++; continue; }
    if (!SECO) copyFileSync(a, b);
  }

  // o que existe no DESTINO e não na origem: nunca apaga sozinho — só denuncia
  for (const f of md(para).filter(f => !existsSync(join(de, f)))) sobras.push(`${slug}/${f}`);
}

if (bloqueios.length) {
  console.log(`\n⛔ ${barrados} memória(s) BARRADA(s) do git (segredo vivo ou sensível):`);
  bloqueios.forEach(b => console.log(b));
  console.log(`   valor de segredo vive no cofre: node ferramentas/secret.mjs set <nome> --de-arquivo <memória>`);
}

console.log(`\n${acao === "enviar" ? "disco → repositório" : "repositório → disco"}${SECO ? "  (SECO)" : ""}`);
console.log(`  ${PROJETOS.length} projeto(s) · ${novos} novo(s) · ${mudados} alterado(s) · ${iguais} igual(is)`);
for (const m of mudou.slice(0, 15)) console.log(`     ${m}`);
if (mudou.length > 15) console.log(`     … +${mudou.length - 15}`);

if (sobras.length) {
  console.log(`\n  ▲ ${sobras.length} arquivo(s) existem no destino e NÃO na origem — NÃO foram apagados:`);
  for (const s of sobras.slice(0, 10)) console.log(`     ${s}`);
  console.log(`     (apagar memória é decisão humana; este script nunca a toma)`);
}

for (const { slug, dir } of PROJETOS) {
  conferir(acao === "enviar" ? dir : join(DESTINO, slug), `conferência ${slug}`);
}

if (acao === "enviar" && !SECO) {
  console.log(`\n  → agora registre: git -C ${CONTEXTO} add memoria && git -C ${CONTEXTO} commit`);
}
