# INSTALAR — o mesmo Claude em qualquer máquina

Este repositório é a **inteligência**: método, rigor, técnica e postura. Ele não sabe quem você é.

Quem você é vive num **segundo repositório**, separado — e é isso que permite compartilhar a
inteligência sem entregar junto o seu contexto.

```
claude-cerebro/          ← este repo. A inteligência. Compartilhável.
claude-contexto-<você>/  ← o seu. Privado. Nunca sai junto.
```

---

## Instalar (qualquer sistema operacional)

**1. Clone os dois** (ou só este, se você é novo — veja "Primeira vez" abaixo):

```bash
git clone <url-do-cerebro>            ~/claude-cerebro
git clone <url-do-seu-contexto>       ~/claude-contexto
```

**2. Ponte o Claude para eles.** Crie `~/.claude/CLAUDE.md` com o conteúdo de
[`nucleo/CARREGADOR.md`](nucleo/CARREGADOR.md), ajustando os dois caminhos.

É só isso. O carregador tem ~15 linhas e não guarda conhecimento nenhum — ele **aponta**. Todo o
resto vive nos repositórios, e por isso:

- **atualizar é `git pull`** — a inteligência melhora nas duas máquinas ao mesmo tempo;
- **as duas máquinas ficam idênticas** — nada mora só num disco;
- **contribuir é `git push`** — o que você aprender numa máquina vale na outra amanhã.

### Windows

Igual, com os caminhos do sistema. O arquivo de instruções globais fica em
`%USERPROFILE%\.claude\CLAUDE.md`, e os repositórios podem ficar em `%USERPROFILE%\claude-cerebro`
e `%USERPROFILE%\claude-contexto`. O carregador aceita os dois formatos de caminho.

---

## Primeira vez (você ainda não tem contexto)

Clone só este repositório e crie o carregador **sem** a linha do contexto. Na primeira conversa, o
Claude vai perceber que não conhece você e conduzir o onboarding de
[`onboarding/PERGUNTAS.md`](onboarding/PERGUNTAS.md) — cinco perguntas para começar, o resto
conforme a situação pedir.

As respostas viram o seu `claude-contexto`, que a partir daí é seu e privado.

---

## O que vai em cada repositório

A regra que separa é uma pergunta só:

> **"Se outra pessoa, de outra empresa, instalasse isto amanhã — continuaria verdadeiro e útil?"**

| Vai no **cérebro** (compartilhável) | Vai no **contexto** (privado) |
|---|---|
| *"Verifique antes de afirmar que está pronto"* | *"O comando de verificação aqui é `npm run check`"* |
| *"Backup verificado antes de apagar o original"* | *"O storage é `gs://meu-bucket`"* |
| *"Todo canvas 2d nasce com backing 2× ou o render 4K borra"* | *"Nosso render sai em 3840×2160"* |
| *"Delegue blocos completos, com escopos que não colidem"* | *"Quem mais mexe no repositório é a Ana"* |
| método, técnica, rigor, postura | nomes, caminhos, credenciais, pessoas, marca, preferências |

**O erro clássico é achar que a origem da regra a torna pessoal.** *"Nunca apague artefato gerado
para refazer"* nasceu de uma bronca específica de alguém — mas o princípio vale para qualquer
pessoa que gaste inferência. **A regra é inteligência; a bronca é contexto.**

Na dúvida: escreva a regra sem citar nome nenhum. Se ela continuar de pé, é do cérebro.

---

## Estrutura

```
nucleo/
  CLAUDE.md        o método — postura, verdade, custo, versionamento, memória
  CARREGADOR.md    as ~15 linhas que vão pro ~/.claude/CLAUDE.md de cada máquina
onboarding/
  PERGUNTAS.md     o que perguntar a quem chega sem contexto, em blocos com gatilho
dominios/
  <área>/          conhecimento de um ofício específico (ex.: produção de vídeo)
```

`dominios/` é opcional e modular: quem não trabalha com aquele ofício simplesmente não carrega.
