# CONTRATO — Pesquisa de Documentos

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | as cenas que citam matéria, estudo, relatório ou documento | sim |
| `out/<proj>/words.json` | a fala real — **o que precisa ser confirmado na fonte** e o word-lock do grifo | sim |
| a marca ativa | template do clipping, cor do grifo, idioma da tela, pisos de texto | não — sem ela, entrega dados + prova |

## 2 · Saída

### 2.1 · O pacote do documento
```
out/<proj>/_media/documento/<slug>-prova.png      # a captura da página real (prova, ≤40 MP)
out/<proj>/_media/documento/<slug>-p1.jpg         # página de PDF rasterizada, quando o objeto importa
```

### 2.2 · Os dados do clipping (é isto que a cena consome)
Veículo/instituição · manchete exata · data · autor · url ou DOI · idioma original · o **texto dos
trechos a grifar**, na ordem, com o tempo de entrada de cada um (word-lock a partir de `words.json`)
· a nota de tradução, se houve.

### 2.3 · O registro na pauta
```
out/<proj>/_pesquisa/pauta-documentos.json
```
Um shard por agente, validado por `contratos/pauta-pesquisa.schema.json`. Núcleo obrigatório:
**`fonte` · `arquivo` · `licenca`** — `fonte` é o **veículo/journal**, não o agregador.

### 2.4 · A cena
Só quando há marca injetada: o HTML do clipping montado no template dela. **Sem marca, não monte** —
entregue os dados acima e a prova, e deixe a montagem para quem tem a identidade visual.

### 2.5 · O report
A **fonte exata (url/DOI)**, a confirmação de que **a citação está na fonte** (com o trecho literal),
se traduziu, e o arquivo gerado. **Divergência entre fonte e narração vem primeiro no report.**

## 3 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | A url/DOI abre e é a fonte primária | você abriu |
| 2 | **A afirmação da narração está na fonte** | trecho literal citado no report |
| 3 | Manchete, veículo e data são os reais | comparação com a página |
| 4 | Toda imagem **≤40 MP** | `identify -format "%w×%h %[fx:w*h/1e6]MP %b\n" <arquivo>` |
| 5 | Texto legível no frame (PDF rasterizado na resolução certa) | olhar o frame |
| 6 | A pauta passa no contrato | `node scripts/validar-contrato.mjs pauta-pesquisa out/<proj>/_pesquisa/pauta-documentos.json` |

Se você **também** montou a cena (marca injetada):

| # | Checagem | Como |
|---|---|---|
| 7 | Desenha sem erro e o grifo avança | `node scripts/shot.mjs <html> <t> /tmp/d.png` em 2–3 tempos — **olhe os frames** |
| 8 | Não virou sopa de rótulos | `node scripts/guard-rail.mjs <html> --max=<teto da marca>` |

## 4 · Bloqueio

Fonte não existe, não é localizável, ou **não confirma** a narração → pare e reporte, com o que a
fonte de fato diz. Trocar por uma fonte "parecida" que confirma o que se queria ouvir é o oposto
deste ofício.
