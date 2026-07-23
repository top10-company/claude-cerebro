# CONTRATO — Designer de Navegação

> O que recebe · o que entrega · onde grava · o que valida.

## 1 · Entrada

| Vem de | O que é | Obrigatório |
|---|---|---|
| `out/<proj>/_reaproveitamento.json` (do curador-de-acervo) | os assuntos e seus tempos — a base do card de progresso. O `assunto` de cada trecho **já é o título de tópico honesto** (nasceu no `segmentos[].assunto` do `catalogo.jsonl`, escrito pelo `catalogador` a partir da transcrição) — o card **exibe**, não reescreve | sim, no modo 30-min |
| `out/<proj>/espelho.json` + `_blocos.json` | os tópicos e capítulos do conteúdo novo | sim |
| a marca ativa | tipografia, paleta, pisos, o template vigente dos cards | sim |

## 2 · Saída

### 2.1 · Os templates HTML (o que você DESENHA)
```
templates-cena/navegacao/titulo-topico.html      o card de título de tópico
templates-cena/navegacao/card-progresso.html     o card "onde você está" com os relógios
```
São templates determinísticos (contrato `__renderAt`/`__duracao`, palco 4K), com **placeholders**
que o gerador preenche: o texto do assunto, e o **estado de cada relógio** (0–1) por assunto.
O relógio deve aceitar um valor `0..1` e desenhar a fração correspondente — você desenha a mecânica,
não os valores.

### 2.2 · As instâncias (o que o GERADOR produz a partir do seu template)
O `scripts/navegacao/gerar.mjs` lê o `_reaproveitamento.json`, calcula o estado dos relógios em cada
ponto de inserção e emite as instâncias em `out/<proj>/graphics/nav-*.html`, mais o registro no
`_overlays-branding.json` (V4, sem-bg) para a finalização. **Você não coloca os cards à mão** — você
garante que o template preenche certo.

## 3 · A matemática do relógio (o contrato com o gerador)

Para um card inserido no instante `t`, para cada assunto `a` com janela `[a.ini, a.fim]`:

```
relogio(a, t) =  0                              se t <  a.ini      (ainda não começou)
                 (t - a.ini)/(a.fim - a.ini)    se a.ini ≤ t < a.fim  (em curso — a fração passada)
                 1                              se t ≥  a.fim      (já terminou)
```

O template recebe, por assunto, `{ rotulo, relogio }` e desenha. O gerador garante ≥2 inserções por
assunto. Confira o exemplo canônico: card em t=10min, assunto1 `[0,20min]` → relógio 0,5; assunto2
`[20,33min]` → relógio 0.

## 4 · O que validar

- O template do card de progresso **desenha o relógio proporcional** para qualquer `relogio∈[0,1]`
  (teste com 0, 0.5, 1) e é **sem-bg** (o conteúdo por baixo aparece).
- **O relógio ANIMA e NÃO mostra número** — o arco laranja anda de 0 até a posição em ~1,6s (shot
  em t pequeno = arco parcial; t maior = arco na posição). Um "67%" escrito é REPROVA.
- **O rótulo é um título EXPLICATIVO** do conteúdo (o que o tópico diz), não uma etiqueta de 1–2
  palavras. Cabe em até 2 linhas sem estourar o card.
- Os cards passam nos gates de cena (contrato, tamanho/pisos, sem colisão) — é cena como as outras.
- O título de tópico do conteúdo reaproveitado sai **consistente** com o do conteúdo novo.
