# CONTRATO — Mapista

> O que recebe · o que entrega · onde grava · o que valida antes de entregar.
> Portátil: os caminhos são relativos à produção (`out/<proj>/`), não a um canal.

## 1 · Entrada

| Vem de | O que é | Obrigatório? |
|---|---|---|
| `out/<proj>/espelho.json` | o segmento marcado como cena de mapa: **id**, `modo` (2D ou 3D), `inSec`, `dur`, tese-semente, âncora, `needs` | sim |
| `out/<proj>/words.json` | a fala transcrita palavra a palavra com tempo — é o **word-lock** de cada movimento e rótulo | sim |
| a geometria real | GeoJSON entregue pelo pesquisador de geo, ou já presente no acervo da instalação | sim, se a cena cita território |
| `out/<proj>/conceito-visual.json` | a direção da cena (metáfora, se é pico do arco, mídia âncora), quando existir | não |
| a marca ativa | paleta, pisos de texto, teto de blocos, grafia de tela, catálogo de modelos | não — sem ela, use `marcas/_neutra/identidade.md` |

**Você não escolhe a geometria por conta própria antes de olhar o acervo.** O acervo local vem
primeiro (nesta instalação: `assets/geojson/`, catalogado em `assets/geojson/manifest.json`) — quase
sempre o arquivo já está lá, e a falha mais comum do ofício é não ter olhado. Faltou? Acione o
pesquisador de geo. **Nunca improvise a forma.**

## 2 · Saída

```
out/<proj>/graphics/<id-da-cena>.html
```

**Um HTML autocontido**, que abre sozinho em qualquer navegador e renderiza sem depender do ambiente
de quem chamou. Em especial: **a chave de API da base entra inlineada como `const` na cena** — o
render remoto não lê o `.env` da sua máquina.

Mídia local referenciada por **path RELATIVO** (`../_media/…` a partir de `graphics/`). Path absoluto
de uma máquina não existe na outra e a mídia falha **em silêncio** no render.

## 3 · O contrato técnico da cena (inviolável — é o que o render captura)

```js
window.__duracao   = <segundos>;          // a duração exata da janela do segmento
window.__renderAt  = (t) => { … };        // determinístico: mesmo t ⇒ mesmo pixel. NUNCA lança erro.
window.__ready     = <Promise>;           // resolve no evento de carga do mapa
window.__prepararCaptura = () => { … };   // PAUSA o auto-loop do preview e chama __renderAt(0)
window.__aguardarMapa    = () => <bool>;  // segura o frame até os tiles E o DEM estarem prontos
window.__fotosProntas    = true;          // ou a Promise das <img>, se a cena tiver imagens
```

- **`__renderAt` à prova de erro de JS**: proteja **todo** acesso a elemento (`var e=E('id'); if(e){…}`).
  Uma exceção no meio da captura mata a cena inteira, não só o elemento.
- **Determinismo**: proibido `Date.now()`, `new Date()`, `Math.random()` e `@keyframes` CSS — o
  movimento é função de `t`, e só. **Animação de câmera por relógio (`flyTo`/`easeTo`) quebra o
  determinismo**: no render, mova a câmera com o equivalente instantâneo (`jumpTo`) calculado a
  partir de `t`. A curva de voo (van Wijk) você **calcula**, não delega ao relógio.
- **`__ready` é o que identifica a cena como cena de mapa** para o capturador (que então mantém o
  loop de animação vivo em vez de congelar a página).
- **`__aguardarMapa` tem que esperar o DEM**, não só o satélite:
  `map.areTilesLoaded() && map.isSourceLoaded('dem') && map.isSourceLoaded('sat') && !!map.getTerrain() && !map.isMoving()`.
- **Respeite `window.__PREVIEW`** (galeria de revisão): seek/jump só no render; no preview, auto-loop.

## 4 · Palco — 3840×2160, sempre

Cena nova nasce **4K nativo**, e o palco é declarado no próprio HTML:

```html
<html lang="pt-BR" data-render="4k-native">
```

- `html`, `body`, o palco e o `svg` de overlay em **3840×2160**. **TODAS** as coordenadas, fontes,
  raios e espessuras em escala 4K — o dobro do que valeria num palco 1920 (`font 128` no lugar de 64,
  âncora `1920,1080` no lugar de `960,540`). Nada de `transform:scale`, nada de `ctx.scale`: o
  `<canvas>` nasce 3840×2160 e desenha 1:1.
- **O gate é o atributo, não a boa intenção**: sem a marca, o capturador cai no caminho legado e você
  entrega um quadrante da cena.
- ⚠️ **O ZOOM MUDA COM O PALCO — medido, não teórico.** No viewport 3840 o motor de mapa cobre **o
  DOBRO** do span geográfico no MESMO `zoom` (medição: center `[-51.2,-30.03]`, zoom 9 → **2,637°**
  de longitude em 1920×DPR2 · **5,273°** em 3840×DPR1). **Zoom copiado de cena antiga enquadra 2×
  mais aberto — some ~+1,0.** É um ganho real: com zoom+1 o motor puxa um nível a mais de tile de
  verdade, e o mapa 4K-nativo fica honestamente mais nítido. **Confirme no frame, nunca no número.**

## 5 · O motor (nesta instalação)

- **maplibre-gl via CDN** (`4.7.1`) com `interactive:false`, `preserveDrawingBuffer:true`,
  `fadeDuration:0`, `attributionControl:false`, `maxTileCacheSize:8192`.
- **As duas fontes da base** (`KEY` = `MAPTILER_KEY` do `.env`, **inlineada como `const` na cena**):

```js
sat: {type:'raster', tiles:['https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key='+KEY],
      tileSize:512, maxzoom:20, attribution:''}
dem: {type:'raster-dem', tiles:['https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key='+KEY],
      tileSize:512, maxzoom:12, encoding:'mapbox'}   // maxzoom 12–14 conforme a cobertura do DEM na região
```

- Geometria entra **inline** via `addSource` + camadas `fill` e `line` — não busque arquivo em tempo
  de render.
- ⛔ **Aposentados nesta instalação**: os templates `scripts/templates/map-scene.mjs` e
  `scripts/templates/geo-map.mjs`, e a base estática **NASA Blue Marble** (jpg com silhueta desenhada
  por cima). Não use, não copie, não "atualize".
- 💰 A chave da base cobre **tiles**; a Static API responde **403**. Tudo via motor de mapa, nunca
  chamada estática.
- Motor alternativo, quando a entrega é um **clipe solto** em vez de uma cena: `~/www/mapas-animados/engine`
  (mesma base, render próprio → mp4 que entra como clipe da timeline ou como fundo `<video>` com
  `currentTime=f(t)` dentro do `__renderAt`, nunca `play()` solto). Upgrade futuro com chave GMP:
  `~/www/animacoes-com-google-maps` (Cesium + 3D Tiles).

## 6 · Onde a cena de mapa renderiza

🖥️ **Cena de mapa é WebGL e agora renderiza NA NUVEM (REND-18).** A `estudio-l4` tem GPU (nvidia-l4), então o mapa entra no MESMO lote que o resto: `top10 render <proj>`. Até 24/jul o mapa voltava pro Mac porque a nuvem não tinha GPU — era isso que partia o lote em dois caminhos, com dois modos de falha.
pra lá volta preto ou não volta. Nesta instalação: `./render-one.sh <html> <out> branca --final`
(cena < 10 s ⇒ `--nopad`) para conferir UMA cena; o lote inteiro vai por `top10 render <proj>`.

## 7 · O que você valida ANTES de entregar

| # | Checagem | Como |
|---|---|---|
| 1 | Os frames dos beats-chave, **com os tiles carregados** | `node scripts/maprender.mjs <html> <t> <out.png>` |
| 2 | **Você OLHOU os frames** (Read) | enquadramento certo? relevo lendo? tile cinza/faltando? frame preto? rótulo no lugar? satélite claro o bastante? |
| 3 | Blocos simultâneos dentro do teto | `node scripts/guard-rail.mjs <html> --max=<teto da marca>` |
| 4 | Contrato de cena e determinismo | `node scripts/qc-contrato.mjs <html>` |
| 5 | Zero colisão de texto | `node scripts/check-overlap.mjs <html>` |
| 6 | Hex não corrompido | `grep -oE '#[0-9A-Fa-f]{3,8}[a-z]' <html>` tem que voltar **vazio** |

⚠️ **É o renderizador de mapa que valida, não o tirador de frame genérico.** O `shot.mjs` stuba o
loop de animação do motor de mapa e fotografa **tile cru** — ele mente sobre a cena de mapa.

## 8 · O report (o que você devolve por escrito)

- **modo escolhido (2D ou 3D) e POR QUÊ** (o critério do ofício §5 que decidiu);
- **base usada** — e, se foi fallback, a **prova da cota morta** colada do terminal;
- **alvo(s)**: lat/lng, zoom, pitch e bearing de cada beat;
- **fonte e licença da geometria** (e o crédito que a licença exige);
- **`exaggeration`** usado (e a variação, se foi dinâmico);
- **arquivos gerados** e **quais frames você conferiu**.

## 9 · Bloqueio

Reportar bloqueio é entrega válida; improvisar não é. Bloqueie quando:

- a geometria real não existe/não foi obtida (**nunca** desenhe no lugar);
- a base não cobre o lugar no zoom que a cena exige, e o fallback também não;
- o `modo` marcado no espelho contradiz o que a narração pede (ex.: pediram 2D pra uma frase cujo
  argumento é o relevo) — proponha a troca em vez de executar o modo errado calado.

Diga o que tentou, o que encontrou de mais próximo e qual é a saída recomendada.
