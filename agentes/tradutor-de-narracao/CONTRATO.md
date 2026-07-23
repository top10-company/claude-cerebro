# CONTRATO — Tradução de Narração com Encaixe no Tempo

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os nomes de campo e a forma dos arquivos não mudam de canal para canal. **Onde** o
> diretório do job vive é da instalação, e a marca ativa é que o declara.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `<JOB>/transcript/raw.json` | a transcrição CRUA do áudio: `{ language, text, segments[], words[] }` — `segments[]` são pedaços por pausa/pontuação, **não** frases | sim |
| a lista de idiomas-alvo | códigos de locale (`en-US`, `de-DE`, …) | sim |
| a tabela de velocidade de fala | `wordsPerSec` por idioma, declarada pela instalação | sim — é o que fixa o teto de palavras |
| a tela já traduzida, se existir | rótulos daquele idioma, para alinhar terminologia | não |

`<JOB>` = o diretório de trabalho do pipeline de dublagem. **A marca ativa declara o caminho real**;
sem marca declarada, peça-o em vez de adivinhar.

Mínimo aceitável para começar: `raw.json` com `words[]` **com tempo** e pelo menos um idioma-alvo. Sem
tempo por palavra não há agrupamento fiel nem teto de encaixe — reporte bloqueio.

## 2 · Saída

### 2.1 · A lista de frases (idioma de origem)
```
<JOB>/transcript/segments.json
```
Lista JSON de itens, `id` sequencial de 0 a N, **sem buracos**:

```json
{"id":0,"type":"speech","start":0.1,"end":9.8,"durationSec":9.7,"text":"Frase completa corrigida.","speaker":null,"source":"narrator"}
{"id":6,"type":"silence","start":39,"end":44.92,"durationSec":5.92,"text":"","speaker":null}
```

- `durationSec` = `end − start`, **2 casas**.
- `type` é `"speech"` ou `"silence"`. Silêncio tem `text` vazio.
- `speaker`: o locutor dominante por duração entre os pedaços da frase; `null` quando não há diarização.
- `source`: qual voz é aquela (narração × material de terceiro). A marca ativa define os valores válidos.

### 2.2 · A lista traduzida — um arquivo por idioma
```
<JOB>/translations/<lang>.json
```
**Mesma lista, mesmo tamanho, mesmos `id`/`type`/`start`/`end`/`durationSec`/`speaker`/`source`.
Só o `text` muda.** Itens de silêncio passam intactos, com `text` vazio.

### 2.3 · Por que o formato é inegociável
Estes dois arquivos são o **contrato de salto**: o pipeline de dublagem detecta que eles existem e
**pula** os próprios passos de formatação e tradução, indo direto para a síntese de voz. Formato errado
não dá erro — dá voz sintetizada em cima de lixo, e o custo é irreversível.

Você escreve os artefatos **antes** de o pipeline chegar nesses passos. Não rode os passos que você
substitui.

### 2.4 · Onde a produção enxerga o resultado
O pipeline **copia as traduções de volta** para a pasta da produção quando roda um passo posterior ao de
transcrição. É essa cópia que as etapas seguintes (tradução de tela, metadados) consomem como glossário —
por isso, **se você parar no passo de transcrição, o glossário não existe para ninguém**. Ao terminar,
confirme com a marca ativa qual passo materializa a cópia e reporte se ela ficou pendente.

## 3 · O que você valida ANTES de entregar

Programático, com o output real colado no relatório. Nenhuma checagem por amostragem.

| # | Checagem | Como |
|---|---|---|
| 1 | JSON válido em todos os arquivos | parser real (`python3 -m json.tool` ou `node -e`), não leitura visual |
| 2 | `id` de 0 a N, sequencial, sem buraco nem repetição | contagem programática |
| 3 | Campos que não são `text` **idênticos** entre `segments.json` e cada `translations/<lang>.json` | comparação item a item |
| 4 | **Zero resíduo do idioma de origem** nos traduzidos | busca por palavras funcionais frequentes da língua-fonte |
| 5 | **Encaixe**: nenhuma frase acima de `⌊durationSec × wordsPerSec⌋` | contagem por espaços, item a item, em todos |
| 6 | Silêncios preservados e **mesma contagem de itens** em todos os arquivos | contagem programática |

Falhou qualquer uma? **Conserte antes de entregar.** Um arquivo reprovado que segue para a síntese
queima crédito e volta como áudio inutilizável.

## 4 · Fronteiras de escopo

- Você **não sintetiza voz**, não mixa e não renderiza.
- Você **não altera o áudio**, o vídeo, o espelho da montagem nem qualquer timing.
- Você **não decide** o destino de conteúdo comercial/local — reporta com os `id` afetados.
- Você **não executa** os passos pagos que os seus artefatos substituem.

## 5 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- `raw.json` não existe, está vazio ou não tem tempo por palavra;
- a transcrição comprovadamente não é do áudio em questão (a última palavra cai depois do fim do áudio);
- falta a velocidade de fala do idioma pedido (sem ela não há teto — e sem teto não há encaixe);
- uma frase só cabe no teto se você cortar dado.

Em qualquer caso: diga o que tentou, o que encontrou, e qual é a saída recomendada.

## 6 · O relatório

Por idioma: nº de frases · as condensações mais agressivas (original → final + o teto que as forçou) ·
os `id` de conteúdo preso ao mercado de origem, com a decisão sugerida · as 6 checagens com números
reais · e se a cópia para a pasta da produção ficou pendente.
