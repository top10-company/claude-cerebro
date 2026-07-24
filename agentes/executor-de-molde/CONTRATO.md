# CONTRATO — Executor de Molde

## Entrada
| Vem de | O que é |
|---|---|
| o espelho (`espelho.json`, uma cena) | o `modo` (que tem de ser um dos MOLDE), a âncora, `inSec`/`dur`, a tese |
| a mídia já pesquisada (`_media/`, `_pesquisa/`) | a foto/documento/footage REAL que a cena usa |
| o exemplar do modelo (a biblioteca de dourados) | a ESTRUTURA a copiar — nunca os números |
| a transcrição (`words.json`) | o timestamp real de cada palavra, para o word-lock |

## Saída
- **O HTML da cena**, no contrato de render da instalação (o palco e as funções que o motor chama).
- **Os gates rodados**, com o resultado — entrega sem gate não é entrega.

## O que validar antes de entregar
- O `modo` desta cena está na lista de MOLDE? Se não → devolve: é cena de invenção, não é sua.
- O conteúdo COUBE no molde (orçamento de texto, número de linhas)? Se estourou → escala.
- Word-lock: o elemento entra no timestamp REAL da fala?
- A mídia é a real e existe no disco? (`src` que não existe = tela quebrada no render)
- Os gates passam?

## Onde grava
O HTML da cena, na pasta de arte do projeto. Nada mais — ele não mexe no espelho nem na mídia.
