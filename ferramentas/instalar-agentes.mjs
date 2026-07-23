#!/usr/bin/env node
/**
 * instalar-agentes.mjs — instala TODOS os profissionais do cérebro como agentes do Claude Code.
 *
 * VIVO: lê claude-cerebro/agentes/*\/ ; um agente novo no repo aparece aqui no próximo run (após
 * `git pull`). Nada de lista manual — a fonte é o diretório.
 *
 * Gera carregadores AUTO-CONTIDOS em ~/.claude/agents/<nome>.md (frontmatter + OFÍCIO + CONTRATO
 * inline) — sem depender de caminhos relativos, então funcionam de qualquer projeto/máquina.
 *
 * Uso:
 *   node ferramentas/instalar-agentes.mjs                # instala em ~/.claude/agents (global)
 *   node ferramentas/instalar-agentes.mjs --dest=./.claude/agents   # num projeto
 *   node ferramentas/instalar-agentes.mjs --dry-run      # só mostra o que faria
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CB = fileURLToPath(new URL('..', import.meta.url)); // raiz do claude-cerebro
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const destArg = (argv.find(a => a.startsWith('--dest=')) || '').split('=')[1];
const dest = (destArg ? destArg : join(homedir(), '.claude', 'agents')).replace(/^~(?=$|\/)/, homedir());

const agDir = join(CB, 'agentes');
if (!existsSync(agDir)) { console.error(`✗ ${agDir} não existe — rode a partir do claude-cerebro (git clone + pull).`); process.exit(1); }
const agentes = readdirSync(agDir).filter(d => existsSync(join(agDir, d, 'OFICIO.md'))).sort();
if (!agentes.length) { console.error('✗ nenhum agente em agentes/ — o submodule/clone está vazio?'); process.exit(1); }
if (!dryRun) mkdirSync(dest, { recursive: true });

let n = 0;
for (const nome of agentes) {
  const oficio = readFileSync(join(agDir, nome, 'OFICIO.md'), 'utf8').trim();
  const contrato = existsSync(join(agDir, nome, 'CONTRATO.md')) ? readFileSync(join(agDir, nome, 'CONTRATO.md'), 'utf8').trim() : '';
  let fm = existsSync(join(agDir, nome, 'meta.yml')) ? readFileSync(join(agDir, nome, 'meta.yml'), 'utf8').trim() : '';
  if (!fm) { // fallback: deriva um frontmatter mínimo do OFÍCIO
    const desc = (oficio.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('>')) || nome).replace(/\*\*/g, '').slice(0, 300);
    fm = `name: ${nome}\ndescription: ${desc}\ntools: Bash, Read, Write, Edit, Glob, Grep\nmodel: opus`;
  }
  const carregador =
`---
${fm}
---

<!-- GERADO por claude-cerebro/ferramentas/instalar-agentes.mjs — NÃO editar à mão.
     Fonte: claude-cerebro/agentes/${nome}/ (edite lá e reinstale). -->

# OFÍCIO — o profissional

${oficio}

---

# CONTRATO — entrada · saída · o que valida

${contrato || '_(sem CONTRATO.md — este agente entrega direto do ofício)_'}

---

> **Roupa da marca:** acima está o profissional PURO (transferível). Se o projeto onde você roda tem
> \`marcas/<marca>/agentes/${nome}.md\` (paleta, persona, catálogo, alvos), leia-a também — ela veste
> este ofício para a marca. Sem ela, você é o especialista neutro.
`;
  if (dryRun) console.log(`  [dry] ${nome} → ${join(dest, nome + '.md')} (${carregador.length} chars)`);
  else writeFileSync(join(dest, `${nome}.md`), carregador);
  n++;
}
console.log(`\n${dryRun ? '(dry-run) ' : '✓ '}${n} agentes ${dryRun ? 'seriam instalados' : 'instalados'} em ${dest}`);
console.log('vivo: agente novo em claude-cerebro/agentes/ → aparece no próximo run (após `git -C <cerebro> pull`).');
