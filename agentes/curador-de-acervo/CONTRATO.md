# CONTRATO — Curador de Acervo

> O que recebe · o que entrega · onde grava · o que valida. Caminhos relativos à produção.

## 1 · Entrada

| Vem de | O que é | Obrigatório |
|---|---|---|
| o vídeo novo (`out/<proj>/espelho.json` + `_blocos.json`) | a duração atual e os capítulos, para saber quanto FALTA até o piso | sim (no modo filler) |
| o **catálogo de conteúdo** `gs://…/catalogo/catalogo.jsonl` (do `catalogador`) | 1 registro/vídeo: `temas` (18 nichos), `segmentos[{ini,fim,assunto,gancho,texto}]` com o **título de tópico já pronto**, `resumo`, `entidades`, `duracao_s` | sim — sem ele, bloqueio |
| a marca ativa | o piso de duração, o nicho/taxonomia do canal, a transição de virada | sim |

Modo **compilado**: sem vídeo novo — só o acervo + o tema/duração-alvo do compilado.

## 2 · Saída — `out/<proj>/_reaproveitamento.json`

A lista ordenada dos trechos reaproveitados:

```json
{
  "modo": "filler",                    // "filler" (completa um vídeo) | "compilado" (vídeo inteiro)
  "piso_seg": 1800,                    // o piso a fechar (filler) ou a duração-alvo (compilado)
  "falta_seg": 600,                    // quanto o filler precisa cobrir (0 no compilado)
  "trechos": [
    {
      "fonte_youtube_id": "<id do vídeo publicado>",
      "fonte_titulo": "Como é morrer em cada planeta do sistema solar?",
      "formato_fonte": "assunto-unico",   // "assunto-unico" (usa inteiro) | "lista" (só tópicos)
      "in_sec": 0, "out_sec": 1200,       // o intervalo do vídeo-fonte usado
      "assunto": "Como seria morrer em cada planeta do Sistema Solar",  // título EXPLICATIVO (vira o rótulo do card de navegação) — NUNCA etiqueta vaga tipo "planetas"
      "usa_intro": true,                  // usou parte da intro do próximo vídeo na virada?
      "transicao_virada": "t1",           // a transição de marca ANTES deste trecho (null no 1º)
      "topicos": [ { "titulo": "Mercúrio", "in_sec": 60, "out_sec": 180 } ]  // só no formato "lista"
    }
  ]
}
```

**Registre a composição também no banco** (`publicacao_fonte`): a relação vídeo↔fonte é dado
consultável, não só um json local.

## 3 · O que validar antes de entregar

- **A soma dos trechos fecha o piso** (filler) ou bate a duração-alvo (compilado), sem estourar.
- **Todo `fonte_youtube_id` existe** no acervo e no canal (proveniência real, não inventada).
- **Toda fronteira entre vídeos tem `transicao_virada`** (menos a primeira) — nunca colar seco.
- **Coerência de assunto**: todo trecho pertence ao nicho do vídeo-alvo.
- **`assunto` é um título EXPLICATIVO** (o que o tópico realmente diz), não uma etiqueta de 1–2
  palavras — é o que o espectador lê no card de navegação (feedback do Mateus, 23/jul).
- **`assunto` em frase formal do PT**: primeira letra maiúscula, nomes próprios maiúsculos, resto
  minúsculo — nunca 100% minúsculo (feedback do Mateus, 23/jul). O gerador ainda força a 1ª maiúscula
  como rede de segurança, mas grave certo.
- **Nada repetido** sem motivo declarado.

## 4 · Quem consome sua saída

- O **`designer-de-navegacao`** — usa `assunto` + os tempos para os cards de navegação/relógio.
- A **finalização** (`timeline-xml`) — monta os trechos + as transições de virada (T1) na timeline.
- Os **títulos de tópico** dos trechos reaproveitados — feitos pelo designer, dos títulos que você
  carregou em `topicos[]` / do vídeo-fonte.
