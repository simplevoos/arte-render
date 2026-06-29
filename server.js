import express from 'express';
import { renderArt } from './render.js';

const app = express();

app.get('/health', (req, res) => res.send('ok'));

// GET /art?photo=URL&title=O%20que%20*n%C3%A3o*%20pode...&subtitle=...&pills=A|B|C&accentColor=%2328a7e0
app.get('/art', async (req, res) => {
  try {
    const {
      photo, title = '', subtitle = 'Leia a legenda',
      pills = '', accentColor = '#28a7e0', w, h,
    } = req.query;
    const png = await renderArt({
      photo,
      title,
      subtitle,
      pills: pills ? String(pills).split('|') : [],
      accentColor,
      width: w ? parseInt(w, 10) : 1080,
      height: h ? parseInt(h, 10) : 1080,
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
