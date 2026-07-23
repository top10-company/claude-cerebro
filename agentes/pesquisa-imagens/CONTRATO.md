# CONTRATO — Pesquisa de Imagens

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | cenas com `midia` = footage \| foto \| drone, mais `midia_necessidade`, `midia_termos` e a `tese` | sim |
| `out/<proj>/words.json` | a fala real — de onde sai o detalhe concreto da query e a duração da cena | sim |
| a marca ativa | formato/resolução do master, doutrina de mídia do canal, pastas | não — sem ela, use o formato declarado pelo pipeline |

## 2 · Ferramentas desta instalação

```bash
node scripts/stock/baixar.mjs <plataforma> "<query>" --n=3 --tipo=video   # --n=3 SEMPRE explícito
node src/agent/upscale-tools.mjs                                          # upscale local não-generativo
ffprobe / ffmpeg                                                          # gate de codec (OFICIO §10)
```

**Quais plataformas a instalação assina** (e as travas de compra/pontos de cada uma) é configuração —
a marca ativa aponta o catálogo. Acervos abertos para histórico, que independem de assinatura:
bibliotecas nacionais, arquivos públicos, coleções abertas de museu, repositórios de mídia livre e o
arquivo nacional do país do tema.

## 3 · Saída

### 3.1 · Os arquivos
```
out/<proj>/_media/footage/<cena>/…      # vídeos, já compatíveis com o motor de render
out/<proj>/_media/foto/<cena>/…         # imagens, ≤40 MP
```
Nomes claros (o que é, não `download_2.mp4`).

### 3.2 · O registro na pauta
```
out/<proj>/_pesquisa/pauta-imagens.json
```
Um shard por agente, validado por `contratos/pauta-pesquisa.schema.json`. Núcleo obrigatório:
**`fonte` · `arquivo` · `licenca`**, por arquivo. Enriqueça com `resolucao`, `codec`, `cena`,
`validado_por_visao`, `por_que_esta`.

### 3.3 · A shortlist de acervo pago
Quando a melhor mídia está num acervo que cobra crédito/ponto: **não baixe**. Entregue a shortlist
com link, o porquê de cada item e o preço lido **no botão de download do item** (ou
`preço: a confirmar`). A cena que depende disso fica **pendente e declarada** — as outras seguem.

### 3.4 · O report
Por cena: arquivos baixados (caminho + fonte + licença + resolução), **o que validou por visão**, e a
recomendação de uso. Nunca toque nos HTMLs das cenas.

## 4 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | Cada arquivo mostra o assunto exato e o sujeito domina o quadro | você abriu e olhou |
| 2 | Comparou os 3 candidatos, não pegou o primeiro | evidência no report |
| 3 | **Codec/pix_fmt compatíveis** | `ffprobe` (OFÍCIO §10) — transcode feito quando preciso |
| 4 | Imagem **≤40 MP** | `identify -format "%w×%h %[fx:w*h/1e6]MP %b\n" <arquivo>` |
| 5 | Formato e resolução batem com o master de entrega | `ffprobe` width/height |
| 6 | Cena longa tem variedade suficiente (3–5 mídias, não 1 clipe segurado) | contagem por cena |
| 7 | Nenhuma compra, nenhum crédito gasto sem autorização | histórico do que rodou |
| 8 | A pauta passa no contrato | `node scripts/validar-contrato.mjs pauta-pesquisa out/<proj>/_pesquisa/pauta-imagens.json` |

## 5 · Conferindo o resultado depois

⚠️ Na galeria de revisão, cena com `<video>` pode **parecer estática**: a cena usa seek puro
(`currentTime = f(t)`), que não reproduz ao vivo. A galeria contorna isso (`window.__PREVIEW`), mas
**"estático na prévia" não é "footage ruim"** — confira no render antes de concluir que a mídia é má.

## 6 · Bloqueio

Cena que depende de acervo pago fica **pendente e declarada** (`out/<proj>/_pendencias-<acervo>.md`),
e as outras seguem — este ofício **não trava a produção**. Busca que não achou nada real: reporte os
termos usados e proponha o beat alternativo.
