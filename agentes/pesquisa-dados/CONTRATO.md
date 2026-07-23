# CONTRATO — Pesquisa de Dados

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | cenas com `needs.dados` preenchido ou `modo` de dados | sim |
| `out/<proj>/words.json` | a fala real — o que a narração **afirma** sobre o número | sim (é contra ela que se verifica) |
| a marca ativa | como o dado aparece na tela (rótulo, atribuição, idioma da legenda) | não |

Inclui o **dado implícito**: quando a fala afirma uma relação sem citar o número, a série real é
necessária do mesmo jeito.

## 2 · Saída

### 2.1 · O dado, por cena
```
out/<proj>/_dados/<cena>.json
```
```json
{
  "valores": [{ "label": "…", "valor": 0, "unidade": "…" }],
  "unidade": "unidade dominante da série",
  "fonte": "Instituto/órgão que PRODUZ o dado",
  "url": "https://…",
  "dataDoDado": "2025",
  "dataConsulta": "2026-07-22",
  "legenda": "explicação da unidade/sigla em 2 segundos",
  "nota": "metodologia, recorte, ressalva — e a divergência com a narração, se houver"
}
```
Pronto para quem vai visualizar: valores numéricos de verdade (não strings formatadas), série
completa quando há superlativo/comparação.

### 2.2 · O registro na pauta
```
out/<proj>/_pesquisa/pauta-dados.json
```
Um shard por agente, validado por `contratos/pauta-pesquisa.schema.json`. Núcleo obrigatório:
**`fonte` · `arquivo` · `licenca`** — aqui `arquivo` é o `_dados/<cena>.json` e `licenca` é a
condição de uso do dado (ex.: `"CC-BY (dados abertos do órgão)"`, `"uso editorial com atribuição"`).

### 2.3 · O fact store (reuso entre produções)
Dado verificado e reutilizável entre vídeos entra no fact store da instalação
(`src/agent/dados-biblioteca.mjs`, cache em `assets/dados/`). É o que evita pagar duas vezes pela
mesma verificação.

### 2.4 · O report
Por cena: **o dado**, a **fonte exata (url)**, a **data**, e **qualquer divergência** com o que a
narração afirma. Divergência nunca é omitida.

## 3 · O que você valida ANTES de entregar

| # | Checagem |
|---|---|
| 1 | JSON válido e parseável |
| 2 | Todo valor tem **unidade**; a série é numérica, não texto formatado |
| 3 | **Ordem de grandeza** coerente com a narração (fator 1000 = unidade trocada) |
| 4 | **Fonte primária confirmada** — não é agregador, não é imprensa |
| 5 | `url` abre e contém o número (você conferiu, não presumiu) |
| 6 | Superlativo/comparação vem com a **classe inteira** |
| 7 | A pauta passa no contrato: `node scripts/validar-contrato.mjs pauta-pesquisa out/<proj>/_pesquisa/pauta-dados.json` |

## 4 · Bloqueio

`NÃO ENCONTRADO` é entrega válida e deve vir com: fontes consultadas, termos usados, o que existe de
mais próximo, e a recomendação (mudar a abordagem da cena, usar um proxy declarado como proxy, ou
cortar a afirmação numérica).
