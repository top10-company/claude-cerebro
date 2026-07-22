# O carregador

Copie o bloco abaixo para o arquivo de instruções globais do Claude na sua máquina
(`~/.claude/CLAUDE.md`, ou `%USERPROFILE%\.claude\CLAUDE.md` no Windows) e ajuste os dois caminhos.

Ele **não guarda conhecimento** — aponta. É o que mantém as máquinas idênticas: o que muda é
versionado, e `git pull` propaga.

---

```markdown
# Carregue antes de trabalhar

**1. A inteligência** — como eu trabalho, e vale em qualquer projeto:
   `~/claude-cerebro/nucleo/CLAUDE.md`

**2. O contexto** — quem é o usuário, o que ele produz, o que é sagrado:
   `~/claude-contexto/PERFIL.md`
   (e os arquivos temáticos ao lado dele, conforme a tarefa pedir)

**3. Se o passo 2 não existir** — nenhum repositório de contexto, ou `PERFIL.md` ausente:
   você **não conhece este usuário**. Não presuma e não fique esperando comando.
   Conduza `~/claude-cerebro/onboarding/PERGUNTAS.md` (Bloco 1, cinco perguntas),
   grave as respostas, e siga trabalhando.

**4. Domínio específico** — se a tarefa é de um ofício coberto por `~/claude-cerebro/dominios/`,
   carregue também o domínio correspondente.

O projeto pode ter um `CLAUDE.md` próprio. Ele **acrescenta** contexto local; onde houver conflito,
o mais específico vence — projeto sobre contexto, contexto sobre núcleo.

Antes de dizer "atualizei o que sei", rode `git -C ~/claude-cerebro pull` e
`git -C ~/claude-contexto pull`.
```

---

## Por que assim

**Nada de conhecimento no arquivo global.** Se o método morar aqui, ele diverge entre as máquinas
no primeiro dia em que você editar num lugar só. Aqui só há ponteiro; a verdade é versionada.

**O passo 3 é o que torna o Claude proativo.** Sem ele, um Claude sem contexto fica esperando
instrução — e a pessoa precisa adivinhar o que ele precisa saber. Com ele, a falta de contexto vira
gatilho de ação.

**A precedência é explícita.** Sem ela, cada sessão decide sozinha quem manda quando o projeto
contradiz o contexto — e decide diferente cada vez.
