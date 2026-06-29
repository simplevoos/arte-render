import express from 'express';
import { renderArt } from './render.js';

const app = express();

app.get('/health', (req, res) => res.send('ok'));

// GET /art?photo=URL&title=O%20que%20*n%C3%A3o*%20pode...&subtitle=...&pills=A|B|C&accentColor=%2328a7e0
app.get('/art', async (req, res) => {
  try {
    const {
      photo, title = '', subtitle = 'Leia a legenda',
      pills = '', accentColor = '#28a7e0', w, h, format,
    } = req.query;
    // atalho de formato: story (9:16), feed/portrait (4:5), square/post (1:1)
    const sizes = {
      story: [1080, 1920], stories: [1080, 1920], reel: [1080, 1920],
      feed: [1080, 1350], portrait: [1080, 1350], retrato: [1080, 1350],
      square: [1080, 1080], post: [1080, 1080], quadrado: [1080, 1080], carrossel: [1080, 1080],
    };
    let [W, H] = sizes[String(format || '').toLowerCase()] || [1080, 1080];
    if (w) W = parseInt(w, 10);
    if (h) H = parseInt(h, 10);
    const png = await renderArt({
      photo,
      title,
      subtitle,
      pills: pills ? String(pills).split('|') : [],
      accentColor,
      width: W,
      height: H,
    });
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (e) {
    console.error(e);
    res.status(500).send('render error: ' + e.message);
  }
});

app.get('/', (req, res) => res.type('text').send(
  'Simple Voos — render service. Use /art?title=...&pills=A|B|C&photo=URL'
));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('arte-render listening on ' + port));
