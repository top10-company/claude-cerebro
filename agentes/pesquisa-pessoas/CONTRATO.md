# CONTRATO — Pesquisa de Pessoas

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | as cenas que citam pessoa (`modo`/`needs` de pessoa): **nome**, contexto, id da cena | sim |
| `out/<proj>/words.json` | a fala real transcrita, palavra a palavra com tempo | sim — é o que dá a grafia falada, a **fala citada** e o word-lock |
| a marca ativa | template, paleta, pisos, idioma da tela | não — sem ela, entrega só o pacote de dados |

Mínimo aceitável para começar: **nome + contexto suficiente para desambiguar** (cargo, instituição,
país ou época). Sem isso, não é pesquisa — é chute: peça o contexto ou reporte bloqueio.

## 2 · Saída

### 2.1 · O arquivo de imagem
```
out/<proj>/_media/pessoa/<slug>.png        # ou .jpg — a subpasta é o `tipo` do contrato de pauta
```
Já tratado (recortado, upscalado se precisava, **≤40 MP**) e já compatível com o render.

### 2.2 · O registro na pauta — é isto que torna a entrega auditável
```
out/<proj>/_pesquisa/pauta-pessoas.json
```
**Um shard por agente** (há seis `pesquisa-*` escrevendo em paralelo e não existe lock: arquivo único
seria corrupção garantida). Formato validado por `contratos/pauta-pesquisa.schema.json` — o núcleo
obrigatório é **`fonte` · `arquivo` · `licenca`**, e o resto enriquece:

```json
{
  "proj": "<slug-do-projeto>",
  "agente": "pesquisa-pessoas",
  "itens": [
    {
      "tipo": "pessoa",
      "quem": "Nome Completo",
      "funcao": "Função conforme a fonte (sem anos de vida)",
      "fonte": { "provedor": "Site oficial da <instituição>", "pagina_url": "https://…", "download_url": "https://…" },
      "url": "https://…",
      "licenca": "uso editorial (retrato institucional)",
      "arquivo": "_media/pessoa/<slug>.png",
      "cena": "s07",
      "resolucao": "2048×2560 (5,2 MP)",
      "validado_por_visao": true,
      "por_que_esta": "retrato oficial publicado pela própria instituição, identificado na legenda"
    }
  ]
}
```

- `licenca: "desconhecida"` é resposta **inválida** — sem licença, não usa.
- `fonte: "internet"` / `"?"` não é fonte.
- **Fallback documentado** (foto não existe): registre mesmo assim, com
  `"arquivo": null`-equivalente omitido do shard e o motivo no report — e avise em voz alta, porque
  a cena muda de abordagem.

### 2.3 · O report (o que você devolve por escrito)
Por pessoa: **quem é** · a **fonte exata (url)** · que **verificou a identidade por visão** · o
**arquivo gerado** e suas dimensões/MP · a licença · e qualquer divergência entre o que a produção
afirma e o que a fonte diz (grafia do nome, cargo, data).

## 3 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | O arquivo existe e abre | `identify -format "%w×%h %[fx:w*h/1e6]MP %b\n" <arquivo>` |
| 2 | **≤40 MP** (depois do upscale, não antes) | mesma medida acima |
| 3 | **É a pessoa certa** | você abriu a imagem e olhou (Read) |
| 4 | **Rosto inteiro** no quadro, sem decapitar | olhando o arquivo tratado |
| 5 | A pauta é JSON válido e passa no contrato | `node scripts/validar-contrato.mjs pauta-pesquisa out/<proj>/_pesquisa/pauta-pessoas.json` |
| 6 | Grafia do nome confere com a fonte | comparação direta |

Se a sua entrega **também** inclui a cena montada (só quando há marca injetada), acrescente:

| # | Checagem | Como |
|---|---|---|
| 7 | A cena desenha sem erro e o rosto aparece inteiro | `node scripts/shot.mjs <html> <t> /tmp/p.png` → **olhe o frame** |
| 8 | Não virou sopa de rótulos | `node scripts/guard-rail.mjs <html> --max=<teto da marca>` |

## 4 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- a pessoa não pôde ser desambiguada (contexto insuficiente);
- não existe foto em fonte autorizada **e** a busca está documentada como esgotada;
- a única imagem disponível é proxy impreciso e a produção exige legendá-la com o nome.

Nesses casos: diga o que tentou (queries, fontes consultadas), o que encontrou de mais próximo, e
qual é a saída recomendada (fallback de nome+função, trocar a abordagem da cena, ou pedir decisão).
