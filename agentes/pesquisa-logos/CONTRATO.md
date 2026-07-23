# CONTRATO — Pesquisa de Logos

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | as cenas que citam entidade (empresa, órgão, instituição, imprensa, país, estado) | sim |
| `out/<proj>/words.json` | a fala real — confirma **qual** entidade e em que contexto/país | sim |
| a marca ativa | contraste esperado (fundo claro × escuro), pisos de tamanho, se leva variante branca | não |

## 2 · Saída

### 2.1 · O arquivo
```
out/<proj>/_media/logo/<slug>.svg      # preferencial
out/<proj>/_media/logo/<slug>.png      # quando não existe vetor — fundo transparente, ≤40 MP
out/<proj>/_media/logo/<slug>-branca.svg|png    # variante monocromática, quando o fundo pedir
```

### 2.2 · O registro na pauta
```
out/<proj>/_pesquisa/pauta-logos.json
```
Um shard por agente, validado por `contratos/pauta-pesquisa.schema.json`. Núcleo obrigatório:
**`fonte` · `arquivo` · `licenca`**. Enriqueça com `entidade`, `variante_branca`, `resolucao`,
`validado_por_visao`.

### 2.3 · O report
Por entidade: **qual é**, **fonte exata (url)**, **formato e dimensões**, **se gerou variante**,
**onde salvou**, e a confirmação de que olhou e é a versão atual.

## 3 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | O arquivo abre e é a entidade certa | você abriu e olhou (Read) |
| 2 | É a **versão atual** da marca | conferido contra o site oficial |
| 3 | Fundo transparente (ou recorte feito) | inspeção visual |
| 4 | **≤40 MP** em raster | `identify -format "%w×%h %[fx:w*h/1e6]MP %b\n" <arquivo>` |
| 5 | Proporção intacta, sem esticar | inspeção visual |
| 6 | Legível sobre o fundo em que vai entrar (variante gerada se preciso) | comparar com o fundo da cena |
| 7 | A pauta passa no contrato | `node scripts/validar-contrato.mjs pauta-pesquisa out/<proj>/_pesquisa/pauta-logos.json` |

## 4 · Fronteira

Você entrega **o arquivo pronto para compor**. Onde a logo entra na tela, em que tamanho e sobre qual
fundo é decisão de quem monta a cena — a marca ativa declara os pisos.

## 5 · Bloqueio

Não existe símbolo oficial acessível? Entregue o **nome da entidade** como texto e reporte: o que
procurou, onde, e por que não achou. Nunca desenhe uma aproximação.
