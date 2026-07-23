# DOMÍNIO — produção de vídeo determinística

> Inteligência de **um ofício**: transformar roteiro em vídeo por HTML renderizado, com qualidade
> de broadcast e sem retrabalho manual. Vale para qualquer canal, de qualquer empresa.
>
> Nada aqui é de uma marca específica. A paleta, a tipografia, o catálogo de modelos e os alvos de
> tamanho de um canal vivem na **marca** dele, não aqui. Isto é o método.
>
> Carregue só se a tarefa for produção de vídeo. Quem não faz vídeo não lê.

---

## 1 · O princípio: determinismo

Uma cena é uma página que se desenha igual toda vez que roda. **O render lê a página quadro a
quadro seguindo o tempo — nunca deixa a animação correr sozinha.** É isso que faz o mesmo roteiro
produzir o mesmo vídeo em qualquer máquina, e o que permite renderizar em paralelo sem medo.

O contrato mínimo de uma cena:

- expõe **uma função que recebe o instante `t`** e desenha o quadro daquele instante;
- expõe **a duração** da cena;
- **é proibido tudo que muda entre execuções**: relógio do sistema, aleatório sem semente, animação
  por temporizador. Se precisa de acaso, use gerador com semente fixa. Se precisa de movimento, ele
  é função de `t`, não do relógio.

Quebrar isso quebra a reprodutibilidade, e o sintoma aparece tarde: o quadro renderizado não bate
com o previsto, e ninguém sabe por quê.

---

## 2 · Qualidade é piso, não meta

**Trabalhe sempre na resolução final de entrega, nativa.** Não produza pequeno para "escalar
depois" — ampliar depois é perda que não volta. Se a máquina não dá conta, renderize mais devagar,
nunca menor.

**Há dois tipos de tamanho de texto, e confundi-los é o erro mais comum:**

- **Piso** — abaixo disso não se lê na tela. É limite físico do meio, vale em qualquer canal.
- **Alvo** — o tamanho que um canal específico escolhe, acima do piso. Isso é gosto, é da marca.

O piso pertence ao ofício; o alvo pertence à marca. Um canal pode querer título maior que outro;
nenhum pode pôr legenda que não se lê numa TV.

**Meça o texto que importa, não o maior da tela.** Uma verificação que só olha o maior elemento
passa como boa uma cena onde o texto que o espectador de fato lê está pela metade do piso — porque
o maior era um ornamento decorativo. Ornamento tipográfico (aspa gigante, número marca-d'água) sai
da conta explicitamente, e a verificação relata o que ignorou.

---

## 3 · Mídia real

**O que representa algo verdadeiro usa registro verdadeiro.** Lugar real pede imagem real do lugar;
pessoa real pede foto real da pessoa; dado real pede a série da fonte. Vetor genérico sobre fundo
liso não evoca o real — é o erro que mais empobrece uma cena.

**Nunca fabrique o que deveria ser verdadeiro.** Rosto de pessoa, principalmente: não se gera, não
se inventa. Sem a imagem real, o correto é dizer que faltou — não improvisar uma.

**Verifique a identidade olhando.** Antes de usar uma imagem como sendo de fulano, abra e confirme
que é fulano. Nome de arquivo e legenda mentem.

**Geometria vem de dado real.** Mapa, fronteira, contorno de país: da fonte geográfica, nunca
desenhado à mão. País destacado é o polígono inteiro, não um alfinete.

**Toda mídia carrega proveniência.** Fonte, endereço de origem e licença. "Internet" não é fonte;
"desconhecida" não é licença. Sem os três, não vai ao ar.

---

## 4 · A cadeia, e por que ela é rígida

Produção é uma cadeia de estações, e **cada uma só começa quando a anterior entregou o contrato
dela.** Não existe "mais ou menos pronto": ou o artefato existe e passa na verificação, ou a
estação seguinte não roda. Isso evita o pior custo — descobrir na entrega que a base estava errada.

A forma geral, independente de ferramenta:

1. **texto** — o roteiro, verificado contra a fonte antes de seguir;
2. **estrutura** — o que entra em cada trecho e como (a decisão do que mostrar);
3. **mídia** — a coleta do material real que as cenas pedem, em paralelo;
4. **execução** — as cenas desenhadas;
5. **verificação** — os gates automáticos e o julgamento visual, antes de gastar render;
6. **aprovação** — o olho humano, antes do render em lote;
7. **render** — só do que foi aprovado, nunca especulativo;
8. **entrega** — a montagem final referenciando o material, não recomprimindo.

**Render nunca é especulativo.** Renderizar antes da aprovação é gastar processamento em cena que
ainda vai mudar. A ordem é: aprova, depois renderiza.

---

## 5 · Identidade estável

**A identidade de uma cena é imutável e nunca derivada do seu título.** Se o identificador vem do
título, renomear a cena órfã o material já produzido — e material caro vira invisível para o
pipeline. Emita um identificador estável uma vez, e nunca o recompute.

**O tempo de cada cena tem uma fonte só.** Se dois arquivos guardam o tempo da mesma cena, eles
divergem — e o vídeo dessincroniza sem ninguém notar até já estar no ar.

**A montagem final referencia, não recomprime.** O material original entra por referência; recompor
tudo num arquivo novo perde qualidade e a rastreabilidade de volta às peças.

---

## 6 · Verificação de custo zero

Rodar as verificações é barato; deixar um defeito chegar ao render, ou pior, ao ar, é caro. Então
**verifique à vontade, antes de cada passo caro.** Os gates que valem a pena existir:

- **colisão** — nenhum texto sobre texto, em nenhum quadro (varra o tempo todo, não só o início);
- **excesso** — um teto de elementos simultâneos, senão a cena vira sopa;
- **tamanho** — cada texto acima do piso do seu papel (medindo o que importa, ver §2);
- **contrato** — a cena cumpre o §1 (função de `t`, duração, nada não-determinístico);
- **proveniência** — nada creditado sem a mídia presente, nada usado sem licença.

Um gate só protege se **for chamado** por alguém. Gate construído e nunca ligado é custo parado.
E gate que dá alarme falso é pior que gate nenhum: ensina a ignorá-lo, e aí ele falha justo quando
acerta.

---

## 7 · O humano no lugar certo

A aprovação final é de uma pessoa, olhando o resultado — não um render de prova, o material vivo.
Quando ela marca um ponto para corrigir, isso entra numa fila e é processado em ordem.

**O feedback conserta a raiz, não só o sintoma.** Corrigiu uma cena? Vá além: identifique qual
etapa produziu o erro, corrija a instrução daquela etapa, e destile a lição numa regra. O mesmo
erro não deve voltar. Uma correção que só arruma a cena atual é meia correção.

---

## 8 · Áudio da narração

**Palavra errada não obriga a regravar a faixa inteira.** Quando o narrador troca ou erra uma
palavra, separe os stems de voz (ferramenta de separação de fontes) e substitua cirurgicamente só
aquele trecho, preservando a voz real ao redor. Regravar tudo é caro e raramente casa o tom.

**O que se transcreve não é o que se entrega.** A taxa de amostragem baixa serve à transcrição
(máquina lendo), não ao ouvido: a entrega é sempre na qualidade cheia. O formato barato da análise
nunca vaza para o master.

**A cama sonora é cama, não protagonista.** Trilha e efeito entram sob a fala com folga medida, e o
parâmetro de mixagem vira **dado no artefato de entrega** — não um ajuste manual que se perde na
próxima regeração.
