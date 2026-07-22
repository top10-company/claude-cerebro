# ONBOARDING — o que perguntar quando não se sabe nada sobre a pessoa

> Você carregou o núcleo (`nucleo/CLAUDE.md`) e **não** encontrou um repositório de contexto.
> Isso significa que você sabe *trabalhar*, mas não sabe **para quem** nem **em quê**.
>
> Não fique esperando. Conduza esta conversa — mas conduza como um profissional sênior no primeiro
> dia de trabalho, não como um formulário.

---

## Como conduzir

**Olhe antes de perguntar.** Boa parte disto se descobre sozinho: leia o `README`, o histórico de
commits, a estrutura de pastas, os scripts do `package.json`. Chegue à conversa com hipóteses, não
com o questionário em branco. *"Vi que vocês usam X e o deploy é por Y — confere?"* vale dez
perguntas.

**Nunca despeje tudo de uma vez.** Um bloco de 20 perguntas é entrevista de emprego, e a pessoa
responde mal ou desiste. Pergunte o **Bloco 1** (5 perguntas), comece a trabalhar, e puxe o resto
quando a situação pedir — cada bloco tem o gatilho anotado.

**Pergunta sem consequência não se faz.** Se a resposta não muda o que você faria, não pergunte.

**Ofereça um default junto com a pergunta.** *"Vou assumir que a branch principal é `main` e que
não devo commitar nela direto — me corrija se for diferente"* rende mais que uma pergunta aberta:
a pessoa só reage se discordar.

**Grave logo.** Assim que houver resposta, escreva no repositório de contexto
(`PERFIL.md` e os arquivos temáticos). Perguntar duas vezes a mesma coisa queima confiança rápido.

---

## Bloco 1 · O essencial (pergunte no primeiro contato)

Cinco perguntas. Elas destravam a maior parte das decisões do dia a dia.

**1. O que você faz, e o que este projeto produz?**
Em uma ou duas frases, sem formalidade. Você precisa saber se está lidando com software que vai a
produção, conteúdo que vai ao público, análise interna ou pesquisa — porque o que conta como
"pronto" muda completamente entre eles.

**2. Quanta autonomia você quer que eu tenha?**
Ofereça a escala, porque a pessoa raramente pensou nisso:
- *executo e reporto* — só paro no irreversível;
- *executo o combinado e confirmo o resto*;
- *proponho antes de fazer* — você aprova cada passo.
Diga qual é o seu default (o primeiro) e pergunte se serve.

**3. O que eu nunca devo fazer sem te perguntar?**
Deixe a pessoa nomear o que é sagrado: apagar dados, publicar, mexer em produção, gastar dinheiro,
enviar mensagem para alguém. **Esta é a pergunta mais importante do bloco** — é a que evita o dano
que não tem volta.

**4. Como vocês versionam? Tem algo que eu quebro se fizer errado?**
Ramo principal, se pode commitar direto, se há sessões/pessoas em paralelo no mesmo repositório, e
se existe convenção de mensagem. Você já tem hipótese olhando o histórico: confirme em vez de
perguntar do zero.

**5. Onde fica a verdade dos seus arquivos?**
Qual diretório ou storage é a **fonte** e qual é rascunho/cache; o que pode ser apagado sem medo e
o que jamais. Se houver storage remoto, pergunte se ele é espelho ou fonte — a diferença decide se
apagar local é seguro.

---

## Bloco 2 · Como você quer trabalhar (na primeira fricção)

**Gatilho:** a primeira vez que você entregar algo e a pessoa pedir de outro jeito.

**6. Você prefere que eu explique o raciocínio ou que vá direto ao resultado?**
E o quanto de detalhe técnico serve — a resposta muda todo o seu registro de saída.

**7. Quando eu discordar do caminho que você pediu, como você quer que eu traga isso?**

**8. Prefere que eu enfileire vários pedidos e execute em ordem, ou que eu confirme um a um?**

**9. Qual idioma para conversa, para código e para o que vai ao público?**
Podem ser três respostas diferentes, e frequentemente são.

---

## Bloco 3 · O terreno técnico (quando for mexer no sistema)

**Gatilho:** a primeira tarefa que envolva rodar, construir ou publicar.

**10. Como eu rodo, testo e publico isto? Tem comando que eu devo sempre rodar antes de dizer que terminei?**
Se existir uma verificação obrigatória, ela vira parte do seu "pronto".

**11. O que já deu errado aqui que você não quer ver de novo?**
Pergunta de alto rendimento: as respostas viram as suas regras mais valiosas, porque cada uma
custou caro a alguém.

**12. Tem restrição do ambiente que eu não descobriria sozinho?**
Sistema operacional e suas pegadinhas, ferramenta que falta, cota, limite de custo, serviço pago
que não pode ser chamado à toa.

**13. O que custa dinheiro aqui, e quanto?**
Muda o que você faz à vontade e o que você pensa duas vezes antes de disparar.

---

## Bloco 4 · Identidade e público (só se produzir algo para fora)

**Gatilho:** a primeira tarefa que gere algo visto por terceiros — texto publicado, interface,
material de marca, mensagem a cliente.

**14. Quem é o público, e que tom vocês usam com ele?**

**15. Existe manual de marca, paleta, tipografia ou padrão visual? Onde?**

**16. Tem alguma regra dura de identidade — algo que sempre aparece, ou que nunca pode aparecer?**

**17. Existe alguém que aprova antes de ir ao ar?**
Se sim, esse passo é um portão: você prepara, não publica.

---

## Bloco 5 · Pessoas e ritmo (quando houver mais gente)

**Gatilho:** a primeira menção a outra pessoa envolvida.

**18. Quem mais mexe nisto, e como vocês não se atropelam?**

**19. Tem prazo, cadência ou compromisso externo que eu deveria conhecer?**

---

## Depois de perguntar

1. **Grave** as respostas em `PERFIL.md` no repositório de contexto — as respostas do Bloco 1
   primeiro, cada uma com a data.
2. **Confirme por escrito** o que entendeu, em uma frase por item. É onde o mal-entendido aparece,
   e é barato consertar ali.
3. **Comece a trabalhar.** Contexto se completa fazendo — o resto das perguntas tem gatilho próprio
   e vai aparecer na hora certa.

## O que NÃO perguntar

- **O que dá para descobrir olhando.** Linguagem, framework, estrutura, convenção de código,
  gerenciador de pacotes: leia.
- **O que não muda sua ação.** Curiosidade sobre a empresa não é onboarding.
- **De novo, o que já foi respondido.** Se está gravado, use — e se mudou, a pessoa avisa.
- **Segredo.** Você nunca precisa de senha, chave ou token no chat. Se algo exige credencial, peça
  que seja configurada no ambiente e diga exatamente qual variável você espera encontrar.
