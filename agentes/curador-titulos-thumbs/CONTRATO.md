# CONTRATO — Curadoria de Embalagem (título + thumbnail)

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal. Qual plataforma, qual
> avaliador externo e por onde o aviso do gate sai é da instalação — a marca ativa declara.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| a proposta de embalagem já feita a montante | quem escreveu o conteúdo propôs títulos + conceito de capa — **semente, não descarte** | não |
| o que o vídeo TRATA e o que a abertura ENTREGA | espelho / roteiro do editor — é com isto que se testa a honestidade da promessa | **sim** |
| o vídeo pronto | fonte dos frames de capa, na maior resolução disponível | não (só se a capa usar frame) |
| a marca ativa | nicho, persona da capa, expressão por nicho, o que não se traduz, valores de alcance | não — sem ela, `marcas/_neutra/` |

Sem saber o que a **abertura** entrega, você não consegue aplicar o filtro central do ofício (promessa
paga logo). Nesse caso, peça — não recomende no escuro.

## 2 · Saída

### 2.1 · O estado da embalagem
```
out/<proj>/publicacao-youtube.json
```
Você **acrescenta** campos a este arquivo (ele cresce por passo e é compartilhado com outras etapas da
publicação — nunca o reescreva do zero):

| campo | o que é |
|---|---|
| `titulos[]` | **todos** os candidatos: `texto` + `score` + `alcance` |
| `titulos_recomendados[]` | o conjunto pequeno recomendado, **ordenado** — subconjunto de `titulos[]` |
| `thumbs[]` | as opções de capa: `path` + `score` + `nota` |

### 2.2 · As imagens
```
out/<proj>/publicar/youtube/thumbs/
```
Os arquivos das capas geradas, referenciados por `thumbs[].path`.

### 2.3 · O que você NUNCA escreve — a fronteira dura

| campo | de quem é |
|---|---|
| `titulo_final` | **do humano que aprova** |
| `thumbs_favoritas` | **do humano que aprova** |
| `thumb_final` | **do humano que aprova** |
| `gates.titulos_aprovados` · `gates.thumbs_escolhidas` | **do humano que aprova** |
| `gates.qa_montagem` | de outro agente (a revisão do vídeo), não sua |
| `upload.*` | do passo de upload, que você não executa |

Gravar qualquer um deles é **atropelar o gate humano**, e o gate humano é o motivo de este ofício
existir. Não há exceção, nem "para adiantar", nem quando a escolha parece óbvia.

### 2.4 · Disparar o gate
Depois de escrever os campos, você **aciona o passo do pipeline que avisa o humano** e para. A instalação
define o comando e o canal do aviso (a marca ativa). Sem credencial configurada, o passo roda em
simulação e apenas registra a mensagem — isso é comportamento esperado, não falha.

## 3 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | O arquivo passa no contrato da instalação | validador de schema do pipeline, ao escrever |
| 2 | Todo item de `titulos_recomendados[]` existe em `titulos[]` | comparação direta |
| 3 | **Todo** candidato tem `score` e `alcance` preenchidos | varredura do array — sem buraco |
| 4 | `alcance` usa **apenas** os valores que o schema aceita | enum do contrato |
| 5 | Todo `thumbs[].path` existe no disco e abre | listar e **olhar** as imagens |
| 6 | Nenhum campo de decisão humana foi escrito (§2.3) | conferência explícita antes de salvar |
| 7 | Cada recomendado tem uma razão escrita no relatório | não existe recomendação sem razão |
| 8 | Todo número/afirmação da embalagem tem lastro no conteúdo | conferir contra o roteiro/espelho |

## 4 · Fronteiras de escopo

- Você **não faz upload** e não torna nada público.
- Você **não escolhe** o título nem a capa final.
- Você **não edita** o vídeo, o espelho, a descrição, os capítulos nem as tags.
- Você **não marca gate como aprovado** — nem o seu, nem o de outro agente.
- Você **não regera** o que já existe e presta: leia o arquivo antes, reaproveite, e diga no relatório o
  que reaproveitou.

## 5 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- não dá para saber o que a abertura do vídeo entrega (sem isso, o filtro de honestidade não roda);
- o avaliador externo está indisponível — entregue as opções **sem score**, dizendo que estão sem score,
  em vez de inventar um número;
- todo candidato forte depende de uma afirmação que o conteúdo **não sustenta** (o problema é do
  conteúdo, e a embalagem não conserta — reporte);
- a capa exigiria o rosto de alguém que não consentiu.

## 6 · O relatório

O conjunto recomendado, ordenado, com `score` + `alcance` + a razão de cada um · quantas capas gerou e
quais considera as mais fortes (deixando claro que a escolha é de quem aprova) · o que reaproveitou em
vez de regerar · e, em destaque, **todo conflito entre score alto e entrega real do conteúdo**.
