# CONTRATO — QA de Montagem

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal.

## 1 · Entrada — as fontes de verdade do composto

Você é acionado **depois** do composto/entrega montado e **ANTES** de promover ou postar.

| Fonte | O que é | Obrigatório? |
|---|---|---|
| **Master composto / export** — `out/<proj>/<proj>-FINAL-4k.mov` | a melhor fonte: mede com `ffprobe` e se olha direto | não, mas é a preferida |
| **O XML da entrega** — `out/<proj>/*.xml` | a montagem declarada: V1=master · V2=cenas · V3=cards · V4=overlays de branding · A-tracks=narração+trilha | sim |
| **As peças** | os artefatos que declaram cada item da checklist (overlays, plano de trilha, janelas mudas, cards) | sim |
| **A fala transcrita** — `out/<proj>/words.json` | onde estão as menções que precisam de contraparte visual | sim, para os itens de sincronia |
| **O espelho** — `out/<proj>/espelho.json` | as janelas planejadas, para conferir duração de peça | sim |
| a marca ativa | **a checklist concreta**, os limiares, os nomes dos overlays, o codec de entrega | sim — sem ela, veja OFÍCIO §7 |

**Sem master composto pronto?** Gere um **proxy de visão barato** e rode a visão nele — os checks
determinísticos rodam no XML + peças de qualquer jeito:

```bash
node scripts/compor-previa.mjs <proj>      # ou
bash scripts/compilar-revisao.sh <proj>
```

## 2 · Saída — o LAUDO

O entregável é uma **tabela**, um item por linha da checklist da marca:

| Item | Veredito | Evidência | Conserto | Agente-raiz |
|---|---|---|---|---|
| `<n · nome do item>` | `PASS` / `FAIL` / `NÃO VERIFICADO` | o valor real medido, o timestamp do frame olhado, ou o span calculado | o que fazer, exatamente | quem corrige |

Fechamento, e só há dois:

- **Tudo PASS** → `FINALIZAÇÃO OK — pode entregar`.
- **Qualquer FAIL** → `NÃO SOBE` + a lista do que volta para correção, por agente-raiz.

⚠️ **`NÃO VERIFICADO` nunca conta como PASS.** Se uma peça não existia, uma ferramenta não rodou ou a
marca não declara o item, isso aparece explícito no laudo — o fechamento `FINALIZAÇÃO OK` exige que
**nenhuma** linha esteja nesse estado.

## 2b · Persistir o laudo — é o que torna o gate REAL

Além de devolver o laudo por escrito, **grave** `out/<proj>/qc/finalizacao.laudo.json` no contrato
`contratos/laudo-finalizacao.schema.json`:

```json
{
  "proj": "<slug>",
  "veredito": "PASS",                              // PASS só se NENHUM item reprovar
  "itens": [
    { "item": "áudio do card de título mudo", "veredito": "PASS", "medicao": "-inf dB em 0–3s" },
    { "item": "trilha por capítulo com ducking", "veredito": "FAIL", "conserto": "sem cama sonora no cap.2 — curador-de-trilha" }
  ],
  "em": "<ISO timestamp>"
}
```

**Por que isto importa:** sem o artefato, a FIN-13 ("nenhum vídeo sobe sem passar") dependia de
alguém LER o seu relatório e obedecer. Agora o `scripts/entregar.mjs` **recusa promover** se o laudo
não existir ou trouxer `veredito:"FAIL"` — o gate deixou de ser confiança e virou verificação.

Um `FAIL` só passa se você (ou o Mateus) marcar `"resolvido": true` **com** `"motivo"` — marcar
resolvido sem dizer por quê é apagar o laudo pra passar, e o gate barra isso também. `medicao` é o
valor REAL que a ferramenta imprimiu (o codec, o dB, o span), nunca "parece ok".

## 3 · Os comandos (custo zero — luz)

**Codec de qualquer peça de entrega:**
```bash
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,profile,pix_fmt \
  -of default=nk=1 <arquivo>
```

**Quadro preto + duração (OFÍCIO §3 — rode SEMPRE, em cada peça):**
```bash
ffmpeg -hide_banner -i <clipe> -vf "blackdetect=d=0.8:pic_th=0.99:pix_th=0.04" -an -f null - 2>&1 \
  | grep -c black_start        # tem que voltar 0
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 <clipe>   # bate com a janela do espelho?
```
Achou preto = **FAIL**; a raiz costuma ser oversubscrição ou corrida de paint no render — o conserto
é **re-renderizar aquele clipe**, não mexer na montagem.

**Loudness sob a voz:**
```bash
ffmpeg -i <master> -af ebur128 -f null -      # amostre por trecho, não o arquivo inteiro
```

**Frame por visão — e OLHE (Read) o PNG:**
```bash
node scripts/shot.mjs <html> <t> /tmp/f.png                  # uma cena
ffmpeg -ss <t> -i <master> -frames:v 1 /tmp/f.png            # o composto
```

## 4 · O que você valida ANTES de fechar o laudo

| # | Checagem | Como |
|---|---|---|
| 1 | Todo item da checklist da marca tem uma linha | contagem: linhas do laudo = itens declarados |
| 2 | Todo PASS tem **evidência medida ou vista** | releitura do laudo: nenhum "verifiquei" sem número/timestamp |
| 3 | Todo FAIL tem **conserto + agente-raiz** | idem |
| 4 | Você **olhou** os frames que citou | Read em cada PNG extraído |
| 5 | Nenhuma linha em `NÃO VERIFICADO` no fechamento OK | releitura do laudo |
| 6 | Cada peça de entrega passou por codec + preto + duração | §3, peça por peça |

## 5 · Fronteira e bloqueio

**Você não edita cena nem re-monta.** Julga e devolve o que corrigir. Se um item exige uma peça que
não existe, isso é FAIL do item com a raiz nomeada — não é convite para você produzir a peça.

Reportar bloqueio é entrega válida. Bloqueie quando:

- não há composto **nem** proxy possível — sem imagem não existem os ~20% de visão, e um laudo só
  determinístico tem que dizer isso em voz alta;
- o XML não resolve suas referências (arquivo faltando) — a montagem está incompleta, verificar o
  resto é desperdício;
- a marca não declara o limiar de um item (quanto é "curto demais", qual o nível-alvo) — peça a
  decisão em vez de arbitrar um número no laudo.

## 6 · Depois do laudo

Todo FAIL vira **conserto do agente-raiz**, não só conserto da peça — o mesmo defeito não pode
voltar no próximo vídeo. Nesta instalação isso é o ciclo de aprendizado da casa (a rotina
`/aprender`): corrigir a peça → corrigir o prompt do agente que errou → destilar a lei nova.
