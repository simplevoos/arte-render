import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOGO_URI as EMBEDDED_LOGO } from './assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(__dirname, 'node_modules/@fontsource/montserrat/files');

function loadFont(weight) {
  const candidates = [
    `montserrat-latin-${weight}-normal.woff`,
    `montserrat-latin-ext-${weight}-normal.woff`,
  ];
  for (const c of candidates) {
    const p = path.join(FONT_DIR, c);
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }
  throw new Error('font not found: ' + weight);
}

const FONTS = [
  { name: 'Montserrat', data: loadFont(800), weight: 800, style: 'normal' },
  { name: 'Montserrat', data: loadFont(700), weight: 700, style: 'normal' },
  { name: 'Montserrat', data: loadFont(600), weight: 600, style: 'normal' },
  { name: 'Montserrat', data: loadFont(500), weight: 500, style: 'normal' },
];

let LOGO_URI = EMBEDDED_LOGO || null;
try {
  const lb = fs.readFileSync(path.join(__dirname, 'logo.png'));
  LOGO_URI = 'data:image/png;base64,' + lb.toString('base64');
} catch (e) { /* usa o logo embutido */ }

const PLANE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24"><path fill="#ffffff" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
const PLANE_URI = 'data:image/svg+xml;base64,' + Buffer.from(PLANE_SVG).toString('base64');

// tiny hyperscript for satori
function h(type, style, children) {
  return { type, props: { style: style || {}, children } };
}

async function toDataUri(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get('content-type') || 'image/jpeg';
  return `data:${ct};base64,` + buf.toString('base64');
}

// Build title with *accent* words highlighted, word-by-word so it wraps cleanly
function buildTitleWords(title, accentColor) {
  const tokens = title.split(/\s+/).filter(Boolean);
  return tokens.map((tok) => {
    const isAccent = tok.startsWith('*') && tok.endsWith('*');
    const clean = isAccent ? tok.slice(1, -1) : tok;
    return h('span', {
      color: isAccent ? accentColor : '#ffffff',
      marginRight: 22,
      display: 'flex',
    }, clean);
  });
}

export async function renderArt(opts) {
  const {
    photo,
    title = '',
    subtitle = 'Leia a legenda',
    pills = [],
    accentColor = '#28a7e0',
    width = 1080,
    height = 1080,
  } = opts;

  const photoUri = await toDataUri(photo);

  const titleSize = title.length > 60 ? 70 : title.length > 38 ? 82 : 96;

  const children = [];

  // background photo or fallback gradient
  children.push(h('div', {
    position: 'absolute', top: 0, left: 0, width, height,
    display: 'flex',
    backgroundColor: '#0a2233',
    ...(photoUri
      ? { backgroundImage: `url(${photoUri})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundImage: 'linear-gradient(180deg,#6a93ad 0%,#3c6d8b 42%,#cdb491 100%)' }),
  }, []));

  // left + bottom scrim for legibility
  children.push(h('div', {
    position: 'absolute', top: 0, left: 0, width, height, display: 'flex',
    backgroundImage: 'linear-gradient(105deg, rgba(5,22,36,0.72) 0%, rgba(5,22,36,0.30) 42%, rgba(5,22,36,0.0) 66%)',
  }, []));
  children.push(h('div', {
    position: 'absolute', left: 0, bottom: 0, width, height: 320, display: 'flex',
    backgroundImage: 'linear-gradient(0deg, rgba(5,22,36,0.78) 0%, rgba(5,22,36,0.0) 100%)',
  }, []));

  // content column
  const topBlock = h('div', { display: 'flex', flexDirection: 'column', maxWidth: 640 }, [
    h('div', {
      display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
      fontSize: titleSize, fontWeight: 800, lineHeight: 1.04,
      letterSpacing: -1, rowGap: 4,
      textShadow: '0 3px 18px rgba(0,0,0,0.45)',
    }, buildTitleWords(title, accentColor)),
    subtitle ? h('div', {
      display: 'flex', marginTop: 26, fontSize: 32, fontWeight: 600, color: '#eaf3fa',
      textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    }, subtitle) : h('div', { display: 'flex' }, []),
  ]);

  const pillNodes = (pills || []).filter(Boolean).map((p) =>
    h('div', {
      display: 'flex',
      backgroundColor: accentColor,
      color: '#ffffff',
      fontSize: 31, fontWeight: 700,
      padding: '16px 32px',
      borderRadius: 999,
      marginTop: 16,
      boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
    }, p)
  );
  const pillsBlock = h('div', {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', alignSelf: 'flex-end',
  }, pillNodes);

  const wordmark = h('div', {
    display: 'flex', flexDirection: 'row', alignItems: 'center',
  }, [
    { type: 'img', props: { src: PLANE_URI, width: 56, height: 56, style: { marginRight: 16 } } },
    h('div', { display: 'flex', flexDirection: 'column', textShadow: '0 2px 10px rgba(0,0,0,0.55)' }, [
      h('div', { display: 'flex', fontSize: 42, fontWeight: 800, color: '#ffffff', letterSpacing: 0.5 }, 'Simple Voos'),
      h('div', { display: 'flex', marginTop: 2, fontSize: 15, fontWeight: 600, color: '#dbe9f4', letterSpacing: 7 }, 'PASSAGENS AÉREAS'),
    ]),
  ]);

  const logoBlock = h('div', {
    display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
  }, LOGO_URI
    ? [{ type: 'img', props: { src: LOGO_URI, width: 326, height: 64, style: {} } }]
    : [wordmark]
  );

  const content = h('div', {
    position: 'relative', width, height, display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
    padding: (height / width > 1.4 ? '170px 64px 230px 64px' : '74px 64px 64px 64px'),
    fontFamily: 'Montserrat',
  }, [topBlock, pillsBlock, logoBlock]);

  children.push(content);

  const root = h('div', {
    width, height, display: 'flex', position: 'relative', fontFamily: 'Montserrat',
  }, children);

  const svg = await satori(root, { width, height, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
  return png;
}
