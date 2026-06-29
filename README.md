# Simple Voos — Render de Artes

Serviço que gera as artes do Instagram da Simple Voos (PNG 1080x1350) no padrão da marca:
foto de fundo + título branco com palavra em azul + "Leia a legenda" + pílulas azuis + logo.

## Deploy no Render
1. Suba estes arquivos num repositório (GitHub).
2. No Render: **New > Web Service** → conecte o repo.
3. Build Command: `npm install` — Start Command: `npm start` (já vem no `render.yaml`).
4. Plano Free serve.

## Uso (URL da arte)
```
GET /art?title=...&subtitle=...&pills=A|B|C&accentColor=%2328a7e0&photo=URL_DA_FOTO
```
- `title`: use `*palavra*` para destacar em azul. Ex: `O que *não* pode levar na mala de mão?`
- `pills`: separadas por `|` (opcional)
- `photo`: URL da foto (ex: Pexels). Sem foto, usa um degradê.
- `w`/`h`: dimensões (padrão 1080x1350).

A própria URL **é** a imagem — dá pra usar direto como `media` no Metricool e no painel.

## Trocar o logo
Substitua `logo.png` (versão branca, fundo transparente).
