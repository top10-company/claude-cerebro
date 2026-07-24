# CONTRATO — Decupador

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal.
> A segunda metade da entrega (o espelho) segue `cerebro/agentes/montador/CONTRATO.md` §2.1 — não se
> duplica aqui.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/words.json` | transcrição do **BRUTO**, palavra a palavra com tempo — **com** os erros, retakes e pausas | **sim** |
| o vídeo bruto | o take contínuo do apresentador (`_bruto/origem/video.mp4` ou `_bruto.mp4`) | sim para o sync; a decupagem em si é por TEXTO |
| o áudio de microfone | o `.wav` do gravador separado, quando existe | só em dual-system |
| **o roteiro de origem** | o texto limpo, os títulos e as grafias canônicas | **sim — bloqueante** (OFÍCIO §2) |

⚠️ A transcrição tem que ser do **bruto**, não de uma versão já limpa: é justamente o lixo que você
precisa enxergar. E ela **mente sobre retake** — cruze com detecção de silêncio antes de decidir
qualquer corte (OFÍCIO §4).

## 2 · Saída

### 2.1 · A lista de spans — `out/<proj>/_cortes.json`

Array de spans em **segundos, tempo-BRUTO** (antes do ripple). ⚠️ O nome do arquivo é histórico: nem
todo span é corte. Um span com `manter: true` **fica no vídeo** (OFÍCIO §1) — ele mora nesta lista
porque é a mesma decisão ("o que eu faço com este trecho?"), e é o `manter` que impede o ripple de
comê-lo.

```json
[
  { "ini": 0, "fim": 27.36, "classe": "erro",
    "motivo": "Cabeça/mic-check: \"Não, está gravando. Chegou assim pra trás?\" + ~20,8s de silêncio antes da 1ª fala" },
  { "ini": 512.4, "fim": 519.1, "classe": "retake",
    "motivo": "Falso-início \"no espa--\"; o take completo vem em seguida" },
  { "ini": 733.2, "fim": 739.8, "classe": "riso-leve", "manter": true, "tratamento": "pb",
    "motivo": "Tropeça em \"arquipélago\" 3× e ri de si mesmo; o trecho é sobre pinguins — contexto leve" },
  { "ini": 902.0, "fim": 906.4, "classe": "riso-serio",
    "motivo": "Riu ao errar o nome do navio, mas o parágrafo é sobre as 1.500 mortes do naufrágio" }
]
```

**`classe` — vocabulário FECHADO** (o motivo em língua de máquina; OFÍCIO §9b):

| classe | o que é | ripple |
|---|---|---|
| `silencio` | respiro/silêncio morto aparado | corta |
| `erro` | errou e refez sem graça; mic-check, claquete, off-script | corta |
| `retake` | falso-início / take abortado; o take completo fica | corta |
| `riso-leve` | reação genuína em assunto **leve** | **PRESERVA** |
| `riso-serio` | riso que cai em assunto **sério** | corta |
| `titulo` | leitura de título de tópico = fronteira estrutural (OFÍCIO §7) | corta (vira gap) |
| `outro` | fora das anteriores — a prosa explica | corta |

- **`motivo` é obrigatório e específico**, sempre, além da classe. Ele é o artefato de revisão: quem
  discorda de um corte precisa poder fazê-lo sem reabrir o arquivo. Motivo genérico apaga informação.
  Num span **preservado** ele é ainda mais duro — aquele trecho **vai ao ar**: diga do que ele riu e
  por que o contexto é leve.
- **`classe: "riso-leve"` implica `manter: true` + `tratamento: "pb"`** (a leitura preenche os dois
  se você omitir). Preservado e colorido não existe: é a dessaturação que avisa o espectador de que
  aquilo é bastidor.
- ⚠️ **Span de classe `titulo` precisa ter a palavra "título" na prosa também.** Dois consumidores
  legados (`timeline-xml.mjs`, `qc-espelho-fala.mjs`) ainda detectam a fronteira por regex no
  `motivo`; sem a redundância, a leitura do título voltaria narrada. O gate cobra.
- Span **sem `classe` continua válido** (arquivo legado): a leitura infere `titulo` da prosa e, no
  resto, assume `outro`. Mas em produção nova, **classificar é obrigatório** — classe ausente joga
  seu julgamento fora.
- Os spans são **disjuntos** e ordenados. Isso vale para a lista INTEIRA: uma janela preservada
  dentro de um corte seria preservada e invisível.

### 2.1b · O descartado, recuperável — `out/<proj>/_cortes-removidos.json`

**Derivado, não escrito à mão.** `aplicar-cortes.mjs` grava, span a span, o `texto` que caiu dentro
dele, com a classe e o motivo. É o que cumpre o OFÍCIO §9b: o bruto é apagado do disco depois da
entrega, e sem este arquivo rever um corte semanas depois exige rebaixar o master e re-transcrever.
Você não produz este arquivo — você **confere** que ele saiu.

### 2.2 · A fala limpa — `out/<proj>/words-limpo.json`

O `words.json` menos as palavras que caem dentro dos cortes, no mesmo formato e no **mesmo relógio**
(tempo-BRUTO — quem aplica o ripple é quem monta a timeline). É o que o espelho e todas as etapas
seguintes usam como narração real.

⚠️ **Span preservado NÃO sai da fala limpa** — o trecho continua no vídeo, então as palavras dele
continuam aqui. Se saíssem, o espelho seria escrito sobre um texto que não é o do vídeo.

⚠️ **NÃO escreva este arquivo à mão.** Ele é 100% derivável do `words.json` + `_cortes.json`, e
transcrever 1.500–2.500 palavras é trabalho de script pago em inferência — com o agravante de que uma
palavra trocada no meio não tem como ser notada por ninguém. Rode:

```bash
node scripts/decupagem/aplicar-cortes.mjs <proj>     # deriva + valida (ou: top10 decupar <proj> --cortes)
```

O script também **executa as checagens da tabela §3** que dependiam de você lembrar: a conta fechar,
toda borda cair entre palavras, e nenhum dangler ter sobrado. Se ele reprovar, o defeito está no
`_cortes.json` — conserte as bordas ali e rode de novo.

### 2.3 · O sync, quando há dois aparelhos — `out/<proj>/_decupagem/sync.json`

`offsetVideoMenosMic` + a **confiança** da correlação. Confiança < ~0,3 = não confie; registre o aviso e
marque a junção para conferência humana.

### 2.4 · O espelho — `out/<proj>/espelho.json`

Sobre o **texto limpo**. Contrato completo em `cerebro/agentes/montador/CONTRATO.md` §2.1; schema
`contratos/espelho.schema.json`. Especificidades deste fluxo:

- **`inSec`/`dur` em tempo-BRUTO** — quem monta a timeline aplica o ripple dos cortes. Não pré-desconte.
- **Nenhuma cena cai dentro de um corte.** Uma cena ancorada em fala removida some da entrega
  silenciosamente.

### 2.5 · O report

- **a tabela de cortes** (span · texto removido · **classe** · motivo), corte a corte — é o artefato
  de revisão. Os spans **preservados** vão numa linha destacada: eles vão ao ar, e são a única
  decisão sua que o espectador vê;
- **as costuras de take** feitas para corrigir erro de fato, com o timestamp da junção, para audição
  humana;
- **as fronteiras estruturais** encontradas (leituras de título), com span e o título do documento;
- **as flags factuais e de grafia**: o que a transcrição garblou, o que o documento corrige, o que
  divergiu;
- o resumo do espelho (nº de cenas, modos, % de apresentador **descontados os cortes**) e as necessidades
  pendentes.

## 3 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | **A conta fecha**: `words == words-limpo + palavras dentro dos cortes`, exato, 0 vazamento | `node scripts/decupagem/aplicar-cortes.mjs <proj>` |
| 2 | **Toda borda cai em silêncio**, nunca no meio de palavra | idem — o script mede contra as fronteiras de palavra |
| 3 | **Nenhum dangler** sobrou antes de um corte | idem — o script pesca token abortado e palavra repetida na fronteira |
| 4 | Spans **disjuntos**, ordenados, dentro da duração do bruto | leitura do `_cortes.json` |
| 5 | **Toda `classe` é do vocabulário** e todo span preservado tem motivo específico | `aplicar-cortes.mjs` (checagens 5–7) |
| 6 | **O descartado sobrou**: `_cortes-removidos.json` escrito, com o texto de cada span | idem — é ele que grava |
| 7 | **A narração limpa lê coerente de ponta a ponta** | reconstruir o texto de `words-limpo.json` e LER |
| 8 | Nenhuma cena do espelho cai dentro de um corte | cruzar `inSec`/`dur` com os spans |
| 9 | **O apresentador ocupa a fatia de tela que a marca manda** | `node scripts/qc-tempo-apresentador.mjs <proj>` |
| 10 | O espelho passa no contrato | `node scripts/validar-contrato.mjs espelho out/<proj>/espelho.json` |
| 11 | Sync com confiança aceitável, ou o aviso registrado | `_decupagem/sync.json` |

⚠️ **Cena dentro de corte some da entrega.** O `timeline-xml` descarta silenciosamente a cena cujo
`inSec` cai num span cortado — exceto o card de título, que mora no corte por desenho. Quem verifica é
`node scripts/qc-espelho-fala.mjs <proj>`, que ainda cruza a `ancora` de cada cena com a transcrição e
diz **onde** a fala realmente acontece. Rode antes de entregar o espelho.

## 4 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- **o roteiro/documento de origem não foi obtido por nenhuma rota** (OFÍCIO §2) — sem ele não se decide
  take bom nem grafia nem título;
- o par vídeo+áudio está incompleto ou zerado;
- a transcrição falhou, ou o cruzamento com silêncio mostra buracos grandes que não foi possível
  recuperar (OFÍCIO §4);
- o sync não tem sinal e a entrega depende do corte de vídeo.

Nesses casos: diga o que tentou (rotas, comandos, arquivos), o que conseguiu produzir mesmo assim, e o
que exatamente falta.
