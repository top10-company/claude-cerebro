# CONTRATO — Pesquisa Geo

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | `needs.geo` das cenas: `{ tipo, id, rotulo }` — tipo = país \| unidade federativa \| estado estrangeiro \| cidade \| rota \| outro | sim |
| a marca ativa | idioma e grafia do rótulo na tela | não |

## 2 · Saída

### 2.1 · A geometria
```
assets/geojson/<slug>.json        # FeatureCollection válida, WGS84, já simplificada para a cena
```
É acervo **da instalação**, não da produção: geometria serve todos os vídeos, por isso não vive
dentro de `out/<proj>/`. Depois de salvar, regenere o catálogo:
```bash
node scripts/build-geo-manifest.mjs
```

### 2.2 · O registro na pauta
```
out/<proj>/_pesquisa/pauta-geo.json
```
Um shard por agente, validado por `contratos/pauta-pesquisa.schema.json`. Núcleo obrigatório:
**`fonte` · `arquivo` · `licenca`** (`arquivo` = o caminho do GeoJSON; `licenca` = PD / citável /
ODbL-com-atribuição).

### 2.3 · O report
Por item: **arquivo salvo**, **fonte exata (url)**, **licença**, **nº de features**, e o
**bbox/centro de sanidade** que você conferiu.

## 3 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | É FeatureCollection e a contagem bate | `node -e "const g=require('./assets/geojson/<slug>.json'); console.log(g.type, g.features.length)"` |
| 2 | Geometria não-vazia (nenhuma feature sem coordenada) | inspeção do JSON |
| 3 | **bbox/centro batem com o lugar real** | comparar com coordenada de referência conhecida |
| 4 | Coordenadas em graus decimais lon/lat (WGS84) | olhar os primeiros pares |
| 5 | Peso compatível com uma cena | `ls -lh` — grande demais, simplifique |
| 6 | Licença anotada | no shard da pauta |
| 7 | A pauta passa no contrato | `node scripts/validar-contrato.mjs pauta-pesquisa out/<proj>/_pesquisa/pauta-geo.json` |

## 4 · Fronteira com quem desenha

Você entrega **geometria + licença + report**. Você **não** desenha a cena de mapa, não escolhe base
de satélite, não define câmera nem paleta — isso é do agente de mapa da marca ativa.

## 5 · Bloqueio

Não achou geometria real da área pedida? **Pare e reporte**: o que procurou, onde, e o que existe de
mais próximo (ex.: a divisão administrativa de nível acima). Nunca entregue aproximação desenhada.
