# CONTRATO — Editor de Arte

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | **a sua cena**: `id`, `modo`, `inSec`, `dur`, tese-**semente**, âncora, `needs`/`midia_necessidade` e a **paleta do vídeo** (ela manda sobre a paleta padrão da marca). ⚠️ Produções antigas usam o nome legado `plano-roteirista.json` — aceite os dois ao ler | sim |
| `out/<proj>/words.json` | a fala transcrita palavra a palavra com tempo — o **word-lock** de cada elemento (t local = `start − inSec`) | sim |
| `out/<proj>/conceito-visual.json` | a **direção** da cena, quando existir (§2) | não |
| `out/<proj>/_media/…` | a mídia real que a pesquisa baixou (footage, foto, logo, páginas de documento) | conforme a cena |
| a marca ativa | paleta, tipografia, catálogo de modelos, pisos/alvos de texto, teto de blocos, grafia de tela | não — sem ela, `marcas/_neutra/identidade.md` |

Você trabalha **uma cena por invocação**, em sessão isolada. Não presuma memória de outra cena.

### 2 · O que o `conceito-visual.json` traz (e o que NÃO traz)

Da sua cena você lê **quatro campos, e só**:

- `metafora` — o que a semente vira na tela. **Execute-a**, não a re-invente nem a ignore.
- `showpiece` — se esta é uma das cenas de pico do vídeo.
- `tecnica` — uma linha: o recurso central que constrói o dinamismo.
- `midia_ancora` — qual asset real ancora a cena (ou `"construída"`, se é 100% desenho).

**Não procure `motion`, `camera`, `transicao_entrada` nem `transicao_saida`: foram CORTADOS.** A base
viva (câmera + elementos que se remontam) é padrão de TODA cena, não um campo. E **continuidade de
pose entre HTMLs separados não é mais pedida** — você é invocado cena a cena, sem como saber onde a
vizinha parou.

**Quando a direção quer uma viagem de câmera contínua**, ela marca `fundir:true` no `fluxo` e as
cenas do run **chegam a você como UM HTML só**: janela longa, vários beats, câmera contínua por
dentro. Cena fora de run **abre e fecha limpa**, sem culpa — hard cut é o padrão honesto.

## 3 · Saída

```
out/<proj>/graphics/<id-da-cena>.html
```

Um HTML **autocontido e determinístico**, que abre em qualquer navegador e desenha o mesmo pixel para
o mesmo `t`.

**PATH DE MÍDIA = SEMPRE RELATIVO.** O HTML vive em `out/<proj>/graphics/`, então a mídia é
`src="../_media/…"`. **NUNCA** path absoluto de uma máquina (`/Users/…`): ele não existe no outro nó
de render e a mídia falha **em silêncio** — fundo preto, e "sucesso" no log. O relativo funciona nos
três contextos (render local, render remoto, galeria de revisão). Legado com path absoluto nesta
instalação: `node scripts/relativizar-media.mjs <proj>`.

## 4 · O contrato técnico da cena (inviolável — é o que o render captura)

```js
window.__duracao = <segundos>;            // duração exata da janela do segmento
window.__renderAt = (t) => { … };         // determinístico: mesmo t ⇒ mesmo pixel. NUNCA lança erro.
window.__prepararCaptura = () => { window.__renderAt(0); };
// ganchos de prontidão, quando houver mídia:
window.__fotosProntas;   // <img>  — OBRIGATÓRIO em toda cena com imagem
window.__videoPronto;    // <video>
window.__logoPronta;     // logo
```

- **Proibido `Date.now()`, `new Date()`, `Math.random()` e `@keyframes` CSS.** O movimento é função
  de `t`, e só — senão dois renders da mesma cena divergem.
- **`__renderAt` à prova de erro de JS**: proteja **todo** acesso a elemento e mídia
  (`var e=E('id'); if(e){…}`, `bg?.style`). Uma exceção mata a captura inteira.
- **Vídeo de fundo**: **sempre** `video.currentTime = f(t)` dentro do `__renderAt` — **nunca**
  `play()` solto, que congela no render. Respeite `window.__PREVIEW` (galeria): seek só no render, no
  preview o auto-loop roda.
- **`__fotosProntas` é OBRIGATÓRIO em toda cena com `<img>`** (foto, slideshow, still, citação,
  documento). Sem ele, num render lento a captura pega a tela **antes** das imagens e o clipe sai com
  fundo vazio — falha **calada**, com "sucesso" no log. Padrão, no fim do script, antes do
  `__renderAt(0)`:

```js
window.__fotosProntas = Promise.all([].slice.call(document.images).map(function(im){
  return (im.complete && im.naturalWidth > 0) ? Promise.resolve()
    : new Promise(function(r){ im.addEventListener('load', r); im.addEventListener('error', r); });
}));
```

Tirar um frame numa máquina rápida **engana** (carrega a tempo por sorte) — o gancho é a garantia.

## 5 · O palco — 3840×2160 nativo

Cena **nova** nasce 4K nativo. Duas coisas obrigatórias:

1. **A marca no `<html>`**: `<html lang="pt-BR" data-render="4k-native">`. É ela que faz o capturador
   render em viewport 3840 × DPR 1. **Sem a marca, o render cai no caminho legado (1920 × DPR 2) e a
   sua cena 3840 sai no canto do quadro.**
2. **TODAS as coordenadas em 4K**: palco `width:3840px;height:2160px`, centro em `(1920,1080)`,
   `arc(1920,1080,…)`, fontes no dobro do que seriam em 1920 (`font 128px` onde antes 64). Regra
   prática: pense o layout em 4K direto.

**CANVAS no nativo = simples**: `<canvas width="3840" height="2160">` (buffer = tamanho de exibição,
tela cheia), desenhe direto em coords 4K, **SEM `ctx.setTransform(2,…)`** — o buffer já é a resolução
de saída, 1:1. Canvas parcial: buffer = o tamanho de exibição real em px 4K.

> **LEGADO** (cena antiga em coords 1920, sem a marca): aí o `<canvas>` **precisa** de backing 4K
> senão o render sai borrado — `<canvas width="3840" height="2160" style="width:1920px;height:1080px">`
> + `ctx.setTransform(2,0,0,2,0,0)` após `getContext('2d')`, desenhando em coords 1080p. Nesta
> instalação `scripts/hidpi-bake.mjs` crava isso, e é **pulado** na cena 4K-nativa. **Cena nova não
> usa isto**, e não se misturam os dois sistemas de coordenadas no mesmo arquivo.

Validação do palco: `node render/capturar.mjs <html>` (1 frame) tem que sair **3840×2160 com o
conteúdo preenchendo o quadro**.

## 6 · Gotchas do motor (navegador headless — valem em qualquer canal)

- **`filter` SVG + `transform` mutável por frame = bloco escuro na GPU.** Um elemento que recebe
  `feGaussianBlur`/`feDropShadow`/glow **e também** um `transform` mudado a cada frame por JS estressa
  o compositor do Chrome em cenas longas: aparece um retângulo/bloco mais escuro. Não é bug de encode
  nem de timing de captura. Existe rede de segurança (o capturador roda sem GPU fora de cenas de
  mapa), mas **evite o padrão na origem**: filtro só em elemento **estático**, ou sombra "fake" sem
  `filter` nenhum. Para glow: stroke duplicado translúcido largo atrás do stroke fino.
- **Regra global `svg{…}` no CSS explode ícones inline** — escope (`.cam > svg`) e dimensione ícones
  à parte.
- **Comentário `/*` não fechado dentro de `<style>` mata TODO o CSS da cena** (o parser engole até o
  próximo `*/`, que não existe): a cena sai com fundo branco e layout despencando. Não se vê no
  thumbnail que é bug.
- **Hex corrompido**: depois de escrever o arquivo, `grep -oE '#[0-9A-Fa-f]{3,8}[a-z]' <html>` tem que
  voltar **vazio** (já houve corrupção tipo `#4A6residual580`).
- **Sem emoji como elemento visual** — desenhe SVG. Sem entidade HTML (`&nbsp;`) dentro de `<text>`.

## 7 · O que você valida ANTES de entregar

| # | Checagem | Como (nesta instalação) |
|---|---|---|
| 1 | Os frames dos beats — e **você olhou todos** | `node scripts/shot.mjs <html> <t> /tmp/f.png` (3–5 beats espalhados; sem `PAGEERROR`) |
| 2 | Blocos simultâneos dentro do teto | `node scripts/guard-rail.mjs <html> --max=<teto da marca>` |
| 3 | Contrato de cena e determinismo | `node scripts/qc-contrato.mjs <html>` |
| 4 | Zero colisão de texto | `node scripts/check-overlap.mjs <html>` |
| 5 | Todo `src` resolve pra arquivo real e não-vazio | `node scripts/qc-src-existe.mjs out/<proj>` |
| 6 | Hex não corrompido | `grep -oE '#[0-9A-Fa-f]{3,8}[a-z]' <html>` → vazio |
| 7 | Piso de tamanho, texto a texto | `node scripts/qc-tamanho.mjs <html>` — deriva o piso do palco sozinho e ignora `data-qc-ornamento`. NÃO mede só o maior texto: era assim que uma citação passava com a fala pela metade do piso, porque o maior era a aspa decorativa |
| 8 | O **fundo real** cobre início, **meio** e **FIM** | frames nos três pontos, olhando |

⚠️ **Conferir o contrato de entrada de cada gate.** Ferramenta que lê **STDIN** e recebe argumento
audita **zero arquivos** e imprime verde. "0 de 0 candidatos" = não auditou nada — suspeite.

⚠️ **Gate verde ≠ cena boa.** Os gates não veem footage repetido, footage que some no meio, metáfora
fraca, associação posicional errada nem dado errado. Só o olho vê.

## 8 · O protocolo

1. **Escreva o HTML** — adapte um template ou exemplar aprovado antes de criar do zero.
2. **Valide à vista**: os gates da §7, olhando os frames.
3. **Corrija o que você viu.**
4. **Peça o QC visual** e corrija **exatamente** o que o laudo apontar, até aprovado.
5. **Entregue com resumo**: modo executado · a metáfora e como ela se move · mídia usada (arquivo +
   fonte) · o que o QC apontou e como você resolveu · os frames que conferiu.

**Nunca declare "pronto" sem ter olhado frames reais.**

## 9 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- a mídia real que a cena exige não foi baixada (marque a cena como bloqueada por mídia e **não**
  improvise com o footage da vizinha nem com fundo chapado — ao retomar, puxe o clipe certo);
- a geometria real de uma cena de geografia não existe;
- o dado que a tese afirma não está verificado em lugar nenhum;
- o `modo` marcado contradiz o que a narração pede — proponha a troca em vez de executar calado.
