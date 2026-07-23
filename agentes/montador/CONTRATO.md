# CONTRATO — Montador

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/words.json` | a fala real transcrita, **palavra a palavra com tempo** | **sim** — é o eixo de todo o espelho |
| `out/<proj>/transcript.txt` | a mesma fala corrida, para leitura | não (conveniência) |
| `out/<proj>/_analise/segmentos.json` | a **decupagem do material já editado**: mapa plano-a-plano do que existe | só no fluxo "já editado por terceiros" |
| `out/<proj>/espelho.json` **anterior** | o espelho vigente, quando isto é um **re-espelho** | **sim, se existir** — é o que preserva identidade (OFÍCIO §8) |
| o roteiro de origem | a grafia canônica de nomes próprios e os títulos de capítulo | não, mas é o que vence a transcrição |
| a marca ativa | cardápio de tipos de cena, proporções, peças de acabamento | não — sem ela, use o vocabulário canônico do §2.1 |

⚠️ **`words.json` tem que ser a transcrição do material que vai ser EDITADO** — o master, no fluxo
pré-editado; a fala já limpa, no fluxo do zero. Transcrição de outra versão do áudio produz um espelho
cujos tempos não existem no vídeo.

Mínimo aceitável para começar: **`words.json` com tempos**. Sem tempo por palavra não há word-lock, e
sem word-lock não há espelho — só uma lista de ideias. Reporte bloqueio.

## 2 · Saída

### 2.1 · O espelho — `out/<proj>/espelho.json`

O artefato principal. Formato validado por `contratos/espelho.schema.json`.

```json
{
  "tema": "…",
  "paleta": "…",
  "segmentos": [
    {
      "id": "s07-nome-estavel",
      "inSec": 63.8,
      "dur": 10.9,
      "anima": true,
      "modo": "dados",
      "titulo": "rótulo legível — pode mudar à vontade",
      "tese": "conceito + dado + emoção-alvo + semente (≤6 palavras)",
      "ancora": "o trecho exato da narração que esta cena cobre",
      "motivo": "por que esta cena existe / por que este veredicto",
      "midia": "animacao",
      "midia_termos": ["…"],
      "midia_necessidade": "…",
      "needs": { "geo": [], "dados": [] }
    }
  ]
}
```

Obrigatórios por segmento: `id` · `inSec` · `dur` · `anima` · `modo` · `titulo` · `tese` · `ancora` ·
`motivo` · `needs` · `midia`.

- **`id`** — a identidade da cena. **Imutável, nunca derivada do `titulo`, nunca reemitida num
  re-espelho** (OFÍCIO §8). Onde a instalação tem banco, o vínculo durável é o identificador opaco
  (`cena.cena_uid`, ULID, em `db/schema.sql`) e o `id` é o rótulo legível.
- **`inSec` / `dur`** — em segundos, alinhados à grade de frames da entrega e às fronteiras de palavra.
  **Esta é a fonte única do timing** (OFÍCIO §7.1). A primeira edição tem `inSec: 0`.
  No fluxo com corte de material bruto, `inSec` é **tempo-BRUTO** (antes do ripple); quem monta a
  timeline aplica os cortes.
- **`anima`** — `false` = a janela fica com o material de origem (o rosto do apresentador, o plano da
  equipe), sem cena nova por cima.
- **`modo`** — **vocabulário FECHADO**, definido no schema. Aponta o tipo de cena do cardápio da marca.
  Não invente valor ad-hoc.
- **`tese`** — semente, não encenação (OFÍCIO §9).
- **`ancora`** — o trecho literal da narração que a cena cobre. É o que torna a decisão auditável.
- **`needs`** — o que a cena precisa e você **não** vai inventar: `geo` (lista de
  `{tipo, id, rotulo}`) e `dados` (lista de descrições). Ambos obrigatórios — lista vazia é resposta
  válida, campo ausente não é. É este campo que dispara a pesquisa.
- **`midia` / `midia_termos` / `midia_necessidade`** — só quando a cena é de **sujeito real
  fotografável**. Numa cena de desenho, `midia_termos` é engessamento: não crave (OFÍCIO §10).

### 2.2 · A decupagem enriquecida — `out/<proj>/_analise/segmentos.json`

Só no fluxo "já editado por terceiros". O arquivo chega de um analisador determinístico com
`tipo:"?"`, `qualidade:null`, `veredito:null`, `motivo:null` e o campo `recorrente` já preenchido
(repetição visual detectada automaticamente). **Você reescreve o próprio arquivo** preenchendo, por
plano: `tipo` · `qualidade` · `veredito` · `motivo` (OFÍCIO §3–§4). Schema:
`contratos/decupagem.schema.json`.

O `motivo` de cada cena no espelho **reflete** o veredicto da decupagem — não reinventa uma justificativa
nova.

### 2.3 · O report (o que você devolve por escrito)

- **nº de cenas por tipo** e cobertura total;
- **% de tempo com o material de origem em tela** (o rosto do apresentador), e como está distribuído;
- **cenas com necessidade pendente** (geo / dados / mídia) — é a fila da pesquisa;
- **todo trecho que ficou sem cobertura, e por quê** (decisão, não esquecimento);
- **divergências factuais**: grafia de nome próprio que a transcrição garblou, data/número que a fala diz
  e a fonte contradiz;
- num **re-espelho**: quantas identidades foram **preservadas**, quantas morreram e quantas nasceram — e a
  confirmação de que a interseção com os artefatos em disco **não** é zero.

## 3 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | O espelho passa no contrato | `node scripts/validar-contrato.mjs espelho out/<proj>/espelho.json` |
| 2 | A decupagem enriquecida passa no contrato | `node scripts/validar-contrato.mjs decupagem out/<proj>/_analise/segmentos.json` |
| 3 | Nenhum plano classificado ficou com `qualidade`/`veredito` nulos | leitura do próprio arquivo |
| 4 | Nenhum plano com `recorrente` não-vazio ficou em `manter` sem motivo explícito | idem |
| 5 | **A primeira edição tem `inSec: 0`** | leitura do espelho |
| 6 | **Zero sobreposição e zero gap acidental** entre cenas consecutivas | ordenar por `inSec` e conferir `inSec[n] + dur[n]` contra `inSec[n+1]` |
| 7 | **Zero janela de material de origem com 0 < dur < 2 s** | o complemento da união das janelas com `anima:true` |
| 8 | Tempos cravados em fronteira de palavra | `node scripts/alinhar-timestamps.mjs <espelho.json> <words.json> --dry` |
| 9 | Distribuição / cobertura / variedade de tipos | `node scripts/checar-plano.mjs out/<proj>/espelho.json` — advisory |
| 10 | **Num re-espelho: a interseção de `id` com o espelho anterior e com os artefatos em disco NÃO é zero** | comparar as listas de `id` |

⚠️ **`checar-plano.mjs` exige o caminho do arquivo.** Passar a pasta (`out/<proj>`) aborta com `EISDIR`;
passar só o slug faz ele procurar o nome legado `plano-roteirista.json`. Use o caminho completo do
`espelho.json`.

⚠️ **`alinhar-timestamps.mjs` deixa 0,05 s de folga antes da cena seguinte** e força `dur ≥ 2 s`. Isso
**contradiz** o "zero gap" do OFÍCIO §7 — rode-o com `--dry` para achar os tempos que não caem em palavra,
e feche os gaps você mesmo. Não aceite a saída dele como final sem reconferir a checagem 6.

## 4 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- não existe `words.json`, ou ele não tem tempo por palavra;
- o `words.json` é de uma versão do áudio diferente da que vai ser editada;
- é um re-espelho e o espelho anterior sumiu (escrever um espelho novo por cima **destrói identidade**);
- o roteiro de origem é necessário para desambiguar grafia/estrutura e não foi possível obtê-lo.

Nesses casos: diga o que tentou, o que conseguiu montar mesmo assim, e o que exatamente falta para
fechar.
