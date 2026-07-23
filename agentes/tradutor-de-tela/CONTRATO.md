# CONTRATO — Tradução de Tela

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal. Quais gates existem e
> com que teto eles rodam é da instalação — a marca ativa declara.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/graphics/*.html` | as cenas originais, **somente leitura** | sim |
| `<lang>` | o locale-alvo (`en-US`, `de-DE`, …) | sim |
| a lista de cenas | quais traduzir nesta rodada | sim — trabalhar "todas" sem lista é como se perde cena |
| `out/<proj>/dub/translations/<lang>.json` | a narração já traduzida = **o seu glossário** | não — mas se existe, é obrigatório usar |
| a marca ativa | pisos de texto, fonte, teto de blocos, nomes que não se traduzem | não — sem ela, `marcas/_neutra/identidade.md` |

Se o glossário **não existe**, verifique antes se ele apenas não foi materializado (há pipelines em que a
tradução da narração vive no diretório do job e só é copiada para a produção num passo posterior). Traduzir
a tela sem consultar um glossário que existia é criar divergência de graça.

## 2 · Saída

```
out/<proj>/graphics-<lang>/<cena>.html
```

Um arquivo por cena, **clonado da original e editado no clone**. Mesmo nome de arquivo, mesma estrutura,
mesma animação, mesmos tempos. A pasta `graphics/` sai **intocada** da sua passagem — se `git status`
mostrar qualquer original modificada, você errou.

## 3 · O que você valida ANTES de entregar — por cena

Nenhuma das checagens é opcional, e nenhuma delas custa inferência.

| # | Checagem | Por quê |
|---|---|---|
| 1 | **O contrato de render sobreviveu à edição** | é o defeito que só aparece no render, tarde e caro |
| 2 | **Nenhuma colisão de caixas de texto** | texto mais longo = risco novo que a original não tinha |
| 3 | **Blocos simultâneos dentro do teto da marca** | tradução que vira duas linhas pode empurrar a contagem |
| 4 | **Sintaxe de cor íntegra** (nenhum literal corrompido) | edição de texto encosta em atributo por acidente |
| 5 | **Glifos acentuados/especiais do idioma-alvo desenham certo** | idioma novo pede glifo que a cena nunca desenhou |
| 6 | **Frames capturados e OLHADOS**: início · beat de cada bloco de texto · fim | o gate não vê hífen feio, viúva, nem texto que ficou no idioma de origem |
| 7 | **Zero resíduo do idioma de origem** no arquivo entregue | passa em todos os gates numéricos e reprova no ar |
| 8 | **Nenhum texto abaixo do piso da marca ativa** | o piso não cede para a tradução |

Os **comandos** de cada gate e os **números** (piso, teto de blocos) são da instalação: veja
`marcas/<canal>/agentes/tradutor-de-tela.md`.

## 4 · Fronteiras de escopo

- Você **não renderiza**. Um idioma inteiro é **LOTE**, e lote tem caminho de render próprio na
  instalação — não empurre o pipeline para o caminho de peça avulsa, que costuma serializar e travar
  outras sessões.
- Você **não edita a cena original**, o espelho da montagem, o áudio nem o XML.
- Você **não muda dado, cor, mídia nem timing**.
- Você **não decide** o que é marca e o que não é — a marca ativa lista o que não se traduz; na dúvida,
  pergunte em vez de traduzir.

## 5 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- a cena original já falha nos gates **antes** de você tocar nela (o defeito é de origem, não seu — e
  traduzir por cima o esconde);
- o texto não cabe no piso nem depois de reescrito mais curto (a cena precisa de rework de layout, que é
  trabalho de arte, não de tradução);
- o glossário da narração contradiz o que a cena afirma (um dos dois está errado, e não é você quem
  decide qual);
- a cena depende de um trocadilho, rima ou jogo visual com a palavra que **não existe** no idioma-alvo.

Em qualquer caso: diga o que tentou, o que encontrou e qual é a saída recomendada.

## 6 · O relatório

Por cena: o que traduziu · os ajustes de layout que precisou fazer (reescrita, quebra, redução de corpo,
com o valor final) · os gates verdes com o output real · quantos frames olhou e o que viu · e as decisões
de glossário que tomou (termo escolhido e por quê), porque elas valem para o projeto inteiro.

No fim da rodada: a lista de cenas entregues, a lista de cenas bloqueadas com o motivo, e o glossário
consolidado do idioma.
