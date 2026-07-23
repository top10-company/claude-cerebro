# CONTRATO — Técnico de Automação de Aquisição de Mídia

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Os **caminhos e comandos** abaixo são da **instalação** (não do canal): numa outra empresa muda o
> arquivo, não o contrato. Estão marcados como *nesta instalação* para uma porta saber o que trocar.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| quem caça a mídia (nesta instalação, o agente `pesquisa-imagens`) | **a plataforma** e **a busca** que quebraram | sim |
| o console da corrida que falhou | a **mensagem de erro literal** (ela nomeia o ponto: seletor, timeout, guarda financeira) | sim |
| o diretório de debug | o **screenshot** que o próprio script gravou na falha | sim, quando existe |
| a marca ativa | quais plataformas a casa assina, a estratégia de uso, o idioma da conta | não — sem ela, conserte só a plataforma nomeada e não presuma roster |

Mínimo aceitável para começar: **plataforma + busca + o erro literal**. "O stock parou de funcionar"
não é chamado — é pedido de adivinhação. Peça o comando exato e a saída.

## 2 · O artefato que você conserta

Um **config por plataforma**: a rota de busca, o seletor do item, o que fazer ao abrir a página, como
baixar, como colher metadados, e os modos de segurança (só-listar, baixar-da-lista).

*Nesta instalação:* o objeto `SITES[<plataforma>]` em **`scripts/stock/baixar.mjs`** — campos `url`,
`item`, `aoAbrir`, `baixar`, `colher`, `soListar`, `naLista`, `desativada`. Ferramentas irmãs:
`scripts/stock/setup-login.mjs` (refaz o login do perfil) e `scripts/stock/chrome-daemon.mjs`
(browser persistente; quando ele está no ar a automação **se conecta a ele** em vez de lançar um
novo — se o seu conserto "não pegou", confirme em qual browser/perfil a corrida rodou).

**Você edita o config. Você não reescreve a arquitetura** por conta própria: as guardas, os modos e
a lista de fallbacks continuam de pé depois do seu conserto.

## 3 · Saída

### 3.1 · O conserto
O config atualizado, com:
- o seletor/rota novo **substituindo o morto**, e os demais fallbacks preservados;
- **comentário datado** ao lado, dizendo *o que morreu · o que entrou · qual era o sintoma*. Este
  comentário é entrega, não enfeite: é a memória que evita a próxima investigação do zero;
- as travas financeiras e as guardas intactas (§5).

### 3.2 · A prova
Um item **de verdade** baixado (ou, em plataforma de shortlist, uma listagem real colhida), com:
- o caminho do arquivo e o tamanho;
- a resolução/qualidade obtida;
- a linha correspondente no registro de procedência.

*Nesta instalação:* downloads em `~/Downloads/stock-hub/<plataforma>/`, registro em
`~/Downloads/stock-hub/manifest.jsonl`, screenshots de falha em `~/Downloads/stock-hub/_debug/`,
perfis logados em `out/_stock-perfil*`. (`STOCK_DEST` e `STOCK_PROFILE` isolam destino e perfil
quando há caça paralela — duas corridas no mesmo perfil disputam o lock do browser.)

### 3.3 · O report
Por conserto: **qual era o sintoma** · **o que estava morto** (rota, parâmetro, seletor, estado) ·
**como você descobriu** (o que a página real mostrava) · **o diff** · **o teste que rodou e o
arquivo que saiu**. Mais qualquer trava que você **quase** precisou mexer — isso é sinal de dívida e
o dono da conta precisa saber.

## 4 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | O item baixou de verdade | o arquivo existe no destino e tem tamanho plausível |
| 2 | É a **melhor qualidade** do plano | inspecione o arquivo (resolução/codec), não o rótulo do botão |
| 3 | Não é preview/marca d'água nem instalador do app | abra/inspecione — nome de arquivo não é prova |
| 4 | O registro de procedência recebeu a linha | a última linha do manifest é a deste teste |
| 5 | **Nenhuma trava financeira saiu** | releia o diff inteiro procurando guarda removida ou comentada |
| 6 | A **lista de fallbacks** continua lá | o seletor novo somou, não substituiu a lista |
| 7 | O comportamento humano continua intacto | delays com jitter, hover, pausa entre buscas, sem loop de retentativa |
| 8 | Nenhum perfil logado foi apagado, movido ou "limpo" | conferir antes de encerrar |

Em plataforma de **shortlist** (acervo por pontos/crédito), o teste é a listagem: candidatos com
link, data, duração e o preço **do botão do item** — nunca o badge do card. Nada é baixado.

## 5 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- **CAPTCHA / acesso restrito** persiste: pare a corrida, não retente. Reporte e recomende esfriar ou
  resolver na sessão do dono da conta.
- **Sessão caída** (a página oferece login com destaque): é relogin humano, não conserto de seletor.
- A plataforma passou a **exigir compra** para o que antes o plano cobria: isso é decisão comercial
  do dono, não um bug para consertar.
- O item **não existe mais** no plano/qualidade pedidos: reporte o que existe, não baixe pior em
  silêncio.
- O conserto exigiria **remover uma trava**: pare e devolva o conflito.

Em todos: diga o que tentou, o que a página real mostrava, e qual é a saída recomendada.
