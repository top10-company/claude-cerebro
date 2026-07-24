# CONTRATO — QC Visual

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/graphics/<cena>.html` | a cena pronta a julgar (o arquivo, não uma descrição dela) | sim |
| `out/<proj>/espelho.json` | a **tese** da cena, o `modo`, a janela (`inSec`/`dur`) e a paleta do vídeo | sim — sem a tese não dá pra julgar *abordagem* nem *acessibilidade* |
| `out/<proj>/words.json` | a fala transcrita palavra a palavra com tempo — o trecho da janela | sim — é o que dá o **word-lock** e o **anti-eco** |
| a marca ativa | alvos de tamanho, teto de blocos simultâneos, paleta, corpus de leis da casa | não — sem ela, julgue por §5/§8 do OFÍCIO |

Você é acionado em dois momentos: **depois que a cena fecha e antes de renderizar**, ou para
**auditar cena existente** sob feedback. Nos dois casos a entrada é a mesma.

## 2 · Saída — o LAUDO

```
out/<proj>/qc/<cena>.laudo.json
```

Um laudo por cena. Formato validado por `contratos/laudo-qc.schema.json`:

```json
{
  "cena": "<id-da-cena>",
  "aprovado": false,
  "gatesDuros": ["tamanho", "colisao"],
  "lentes": [
    {
      "lente": "espaco",
      "nota": 5,
      "problemas": ["a fala citada está a 132px — piso do palco 4K é 260px (o gate ficou verde porque mediu a aspa decorativa de 560px)"],
      "correcoes": ["subir .falaLine para 260px e re-quebrar a fala em mais blocos; não encolher a fonte para caber"]
    }
  ]
}
```

- `lentes[].lente` só aceita os 9 nomes canônicos: `espaco` · `factual` · `wordlock` · `abordagem` ·
  `acessibilidade` · `poluicao` · `motion` · `fonte` · `tema`. Os 9 entram **sempre**, inclusive os
  que passaram — laudo parcial não é laudo.
- `nota` inteiro 0–10. `problemas` e `correcoes` são **arrays obrigatórios** (vazios quando a lente
  passa limpa).
- `gatesDuros` = nomes dos gates determinísticos **ainda reprovando**. Array vazio quando todos passam.
- **`aprovado: true` só com TODAS as lentes ≥7 E `gatesDuros` vazio.** Não existe aprovação "com
  ressalva" — ressalva vira nota <7 ou vira observação num problema de lente que passou.

### 2.1 · O laudo é lido por um gate — ele não é decorativo

```bash
node scripts/qc-laudo.mjs out/<proj>                      # todos os laudos do projeto
node scripts/qc-laudo.mjs out/<proj>/graphics/<cena>.html  # o laudo daquela cena
```

Exit 1 quando há cena com `aprovado:false` não reconciliada — e isso **barra o render**. Reconciliar
é uma de duas coisas, nunca uma terceira:

1. a cena foi **corrigida** e você **re-julgou** (novo laudo, `aprovado:true`); **ou**
2. o laudo foi marcado **`"resolvido": true`** com o motivo escrito.

**Não se apaga laudo para passar no gate.** Apagar julgamento pago é a única forma de fraude que o
gate não pega sozinho.

### 2.2 · O report (o que você devolve por escrito)

Por cena: o **veredito** (aprovado/reprovado) · a **nota de cada lente** · os **gates que rodaram e o
que cada um mediu** (com a contagem de itens auditados) · os problemas em ordem de gravidade, cada um
com a **correção acionável** · e o caminho do laudo gravado.

## 3 · Os gates — que **outro** roda, e você lê

Rodam **antes** de você e vetam sozinho. **O agente de criação os roda e conserta até o verde ANTES
de te entregar a cena** (`top10 qc out/<proj>` = a varredura determinística de todas as cenas). Numa
cena que chegou à sua bancada eles já passaram; você **lê o veredito, não reexecuta** (OFÍCIO §2.1).

| # | Gate | O que veta | Runner (quem roda antes de você) |
|---|---|---|---|
| 1 | Contrato de cena | sem `__renderAt`/`__duracao`; `Date.now(`/`Math.random(`/`@keyframes` | `scripts/qc-contrato.mjs` |
| 2 | Colisão de texto (bbox medido) | par de textos visíveis sobreposto em qualquer frame | `scripts/check-overlap.mjs` |
| 3 | Excesso simultâneo | pico de blocos acima do teto da marca | `scripts/guard-rail.mjs --max=<teto>` |
| 4 | **Tamanho de texto** | texto abaixo do piso do palco (ornamento já EXCLUÍDO) | `scripts/qc-tamanho.mjs` |
| 5 | Til do Bold | Ã/Õ maiúsculo em weight 600–749 | `scripts/_audit-til.mjs` |
| 6 | src apontando pro vazio | `src`/`href` de mídia inexistente | `scripts/qc-src-existe.mjs` |
| 7 | Crédito-fantasma | crédito de mídia na tela sem a mídia | inspeção do frame (sua) |

**O gate 4 TEM runner vivo** — é o `scripts/qc-tamanho.mjs`, que detecta o palco, deriva o piso da
REND-15, **exclui o ornamento tipográfico** (aspa/divisor, via `scripts/qc-ornamento.mjs`) e reprova
o maior texto REAL abaixo do piso de herói. A antiga instrução "meça o tamanho à mão porque o
ornamento engana o gate" está **REVOGADA**: o gate não é mais enganado. Você não remede tamanho.

Só o **crédito-fantasma** (gate 7) continua sendo olho seu — é o único que régua nenhuma pega. Ao ler
qualquer gate: confira a **contagem de itens auditados** (OFÍCIO §4); *"0 de 0"* é verde vazio.

## 4 · Os frames — como você produz a evidência

```bash
node scripts/shot.mjs <html> <t> /tmp/qc-<t>.png     # 1 frame no tempo t; sem PAGEERROR
```

Amostre no **início**, em **cada beat de entrada** de elemento e no **fim**; cena com movimento pede
frames extras no meio. **Abra cada PNG e olhe** (Read) — o frame gerado e não olhado não conta.

`shot.mjs` respeita o palco declarado da cena, então o frame já sai nas coordenadas certas para medir.

## 5 · O que você valida ANTES de entregar o laudo

| # | Checagem | Como |
|---|---|---|
| 1 | Os frames existem e você **olhou** todos | Read em cada PNG gerado |
| 2 | Os 9 nomes de lente estão no laudo, nenhum faltando | releitura do JSON |
| 3 | `aprovado` é coerente com as notas e os gates | TODAS ≥7 **e** `gatesDuros` vazio |
| 4 | O laudo é JSON válido e passa no contrato | `node scripts/validar-contrato.mjs laudo-qc out/<proj>/qc/<cena>.laudo.json` |
| 5 | O gate lê o que você gravou | `node scripts/qc-laudo.mjs out/<proj>` |

## 6 · Fronteira e bloqueio

**Você não edita a cena.** Reprovou? O laudo vai para quem desenha. Se a correção exigir mídia que
não existe, diga isso — a saída é pesquisa nova ou troca de abordagem, nunca improviso do QC.

Reportar bloqueio é entrega válida. Bloqueie quando:

- a cena não abre / o HTML dá erro de página → não há o que julgar, é defeito de render a consertar antes;
- falta a tese (espelho) ou a fala (`words.json`) da janela → sem elas, *abordagem*, *acessibilidade*
  e *wordlock* não são julgáveis, e um laudo com essas três chutadas é pior que nenhum;
- a mídia da cena está quebrada no frame (imagem/vídeo ausente) → isso é falha de produção, não nota
  de lente: reporte como bloqueio para não gastar o julgamento inteiro numa cena que vai mudar.
