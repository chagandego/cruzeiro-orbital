# Cruzeiro Orbital

Site de exemplo (empresa fictícia de satélites), feito em 12/10/2026 para mostrar o pacote de
animações (GSAP 3.12.5 + ScrollTrigger pelo cdnjs). Página única em HTML/CSS/JS puro, sem build.

O `index.html` é o `cruzeiro-orbital.html` da sessão de 12/10 com o `<!doctype>`, `lang`, viewport
e `margin: 0` no `body` (antes ele só rodava dentro da página do Claude, que punha isso sozinha).

## Globo

Desde 20/10/2026 o globo mostra todos os países (pontos de terra + fronteiras) e o nome dos
continentes; o Brasil continua em destaque. Os dados ficam em `mundo.json`, gerado do Natural Earth
1:110m (domínio público, via `world-atlas@2.0.2`) com `node scripts/build-mundo.mjs mundo.json`.
Se o `mundo.json` não carregar (por exemplo, abrindo o `index.html` direto do disco), o globo
volta a mostrar só o Brasil.

## Publicação (Vercel)

Publicado em produção na Vercel. Cada commit na `main` vai direto para o ar.

Está **escondido do Google**: o `vercel.json` manda o cabeçalho `X-Robots-Tag: noindex, nofollow`.
Quem tem o link consegue abrir, mas o site não aparece nas buscas.
