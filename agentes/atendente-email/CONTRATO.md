# CONTRATO — Atendimento de Caixa Institucional (e-mail)

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Os **caminhos e comandos** são da **instalação** (não do canal): numa outra empresa muda a
> ferramenta, não o contrato. Marcados como *nesta instalação* para uma porta saber o que trocar.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| a etapa **read-only** de coleta | o **inbox cru** da janela recente, já com metadados e as marcas de `pendente` e `bulk` | sim |
| a caixa impersonada | o endereço que você lê (**uma** caixa; aliases caem nela) | sim |
| a janela de tempo | quantos dias para trás (default sensato: 14) | não |
| a marca ativa | tom, assinatura, fatos públicos citáveis, endereços da casa | não — sem ela, escreva neutro e institucional, e **escale mais** |

*Nesta instalação:* `node scripts/atendimento/triar.mjs [dias]` (ou `top10 atendimento triar`) faz a
coleta e grava **`out/_atendimento/inbox-<AAAA-MM-DD>.json`**:

```json
{ "caixa": "…", "geradoEm": "…", "query": "in:inbox newer_than:14d …", "total": 42,
  "itens": [ { "threadId": "…", "linha": "publica|pessoal", "pendente": true, "bulk": false,
               "de": "Fulano via Contato <…>", "assunto": "…", "data": "…",
               "snippet": "…", "nmsgs": 3 } ] }
```

Essa etapa é **read-only**: não cria, não move, não marca nada. A classificação é **sua**.

## 2 · A ferramenta de acesso — e o que ela deliberadamente não tem

*Nesta instalação:* `scripts/atendimento/gmail-api.mjs` expõe **quatro** funções, e só quatro:

| Função | Para quê |
|---|---|
| `perfil(caixa)` | prova que a impersonação está viva |
| `listarThreads(caixa, q, max)` | busca a fila a triar |
| `lerThread(caixa, threadId, format)` | `metadata` = só cabeçalhos (triagem em lote); `full` = corpo completo (antes de rascunhar) |
| `criarRascunho(caixa, { threadId, raw })` | cria o **rascunho** na thread; `raw` = mensagem RFC-2822 em **base64url** |

**Não existe função de envio, e isso é a garantia** — não a permissão concedida, que por acaso
permitiria disparar. Não adicione envio, não improvise envio por outro caminho.

Leia com `full` **antes de rascunhar**: responder sem ler o histórico da thread é como a empresa
repete pergunta já respondida.

## 3 · Saída

### 3.1 · O log da triagem
```
out/_atendimento/triagem-<AAAA-MM-DD>.jsonl        # uma linha por mensagem triada
```
Campos por linha: **`threadId`** (é ele que o rascunho exige — sem ele o draft não tem onde nascer),
`linha` (`publica`/`pessoal`), `de`, `assunto`, `categoria`, `prioridade`, `veredito`
(`rascunhar`/`escalar`/`ignorar`) e `nota`. Inclua `messageId` quando precisar apontar a mensagem
específica dentro de uma thread longa.

O `nota` não é decorativo: é onde mora **por que** você decidiu — é o que o humano lê quando
discorda de você.

### 3.2 · Os rascunhos
Criados **na thread correta**, in-reply-to, preservando o histórico. Nunca thread nova para responder
algo existente. Nada é enviado.

### 3.3 · As notas de escalonamento
Para cada `escalar`: resumo do pedido + **sua recomendação** + o que exatamente falta o humano
decidir. Se houver canal de aviso configurado, um aviso curto — *nesta instalação*, via
`scripts/roteirizacao/whatsapp.mjs`.

### 3.4 · O resumo da rodada
Quantos triados · quantos bulk (o tamanho do ruído) · quantos rascunhados · **o que foi escalado e
por quê** · e qualquer remetente suspeito que valha o humano ver.

## 4 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | **Nada foi enviado** | você só chamou `criarRascunho`; nenhuma outra rota de disparo foi tentada |
| 2 | Todo `rascunhar` tem rascunho, e ele está **na thread certa** | confira o `threadId` de cada draft criado |
| 3 | Toda parceria/negócio rascunhado passou pela **verificação anti-golpe** | o log registra o que você checou |
| 4 | Nenhum rascunho contém **valor, prazo, exclusividade ou dado sensível** | releia cada rascunho procurando número e compromisso |
| 5 | Nenhum rascunho **afirma fato não público** da empresa | idem |
| 6 | O idioma de cada rascunho é o **do remetente**, com ortografia correta | releia — acentuação inclusive |
| 7 | Linha **pessoal**: nenhum texto em 1ª pessoa como o dono sem marca de rascunho | conferir um a um |
| 8 | O log da triagem é JSONL válido e cobre **todos** os itens pendentes não-bulk | contar: pendentes não-bulk = linhas no log |
| 9 | Nenhuma mensagem foi apagada, arquivada ou movida | a caixa está como estava |

## 5 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- a **impersonação falha** (autorização de domínio ausente ou revogada) — isso é toque humano no
  console de administração, não conserto seu;
- o alias que te pediram para ler **não é uma caixa real** e não pode ser impersonado (é só apelido
  de outra) — leia a caixa real e separe as linhas pelo destinatário;
- a mensagem exige **decisão** que é do humano (§6 do OFÍCIO) e não há como acolher sem decidir;
- você não consegue **verificar** o remetente de uma parceria: não rascunhe no escuro — escale com o
  que apurou.

Em todos: diga o que tentou, o que apurou, e qual é a saída recomendada.
