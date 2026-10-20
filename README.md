# Cruzeiro Orbital

Site de exemplo (empresa fictícia de satélites), feito em 12/10/2026 para mostrar o pacote de
animações (GSAP 3.12.5 + ScrollTrigger pelo cdnjs). Página única em HTML/CSS/JS puro, sem build.

O `index.html` é o `cruzeiro-orbital.html` da sessão de 12/10 com o `<!doctype>`, `lang`, viewport
e `margin: 0` no `body` (antes ele só rodava dentro da página do Claude, que punha isso sozinha).

## Publicação (Vercel)

Publicado em produção na Vercel. Cada commit na `main` vai direto para o ar.

Está **escondido do Google**: o `vercel.json` manda o cabeçalho `X-Robots-Tag: noindex, nofollow`.
Quem tem o link consegue abrir, mas o site não aparece nas buscas.
