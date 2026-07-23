# CONTRATO — Roteirista de Narração

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal. O que é específico
> **desta instalação** (comandos, fila, schema) está marcado como tal — é o que uma porta troca.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| o pedido | **o TEMA** + o `<proj>` (slug da produção) | sim |
| a fila da estação | as **flags**: alvo de palavras, se tem publieditorial, se tem chamada de abertura, o **formato** | sim — o alvo de palavras define a faixa do gate |
| a fila da estação | o campo **`pauta`**: a evidência da pauta aprovada (ângulo, fontes já levantadas, urgência) | não — quando existe, é o seu briefing |
| a marca ativa | persona, estrutura canônica, vocabulário, público | não — sem ela, você entrega em voz neutra |

**Nesta instalação** a fila é `out/_fila-roteirizacao.jsonl` (uma linha JSON por projeto); leia a sua
com `top10 roteirizar fila` ou direto com Read. A linha é aberta por
`top10 roteirizar novo "<tema>" <proj> [--palavras A-B] [--publi] [--cta-abertura "<texto>"]`.

Mínimo aceitável para começar: **tema + alvo de palavras**. Tema sem ângulo definível e sem nenhuma
fonte que sustente a premissa não é pauta — reporte bloqueio (§6).

## 2 · Saída — as 4 obrigatórias

### 2.1 · A narração pura
```
out/<proj>/roteiro-boco.md
```
**Só o que é falado.** Frontmatter (`projeto`, `titulo_video`, `fonte`, `nota`) + o corpo na estrutura
canônica da marca. Nada de marcação de produção aqui: este é o documento que vai para quem grava.

### 2.2 · O dossiê interno
```
out/<proj>/roteiro-editor.md
```
A **mesma narração, palavra por palavra**, mais tudo que a produção precisa e o locutor não lê:

- `[IMAGEM SUGERIDA]` · `[FONTE]` · `[CTA]` (cada chamada falada, marcada para quem sincroniza o
  overlay) · `[⚠️ ATUALIZAR ANTES DE GRAVAR / NA PÓS]` em cada fato volátil, com data-limite;
- `## Fontes` — a lista com links;
- **`## Auditoria` — a LISTA afirmação-por-afirmação** com veredito ✅/⚠️ e a fonte de cada uma.
  **Placar sem lista não vale** (OFICIO §2): é contra esta lista que a bancada amostra;
- **o livro-razão da promessa** (ROT-18): `promessa do título → paga em [bloco]`;
- o conceito de miniatura no frontmatter;
- notas de pronúncia de nome difícil.

⚠️ **A narração tem que ser IDÊNTICA nos dois arquivos** (ROT-42e) — rode um diff do corpo narrado
antes de fechar. Já foram achados 3 parágrafos divergentes numa bancada.

### 2.3 · O manifest
```
out/<proj>/roteiro.json
```
**Nesta instalação** valida contra `contratos/roteiro.schema.json` (`node scripts/validar-contrato.mjs
roteiro out/<proj>/roteiro.json`). Campos obrigatórios: `proj`, `tema`, `titulo`, `palavras`,
`dur_estimada_min`, `topicos`, `auditoria`, `arquivos`. Mais: `flags` (espelho das flags da pauta —
é daqui que o gate lê o formato), `fontes`, `packaging` (os títulos propostos, o ângulo de cada um,
qual é o recomendado e o `alcance`), `obs` (decisões e sugestão de miniatura).

⚠️ **O `auditoria` do manifest tem o placar E A LISTA.** Além dos três inteiros (`ok`,
`ressalvas`, `imprecisos`), `auditoria.afirmacoes[]` traz uma entrada por afirmação verificável:
`{ afirmacao, veredito: ok|ressalva|impreciso, fonte, url?, nota? }`. O placar é **derivado** dela.

Isto mudou em 23/jul, e a razão é medida: a lista era mandada para o dossiê em prosa, e **0 de 35
roteiros** a tinham. O `critico-de-roteiro` julga a lente factual CONTRA a lista ("placar sem lista
já não é auditoria") — sem ela, a lente vira opinião, e o placar auto-relatado já deixou passar
"Subaru no Japão" (fica no Havaí) e "750 episódios" (eram ~800).

Prosa num dossiê não é verificável; JSON é. O gate confere que o placar bate com a lista, que toda
afirmação tem fonte nomeada, que toda ressalva diz o que é condicional, e que a afirmação auditada
**existe no texto narrado** — lista escrita de memória reprova. O dossiê pode repetir a lista em
prosa para leitura humana, mas a fonte é o manifest.

### 2.4 · O cache canônico
```
knowledge/roteiros/<proj>.md
```
Cópia da narração pura, com a fonte declarada no frontmatter. **Nesta instalação** ele tem duas
funções: é o acervo de referência da casa e é **contra ele que o gate de autoplágio compara** — o
roteiro novo não pode compartilhar trechos longos com nenhum roteiro já gravado ali.

## 3 · O gate determinístico — você só declara pronto com PASS

**Nesta instalação:** `top10 roteirizar validar <proj>`
(= `node scripts/roteirizacao/validar-roteiro.mjs <proj> [--palavras A-B]`). Custo zero, rode quantas
vezes precisar.

| O que ele cobra | Veredito |
|---|---|
| as 4 saídas existem | FAIL |
| o manifest passa no schema | FAIL |
| `auditoria.imprecisos == 0` (nenhum ❌ sobrou) | FAIL |
| `shopping` existe (com produto+gancho, OU `produto:null`+`motivo`) | FAIL |
| o gancho da indicação aparece no texto narrado · sem tom de vendedor · ≤60 palavras | FAIL |
| `auditoria.afirmacoes[]` existe e não está vazia | FAIL |
| o placar bate com a contagem da lista | FAIL |
| toda afirmação tem `fonte` nomeada · toda ressalva tem `nota` | FAIL |
| toda afirmação auditada aparece no texto narrado | FAIL |
| contagem **real** de palavras narradas dentro da faixa do alvo | FAIL |
| lista negra de vícios da marca | FAIL |
| marcador de introdução e de encerramento presentes | FAIL |
| introdução dentro do teto de palavras da marca | FAIL |
| **cold open sem pigarro** na 1ª frase narrada (ROT-17) | FAIL |
| número de blocos dentro da faixa da marca (ou do formato lista) | FAIL |
| **anúncio enfático de importância** (ROT-45) | FAIL |
| **medida física por extenso** na narração (ROT-25) | FAIL |
| **scaffolds proibidos** — moldes retóricos já usados pela casa (ROT-10) | FAIL |
| **promessa de espera** (ROT-11) | FAIL |
| **transição clichê** anunciada (ROT-12) | FAIL |
| coloquialismo vetado | FAIL |
| `dur_estimada_min` ≈ palavras ÷ ritmo de leitura | FAIL |
| trechos longos idênticos a outro roteiro do acervo (autoplágio, ROT-07) | aviso |
| conectivo/léxico de escrita, palavra rebuscada, tríades demais, parágrafo longo sem interpelação | aviso |
| numeral romano no narrado | aviso |
| moldura temporal / âncora relativa de dia sem a marcação no dossiê (ROT-16) | aviso |
| data recente sem o ano (ROT-25a) | aviso |
| contável por extenso | aviso |

**PASS move o projeto para "roteirizado" na fila.** FAIL significa que você não entregou — conserte e
rode de novo.

⚠️ **Dois limites do gate que são do ofício lembrar** (OFICIO §9):
- **Passar no gate não é estar bom.** O gate é determinístico e vira alvo: o vício muda de roupa e
  passa. A bancada crítica por cima é obrigatória.
- **PASS antigo não é passe vitalício (SIS-03).** Lei nova re-julga o backlog: antes de mandar gravar
  um roteiro validado numa data anterior a uma lei relevante, re-passe pelo gate e pela bancada.

Aviso não bloqueia, mas **cada aviso é uma decisão sua** — reporte por que ficou.

## 4 · A fronteira da entrega — você escreve, não distribui

**Você NUNCA envia o roteiro a quem vai gravar, NUNCA publica em nuvem, NUNCA avisa ninguém.**
A distribuição é decisão humana, tomada depois da revisão — e é um verbo separado
(**nesta instalação**: `top10 roteirizar enviar <proj>`, que cria o documento na nuvem e dispara o
aviso ao apresentador).

Corolário: se você **alterar** um roteiro que já foi enviado, isso não se propaga sozinho. Diga no
report, em voz alta, que a cópia publicada ficou velha e precisa ser regerada antes de qualquer novo
aviso (**nesta instalação**: `node scripts/roteirizacao/regerar-doc.mjs <proj>`, SIS-04). Roteiro
editado só no disco local é trabalho fantasma — quem grava lê a versão reprovada.

## 5 · O report (o que você devolve por escrito)

- **O título recomendado** + as outras propostas do packaging, com o ângulo de cada uma.
- **Palavras narradas** contadas de verdade, número de blocos e duração estimada.
- **O placar da auditoria + cada ressalva ⚠️**, dita por extenso (não só o número).
- **Os fatos voláteis marcados** e o que precisa ser conferido antes de gravar.
- **As fontes principais** e qualquer divergência entre elas que você resolveu por formulação.
- **O resultado do gate**: PASS + a lista de avisos que sobraram, com a justificativa de cada um.
- **Qualquer bloqueio** e o que você recomenda.

## 6 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- o fato central da premissa **não se sustenta** em fonte primária ou em ≥2 fontes independentes;
- a pauta exige afirmar o que a fonte não diz (ou cravar número que as fontes contradizem);
- o tema pede **conselho de saúde acionável** e não há fonte médica primária (ROT-42b);
- a premissa é um viral que se desmonta — nesse caso **proponha a virada** (o desmentido vira o
  vídeo), não escreva a versão falsa;
- o alvo de palavras é incompatível com a substância disponível — inflar é vetado (OFICIO §8).

Diga o que buscou, o que encontrou de mais próximo, e qual é a saída recomendada.
