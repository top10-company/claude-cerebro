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

### 2.1 · A lista de cortes — `out/<proj>/_cortes.json`

Array de spans em **segundos, tempo-BRUTO** (antes do ripple):

```json
[
  { "ini": 0, "fim": 27.36, "motivo": "Cabeça/mic-check: \"Não, está gravando. Chegou assim pra trás?\" + ~20,8s de silêncio antes da 1ª fala" },
  { "ini": 512.4, "fim": 519.1, "motivo": "Retake — falso-início \"no espa--\"; o take completo vem em seguida" }
]
```

- **`motivo` é obrigatório e específico.** Ele é lido por um humano na revisão **e**, em algumas
  instalações, por máquina — um corte de **fronteira estrutural** precisa ser reconhecível pelo motivo
  (OFÍCIO §7). Motivo genérico apaga informação.
- Os spans são **disjuntos** e ordenados.

### 2.2 · A fala limpa — `out/<proj>/words-limpo.json`

O `words.json` menos as palavras que caem dentro dos cortes, no mesmo formato. É o que o espelho e todas
as etapas seguintes usam como narração real.

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

- **a tabela de cortes** (span · texto removido · motivo), corte a corte — é o artefato de revisão;
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
| 1 | **A conta fecha**: `words == words-limpo + palavras dentro dos cortes`, exato, 0 vazamento | comparação direta dos três arquivos |
| 2 | **Toda borda cai em silêncio**, nunca no meio de palavra | conferir `ini`/`fim` contra as fronteiras de palavra do `words.json` |
| 3 | **Nenhum dangler** sobrou antes de um corte | ler a palavra imediatamente anterior a cada `ini` |
| 4 | Spans **disjuntos**, ordenados, dentro da duração do bruto | leitura do `_cortes.json` |
| 5 | **A narração limpa lê coerente de ponta a ponta** | reconstruir o texto de `words-limpo.json` e LER |
| 6 | Nenhuma cena do espelho cai dentro de um corte | cruzar `inSec`/`dur` com os spans |
| 7 | O espelho passa no contrato | `node scripts/validar-contrato.mjs espelho out/<proj>/espelho.json` |
| 8 | Sync com confiança aceitável, ou o aviso registrado | `_decupagem/sync.json` |

⚠️ **Gate de plano dá FALSO-POSITIVO neste fluxo.** `scripts/checar-plano.mjs` mede em tempo-BRUTO e
**não lê o `_cortes.json`** — conta as regiões cortadas como "apresentador" e como "buracos",
reportando ~30–40% de rosto onde o real é ~10–15%. Calcule descontando os cortes; não reporte o número
cru. (Melhoria pendente: fazer o `checar-plano` ler o `_cortes.json`.)

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
