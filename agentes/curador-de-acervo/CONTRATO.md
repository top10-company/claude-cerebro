# CONTRATO — Curador de Acervo

> O que recebe · o que entrega · onde grava · o que valida. Caminhos relativos à produção.

## 1 · Entrada

| Vem de | O que é | Obrigatório |
|---|---|---|
| o vídeo novo (`out/<proj>/espelho.json` + `_blocos.json`) | a duração atual e os capítulos, para saber quanto FALTA até o piso | sim (no modo filler) |
| o **catálogo de conteúdo** `gs://…/catalogo/catalogo.jsonl` (do `catalogador`) | 1 registro/vídeo: `temas` (18 nichos), `segmentos[{ini,fim,assunto,gancho,texto}]` com o **título de tópico já pronto**, `resumo`, `entidades`, `duracao_s` | sim — sem ele, bloqueio |
| a marca ativa | o piso de duração, o nicho/taxonomia do canal, a transição de virada | sim |
| **`data_fonte`** — a data de PUBLICAÇÃO de cada vídeo-fonte | o lado "antes" do teste de relevância temporal do CTA (ofício §6) | **sim — sem ela, bloqueio** |
| **`hoje`** — a data de HOJE | o lado "agora" do mesmo teste | **sim — sem ela, bloqueio** |
| `_words/<video>.json` — timestamp+pontuação por palavra (`[{w,start,end}]`) | onde se acha o gap do card, a pontuação de frase e o ponto exato do micro-corte (ofício §5/§6) | sim no compilado |
| `conteudo_limpo_ate` por fonte — de `scripts/compilado/detectar-finalizacao.mjs` | o TETO duro: onde começa a cartela de créditos de membros (ofício §5d) | sim no compilado |

Modo **compilado**: sem vídeo novo — só o acervo + o tema/duração-alvo do compilado.

⚠️ **`data_fonte` e `hoje` não são opcionais nem inferíveis.** Sem as duas você não distingue CTA
DATADO (corta) de CTA PERENE (mantém) — e o erro tem custo em dinheiro nos dois sentidos: deixar
passar a promoção vencida faz o canal vender o que não existe; cortar o livro/clube vigente joga
receita fora. Faltando qualquer uma, **bloqueie e peça** — não adivinhe pelo texto.

## 2 · Saída — `out/<proj>/_reaproveitamento.json`

A lista ordenada dos trechos reaproveitados:

```json
{
  "modo": "filler",                    // "filler" (completa um vídeo) | "compilado" (vídeo inteiro)
  "piso_seg": 1800,                    // o piso a fechar (filler) ou a duração-alvo (compilado)
  "falta_seg": 600,                    // quanto o filler precisa cobrir (0 no compilado)
  "trechos": [
    {
      "fonte_youtube_id": "<id do vídeo publicado>",
      "fonte_titulo": "Como é morrer em cada planeta do sistema solar?",
      "formato_fonte": "assunto-unico",   // "assunto-unico" (usa inteiro) | "lista" (só tópicos)
      "in_sec": 0, "out_sec": 1200,       // o intervalo do vídeo-fonte usado
      "assunto": "Como seria morrer em cada planeta do Sistema Solar",  // título EXPLICATIVO (vira o rótulo do card de navegação) — NUNCA etiqueta vaga tipo "planetas"
      "usa_intro": true,                  // usou parte da intro do próximo vídeo na virada?
      "transicao_virada": "t1",           // a transição de marca ANTES deste trecho (null no 1º)
      "microcortes": [                    // OBRIGATÓRIO varrer (§6 do ofício): CTA/publi/encerramento
        { "de": 84, "ate": 90, "motivo": "CTA 'se inscreve no canal'" }  //  embutido + redundância factual
      ],                                  //  intervalos (rel. ao vídeo-fonte) REMOVIDOS de dentro do trecho
      "topicos": [ { "titulo": "Mercúrio", "in_sec": 60, "out_sec": 180 } ]  // só no formato "lista"
    }
  ]
}
```

O `microcortes` de um trecho pode ser `[]` — mas só depois de você ter OLHADO o texto e confirmado
que não há CTA/publi/encerramento embutido nem reexplicação de fato já dito. `[]` por não ter
varrido é defeito.

### 2.1 · Modo `compilado-tematico` — recompor vários vídeos do MESMO tema num arco novo

O schema acima descreve o compilado de vídeos-INTEIROS distintos (um por bloco) e o filler. O
**compilado temático** (FIN-19) é outra coisa: uma sequência **PLANA** de trechos que pula entre os
vídeos-fonte a cada card, ordenada por um ARCO DE BLOCOS. O schema que a montagem consome é este:

```json
{
  "modo": "compilado-tematico",
  "alvo_seg": 3600,                     // duração-alvo (piso do compilado; conta o material LIMPO)
  "blocos": ["INTRO","FINANCEIRO","GUERRA","ORDEM","SOCIAL","FUTURO","FECHO"],  // o arco, em ordem
  "trechos": [
    {
      "n": 1,                           // ordem no compilado (1..N), chave de montagem
      "video": "v1",                    // chave p/ _fonte/<video>.mp4 e _words/<video>.json
      "src_id": "<YouTube id>",         // proveniência real (vídeo publicado de onde veio)
      "ini": 0, "fim": 90, "dur": 90,   // intervalo no vídeo-fonte (fim = FIN-20; dur = fim-ini-Σcortes)
      "bloco": "INTRO",                 // a que bloco do arco pertence — a TRANSIÇÃO é DERIVADA daqui
      "assunto_orig": "Quem é Jiang Xueqin e os acertos...",  // o `assunto` do catálogo, preservado
      "titulo_novo": "Quem é o homem que previu Trump e a guerra do Irã",  // ESCRITO (FIN-19), ARTE-48
      "microcortes": [ { "de": 84, "ate": 90, "motivo": "CTA 'se inscreve'" } ],
      "finalizacao": false              // true só no fecho (encerramento de uma fonte, sem titulo_novo)
    }
  ]
}
```

Um bloco irmão, `finalizacao_detectada`, guarda o TETO de cada fonte (ofício §5d) — é o que a
validação usa e o que prova que a detecção rodou:

```json
"finalizacao_detectada": {
  "v1": { "creditos_membros_iniciam": 1327.1, "conteudo_limpo_ate": 1327.1 },
  "v3": { "creditos_membros_iniciam": 1403.2, "conteudo_limpo_ate": 1403.2 }
}
```

Diferenças que a montagem (`aplicar-reaproveitamento.mjs`) depende:
- **É uma sequência plana por `n`**, não agrupada por vídeo — o montador corta `[ini,fim]` de
  `_fonte/<video>.mp4` trecho a trecho e concatena na ordem de `n`.
- **A transição T1 é DERIVADA da mudança de `bloco`**, NÃO um campo por trecho: T1 só entra na
  FRONTEIRA de bloco (INTRO→FINANCEIRO→…); dentro do bloco a virada é só o card. A abertura que
  funde 2 fontes (FIN-19) não leva T1 entre elas. (Um temático tem ~35 emendas; T1 em toda emenda
  mataria a "sensação de UM vídeo".)
- **`titulo_novo` vira o card** de cada trecho (V3), menos o de `finalizacao:true`.
- **`finalizacao`** marca o fecho reusado de uma fonte (FIN-21), clampado pra não sobrepor o último
  tópico de conteúdo.

**Registre a composição também no banco** (`publicacao_fonte`): a relação vídeo↔fonte é dado
consultável, não só um json local.

## 3 · O que validar antes de entregar

> **As fronteiras têm gate automático** — `node scripts/compilado/validar-reaproveitamento.mjs
> --proj=<proj>` confere mecanicamente os cinco itens de fronteira abaixo (canônico, pontuação,
> teto da finalização, overlap, alvo) e **reprova com exit 1**. O montador
> (`aplicar-reaproveitamento.mjs`) o chama sozinho antes de cortar: plano inválido não vira vídeo.
> Rode-o você mesmo antes de entregar — não espere a montagem reprovar.

- **`ini` CANÔNICO**: todo `ini` corresponde ao `ini` de um segmento do catálogo (tolerância só a do
  snap de pontuação, ≤ 6 s). `ini` inventado é defeito, não estilo (ofício §5a).
- **FRASE FECHADA nas duas pontas**: a palavra em `fim` termina em `.`/`!`/`?`; a palavra em `ini` é
  a primeira DEPOIS de um fim-de-frase. Encostar em silêncio não basta (ofício §5c).
- **TETO da finalização**: `fim ≤ conteudo_limpo_ate` do fonte, sempre — a cartela de créditos de
  membros nunca entra (ofício §5d).
- **ZERO OVERLAP entre trechos do MESMO fonte**: `fim` de um nunca passa do `ini` do seguinte. Se
  passou, o snap avançou demais — recue (ofício §5).
- **A soma dos trechos fecha o piso** (filler) ou bate a duração-alvo (compilado), sem estourar.
- **Todo `fonte_youtube_id` existe** no acervo e no canal (proveniência real, não inventada).
- **Toda fronteira entre vídeos tem `transicao_virada`** (menos a primeira) — nunca colar seco.
- **Coerência de assunto**: todo trecho pertence ao nicho do vídeo-alvo.
- **`assunto` é um título EXPLICATIVO** (o que o tópico realmente diz), não uma etiqueta de 1–2
  palavras — é o que o espectador lê no card de navegação (feedback do Mateus, 23/jul).
- **`assunto` em frase formal do PT**: primeira letra maiúscula, nomes próprios maiúsculos, resto
  minúsculo — nunca 100% minúsculo (feedback do Mateus, 23/jul). O gerador ainda força a 1ª maiúscula
  como rede de segurança, mas grave certo.
- **Todo trecho foi VARRIDO por micro-cortes** (§6 do ofício): nenhum CTA/publi/encerramento de canal
  sobrou embutido, nenhum fato-âncora é reexplicado depois de um trecho anterior já o ter dado. Os
  cortes ficam em `microcortes[]` com motivo. Varra o texto lendo-o em SEQUÊNCIA de exibição — a
  redundância só aparece na ordem final, não trecho a trecho (regra viva do compilado, 23/jul).
- **O CTA foi julgado por RELEVÂNCIA TEMPORAL, com as duas datas na mão** (§1): cada CTA cortado tem
  motivo que diz por que VENCEU (`"Copa já ocorrida — fonte de abr/2026, hoje jul/2026"`), e cada CTA
  MANTIDO é perene (livro, clube, loja vigente). Cortar tudo é tão errado quanto não cortar nada.
- **A ORDEM das operações foi respeitada**: canônico → snap por pontuação → corte de CTA. Nenhum
  ajuste rodou DEPOIS do corte de limpeza (ofício §5). Sintoma de ordem invertida: um CTA que você
  já tinha cortado reaparece no texto final.
- **A duração conta o material LIMPO**: some `(out−in) − Σ microcortes` de cada trecho contra o
  piso/alvo. Micro-corte que derrubou abaixo do piso → puxe mais material, não devolva o lixo.
- **Nada repetido** sem motivo declarado.

## 4 · As ferramentas do compilado (`scripts/compilado/`)

Nenhuma delas é julgamento — são aritmética e medição. Não faça à mão o que elas fazem.

| Ferramenta | O que faz | Quando |
|---|---|---|
| `detectar-finalizacao.mjs <fonte.mp4> [janela=180]` | acha o início da **cartela de créditos de membros** pela assinatura visual (metade DIREITA da tela vira azul-forte e fica); imprime `{finalizacao_inicio, creditos_fim, conteudo_limpo_ate}` | 1× por vídeo-fonte, **antes** de fechar qualquer `fim` (ofício §5d) |
| `validar-reaproveitamento.mjs --proj=<proj>` | **GATE**: confere canônico · frase fechada · teto da finalização · overlap · alvo. Exit 1 reprova | antes de entregar, e de novo antes de montar |
| `aplicar-reaproveitamento.mjs --proj=<proj> --corte-base` | monta o corte cru (V1+A1) da Onda 1 (FIN-22); chama o validador antes de cortar | depois do plano aprovado pelo gate |

## 5 · A ordem de entrega: corte base ANTES do caro (FIN-22)

Duas ondas. **Onda 1 — CORTE BASE:** os trechos concatenados na ordem final, SEM cards, SEM
transições, SEM footage. É o que o Mateus assiste para validar o STORYTELLING (a ordem dos blocos).
Só depois do OK vem a **Onda 2**: `titulo_novo`, transições de bloco, cards, footage. Refazer a
ordem depois da Onda 2 joga fora N títulos + N caças; o corte base custa minutos de ffmpeg.

## 6 · Quem consome sua saída

- O **`designer-de-navegacao`** — usa `assunto` + os tempos para os cards de navegação/relógio.
- A **finalização** (`timeline-xml`) — monta os trechos + as transições de virada (T1) na timeline.
- Os **títulos de tópico** dos trechos reaproveitados — feitos pelo designer, dos títulos que você
  carregou em `topicos[]` / do vídeo-fonte.
