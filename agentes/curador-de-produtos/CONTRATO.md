# CONTRATO — Curador de Produtos

> O que recebe · o que entrega · onde grava · o que valida. Caminhos relativos à produção.

## 1 · Entrada

> **Comece pela ferramenta, não pelo marketplace na mão.** No estúdio Top10,
> `top10 shopping <proj> --nicho=<n> --tema="<t>" [--tipo=conhecimento|solucao]` roda a busca nos
> marketplaces, **avalia o vendedor** e grava o resultado. Ela consulta as APIs com a credencial do
> canal (ver §5) e cai em modo honesto (bloqueio explicado) quando falta credencial — nunca inventa.

| Vem de | O que é | Obrigatório |
|---|---|---|
| **`nicho`** | o nicho do canal a que o vídeo pertence (`espaco`, `historia`, `geopolitica`…) — a coleção do YouTube Shopping é **por nicho** | sim |
| **`tema`** | o assunto concreto do vídeo (não o nicho): "colapso da Idade do Bronze", "sono e longevidade" — é dele que sai a query e o julgamento de "melhora a vida" | sim |
| **`tipo`** | `conhecimento` (livro/curso sobre o assunto) ou `solucao` (objeto que resolve um problema que o vídeo tornou visível) | recomendado |
| `proj` | o projeto de origem, para amarrar a indicação ao vídeo e ao gancho do roteiro | quando houver |
| a marca ativa | o critério do que "melhora a vida" desse público + a taxonomia de nichos | sim |
| a **credencial de API** do canal (`ML_CLIENT_ID/SECRET`, `SHOPEE_APP_ID/SECRET`) | o que autentica a busca e a medição de reputação; **sem ela, bloqueio honesto** (§5) | para dado real |

## 2 · Saída — `out/<proj>/shopping.json` + tabela `produto_indicado`

A curadoria vira **duas coisas**: um json local que o roteirista/QR consomem, e linhas na base
`produto_indicado` do `estudio.db` (a fonte consultável, alimenta a coleção por nicho).

```json
{
  "nicho": "historia",
  "tema": "colapso da Idade do Bronze",
  "tipo": "conhecimento",
  "produto": "1177 a.C. — O Ano do Colapso da Civilização (Eric Cline)",
  "opcoes": [
    {
      "plataforma": "mercadolivre",
      "url_publica": "https://produto.mercadolivre.com.br/MLB-…",
      "link_afiliado": null,                    // preenchido quando há credencial de afiliado; null + pendência sem ela
      "preco": 54.90, "moeda": "BRL",
      "vendedor": "Livraria …",
      "reputacao": { "level_id": "5_green", "power_seller": "platinum", "positive": 0.98, "total": 12873 },
      "aprovado": true,
      "medido_em": "2026-07-24T12:00:00Z",
      "porque": "MercadoLíder Platinum, 98% positivo, 12k vendas — o livro exato, capa em português"
    }
  ],
  "midia_uri": "…/1177ac-capa.jpg",             // a CAPA/objeto, nunca o print da loja (PESQ-22)
  "motivo": null                                 // preenchido (e opcoes:[]) quando NENHUM vendedor passou
}
```

Com **nenhum vendedor aprovado**, `opcoes:[]`, `produto:null` e `motivo` obrigatório ("nenhum
vendedor com reputação verde/≥500 vendas para este tema"). Isso é entrega válida — não force.

## 3 · O que validar antes de entregar

- **Todo vendedor foi MEDIDO, não estimado.** Cada `opcao.aprovado:true` carrega a `reputacao` real
  lida da plataforma + `medido_em`. Opção sem reputação medida **não entra** (ausência = reprovação).
- **O filtro do vendedor foi aplicado** (ofício §2): ML = verde **ou** MercadoLíder + ≥500 vendas +
  ≥90% positivo; Shopee = ratingStar ≥4,7 **ou** loja oficial + ≥500 vendas + comissão > 0.
- **3 a 8 opções do MESMO tipo de produto**, de ML **e/ou** Shopee, para o espectador escolher onde
  comprar. Uma opção só de uma plataforma só é aceitável se a outra genuinamente não tinha vendedor
  aprovado (registre por quê).
- **A `midia_uri` é do OBJETO** (foto/vídeo do produto), **nunca** um screenshot do marketplace
  (PESQ-22). Se só houver o print, a mídia fica pendente — não se entrega a vitrine.
- **O link**: de afiliado quando há credencial; **público + `link_afiliado:null` + pendência** quando
  não. Nunca um link inventado, nunca um encurtador que não decodifica para o produto certo.
- **`produto:null` ⇒ `motivo` presente.** Sem produto honesto, o campo diz por quê.
- **Coerência com o tema**: cada opção é do assunto do vídeo, não do nicho genérico. O livro é sobre
  Troia, não "um livro de história qualquer".

## 4 · As ferramentas (`scripts/shopping/`)

Nenhuma delas é julgamento — são busca, medição e registro. Não faça à mão o que elas fazem.

| Ferramenta | O que faz | Quando |
|---|---|---|
| `top10 shopping <proj> --nicho --tema` (→ `curar.mjs`) | busca ML+Shopee, **avalia o vendedor**, escolhe as opções, grava `shopping.json` + `produto_indicado` | ao curar a indicação de um vídeo |
| `mercadolivre.mjs buscar "<q>"` | busca + reputação do vendedor via API OAuth (client_credentials); dry-run honesto sem `ML_CLIENT_*` | 1 marketplace isolado / depuração |
| `shopee.mjs buscar "<q>"` | busca + loja via Shopee Affiliate GraphQL (assinado); dry-run honesto sem `SHOPEE_*` | 1 marketplace isolado / depuração |
| `top10 shopping qr <proj> [--at mm:ss]` (→ `qr-produto.mjs`) | gera o **QR do link de afiliado** (branco s/ transparente, decode-validado) + overlay no beat do produto — **mesmo mecanismo do `publi-insert.mjs`** | depois de curar, no beat da indicação |
| `top10 shopping colecao <nicho>` (→ `colecao-nicho.mjs`) | prepara a **coleção por nicho** (≥3 produtos) até a porta: payload da Merchant API + comando pronto; **criar de fato é passo humano** (Merchant Center do canal) | quando o nicho junta 3+ produtos |

## 5 · O passo humano: credencial e coleção

- **Mercado Livre**: registrar um app em `developers.mercadolibre.com` → `ML_CLIENT_ID` +
  `ML_CLIENT_SECRET` no `.env`. A API é OAuth (`grant_type=client_credentials`); **sem credencial os
  endpoints devolvem 403** (medido 24/jul/2026). O **link de afiliado** se gera no painel de
  afiliados do canal — sem essa conta, entrega-se o link público + pendência.
- **Shopee**: App ID + secret do **Shopee Affiliate** → `SHOPEE_APP_ID` + `SHOPEE_SECRET`. GraphQL
  assinado (SHA256); a geração do short-link de afiliado é da própria API.
- **Coleção**: criar/editar a coleção do YouTube Shopping exige acesso ao **Merchant Center / YouTube
  Studio** do canal — decisão do dono. O agente **prepara** o payload e o comando; o dono aprova e
  executa. (A Content API for Shopping morre em 18/ago/2026 — usar a **Merchant API** nova.)
