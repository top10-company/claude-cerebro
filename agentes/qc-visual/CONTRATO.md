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

## 3 · Os gates que você roda

Rodam **antes** das lentes. Cada um veta sozinho.

| # | Gate | Comando | Veta quando |
|---|---|---|---|
| 1 | Contrato de cena | `node scripts/qc-contrato.mjs <html>` | sem `window.__renderAt`/`__duracao`; usa `Date.now(`/`Math.random(`/`@keyframes` |
| 2 | Colisão de texto (bbox medido) | `node scripts/check-overlap.mjs <html>` | qualquer par de textos visíveis sobreposto em qualquer frame |
| 3 | Excesso simultâneo | `node scripts/guard-rail.mjs <html> --max=<teto da marca>` | pico de blocos-de-informação acima do teto |
| 4 | Tamanho de texto | **medição à mão nos frames** (§5 do OFÍCIO) | qualquer texto abaixo do piso do palco |
| 5 | Hex corrompido | `grep -oE '#[0-9A-Fa-f]{3,8}[a-z]' <html>` | **qualquer** match (tem que voltar vazio) |
| 6 | Crédito-fantasma | inspeção do frame | crédito de mídia na tela sem a mídia na tela |

⚠️ **O gate 4 não tem runner determinístico vivo nesta instalação** — o script histórico
(`scripts/qa-final.mjs`) passou a ler `espelho.json` (lia `plano-roteirista.json` e ficava CEGO em 11 de 18 projetos, saindo exit 0 sem auditar nada) e delega o tamanho ao `scripts/qc-tamanho.mjs`
por nada em produção. Enquanto for assim, **tamanho é medição sua, à vista, elemento por elemento** —
e é exatamente o gate que o ornamento tipográfico engana (OFÍCIO §4).

⚠️ `check-overlap.mjs` **não** detecta palco 4K (roda sempre em viewport 1920) e resolve o caminho
**relativo ao diretório de trabalho** — passe o caminho relativo, e trate a saída como indício a
confirmar à vista, não como veredito.

A marca acrescenta os gates dela (bug de fonte, auditoria tipográfica, o que for). Ao usar qualquer
um: **leia a contagem de itens auditados** antes de aceitar o verde (OFÍCIO §4).

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
| 2 | O palco da cena foi identificado antes de aplicar piso | inspeção do `<html>` (marca de palco) |
| 3 | Os 9 nomes de lente estão no laudo, nenhum faltando | releitura do JSON |
| 4 | `aprovado` é coerente com as notas e os gates | TODAS ≥7 **e** `gatesDuros` vazio |
| 5 | O laudo é JSON válido e passa no contrato | `node scripts/validar-contrato.mjs laudo-qc out/<proj>/qc/<cena>.laudo.json` |
| 6 | O gate lê o que você gravou | `node scripts/qc-laudo.mjs out/<proj>` |

## 6 · Fronteira e bloqueio

**Você não edita a cena.** Reprovou? O laudo vai para quem desenha. Se a correção exigir mídia que
não existe, diga isso — a saída é pesquisa nova ou troca de abordagem, nunca improviso do QC.

Reportar bloqueio é entrega válida. Bloqueie quando:

- a cena não abre / o HTML dá erro de página → não há o que julgar, é defeito de render a consertar antes;
- falta a tese (espelho) ou a fala (`words.json`) da janela → sem elas, *abordagem*, *acessibilidade*
  e *wordlock* não são julgáveis, e um laudo com essas três chutadas é pior que nenhum;
- a mídia da cena está quebrada no frame (imagem/vídeo ausente) → isso é falha de produção, não nota
  de lente: reporte como bloqueio para não gastar o julgamento inteiro numa cena que vai mudar.
