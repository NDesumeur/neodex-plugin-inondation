// Inondation : La tache du coin prend la couleur que tu choisis et avale ses voisines de même couleur. Couvre toute la grille en un nombre de coups limité.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Inondation</span><span class="hint">Clic sur une couleur (ou une case de cette couleur) · touches 1 à 6</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="gc" width="256" height="284" role="img" aria-label="Grille d'Inondation"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="gStats"></div></div>
      <div class="row"><button class="btn main" id="gNew">NOUVELLE PARTIE</button><button class="btn" id="inPrev">◀</button><button class="btn" id="inNext">▶</button><button class="btn" id="gFs">PLEIN ÉCRAN</button></div>
      <label class="row">Mode <select class="gSel" id="inMode"><option value="solo">Seul · niveaux</option><option value="jour">Grille du jour</option><option value="ordi">Duel contre l’ordi</option><option value="deux">Duel à deux, sur le même écran</option></select></label>
      <label class="row"><input type="checkbox" id="inRnd"> Grilles au hasard (nouveau à chaque partie)</label>
      <div class="hint">Ta tache part du coin en haut à gauche, entourée d'un liseré blanc.</div><div class="hint">Chaque couleur a aussi son motif gravé, pour les distinguer sans les couleurs.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:2;min-width:320px;position:relative}
.gameBox canvas{width:100%;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}
.gameBox canvas{width:min(100%,max(300px,calc((100vh - 190px) * 256 / 284)));height:auto;aspect-ratio:256/284}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 256 / 284))}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "INONDATION", T: {"k": "#030a14", "k2": "#08162a", "fill": "#0e2240", "fillOn": "#143058", "hl": "#1c3a6a", "line": "#2e5a9a", "acc": "#3fe0ff", "accL": "#c8f8ff", "accS": "#1a9ac0", "accD": "#06304a", "rivet": "#c8f8ff", "btn": "#1c3a6a", "btnHi": "#4a7ac0", "btnLo": "#08162a", "btnHov": "#1c4478", "btnHovHi": "#6a9ae0", "text": "#eef6ff", "muted": "#a8c0e0", "acc2": "#ffd84a", "gold": "#ffd84a", "orange": "#ffa030", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#040c1a", "bgDot": "#0e2240", "bgDot2": "#08162a", "spark": "#2e5a9a", "spark2": "#ffd84a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["kkkkkkkkkkkk", "kaaaaabbrrrk", "kaaaaabbrrrk", "kaaaabbbbrrk", "kaaaabbggggk", "kaaaaabbgggk", "kaaaaaabbggk", "kaaaaaabbbok", "kaaaaaaabbok", "kaaaaaaaaook", "kaaaaaaaaaok", "kkkkkkkkkkkk"],
  icons: [[/^NOUVELLE/, "play"], [/^RECORDS/, "crown"]] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (b == null || v > b) { games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
// petits outils communs aux jeux : une toile pré-dessinée, la position du pointeur dans le canevas, un bip
const cnv = (w, h, fn) => { const c = el('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; };
const spr = (rows, pal) => cnv(Math.max(...rows.map(r => r.length)), rows.length, g => sprite(g, rows, 0, 0, pal));
const W = 256, H = 284, cv = $('gc'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
const cpos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
let actx = null;
const beep = (f, d = .1, type = 'square', slide = 0, vol = .08) => { try { actx ??= new AudioContext(); const o = actx.createOscillator(), gn = actx.createGain(), t = actx.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn).connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch {} };
const keyOk = e => view.classList.contains('on') && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName);
const showStats = rows => $('gStats').replaceChildren(...rows.flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));

/* ---------- Inondation : la tache du coin en haut à gauche prend la couleur choisie et avale ses voisines de même couleur. Tout couvrir en peu de coups. ---------- */
const IN = {N: 14, C: 16, X0: 16, Y0: 22, COLS: [['#ff4a5a', '#ffb0b8', '#a02030'], ['#ffd84a', '#fff4b0', '#a07a10'], ['#5fdf6a', '#c8ffc8', '#2a8a3a'], ['#3f8aff', '#b0d0ff', '#1a4aa0'], ['#b07aff', '#e4d0ff', '#6a3ab0'], ['#ff9a3d', '#ffe0b0', '#a05a10']]};
const IN_MARK = [['....', '.##.', '.##.', '....'], ['#..#', '....', '....', '#..#'], ['.#..', '###.', '.#..', '....'], ['#...', '.#..', '..#.', '...#'], ['.##.', '#..#', '#..#', '.##.'], ['####', '....', '####', '....']];
const inTile = (k, w, h) => cnv(w, h, b => {  // une tuile de céramique par couleur, chacune avec son motif gravé (pour qui distingue mal les couleurs)
  const [m, l, d] = IN.COLS[k]; px(b, d, 0, 0, w, h); px(b, m, 1, 1, w - 2, h - 2); px(b, l, 1, 1, w - 2, 1); px(b, l, 1, 1, 1, h - 2); px(b, l, 2, 2, 2, 1);
  const ox = Math.floor((w - 8) / 2), oy = Math.floor((h - 8) / 2); IN_MARK[k].forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') px(b, d, ox + x * 2, oy + y * 2, 2, 2); }));
});
const IN_TILE = IN.COLS.map((_, k) => inTile(k, IN.C, IN.C)), IN_BTN = IN.COLS.map((_, k) => inTile(k, 33, 20));
const ins = gstore('inondation', {level: 1, top: 1, won: 0, games: 0});
let fl = null;
const inLimit = lv => Math.max(22, 30 - Math.floor((lv - 1) / 4));  // un joueur glouton (un coup d'avance) finit en 27 à 32 coups
const inDay = (k = 0) => { const d = new Date(Date.now() - k * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function inNew(level = ins.level) {
  const m = ins.mode || 'solo', duel = m === 'ordi' || m === 'deux', N = IN.N; if (m === 'solo') ins.level = level; saveGames();
  const r = seeded(m === 'jour' ? +inDay().replace(/-/g, '') : duel || ins.rnd ? Math.floor(Math.random() * 1e9) : level * 4391 + 7);
  fl = Object.assign(fl || {tick: 0, raf: 0}, {mode: 'play', grid: Array.from({length: N}, () => Array.from({length: N}, () => Math.floor(r() * 6))), moves: 0, limit: m === 'jour' ? 28 : inLimit(level), flow: new Map(), endAt: 0, daily: m === 'jour', duel: null});
  clearTimeout(inAiT);
  if (duel) { if (fl.grid[N - 1][N - 1] === fl.grid[0][0]) fl.grid[N - 1][N - 1] = (fl.grid[0][0] + 1 + Math.floor(r() * 5)) % 6; fl.duel = {ai: m === 'ordi', turn: 0, own2: inRegion(fl.grid, N - 1, N - 1), res: null}; }
  fl.own = inRegion(fl.grid); inInfo();
}
// le duel : chacun part de son coin (toi en haut à gauche, l’autre en bas à droite) ; on ne peut pas prendre la couleur de l’autre ; plus de la moitié de la grille gagne
let inAiT = 0;
function inDuel(c, ai = false) {
  const d = fl.duel, me = d.turn, N = IN.N, [cx, cy] = me ? [N - 1, N - 1] : [0, 0], mine = me ? d.own2 : fl.own;
  if (d.ai && me === 1 && !ai) return;
  if (c === fl.grid[0][0] || c === fl.grid[N - 1][N - 1]) { beep(140, .06); return; }
  const old = fl.grid.map(r => r.slice()); for (const k of mine) { const [x, y] = k.split(',').map(Number); fl.grid[y][x] = c; }
  const reg = inRegion(fl.grid, cx, cy), grow = reg.size - mine.size; if (me) d.own2 = reg; else fl.own = reg; fl.moves++;
  fl.flow = new Map(); for (const [k, dist] of inDist(reg, cx, cy)) { const [x, y] = k.split(',').map(Number); fl.flow.set(k, {from: old[y][x], t: fl.tick + dist * .9}); }
  beep(me ? 220 + reg.size * 2 : 300 + reg.size * 3, .06, 'triangle', 0, .05 + Math.min(.05, grow / 400));
  const a = fl.own.size, b = d.own2.size, tot = N * N;
  if (a * 2 > tot || b * 2 > tot || a + b === tot) {
    d.res = a > b ? 0 : b > a ? 1 : -1; fl.mode = d.res === 0 || (!d.ai && d.res === 1) ? 'won' : 'over'; fl.endAt = fl.tick;
    if (d.ai) { const s = (ins.duel ??= {w: 0, l: 0, d: 0}); s[d.res === 0 ? 'w' : d.res === 1 ? 'l' : 'd']++; saveGames(); }
    [523, 659, 784].forEach((f, i) => setTimeout(() => beep(d.res === 1 && d.ai ? f / 2 : f, .14, 'triangle'), i * 110));
  } else { d.turn = 1 - me; if (d.ai && d.turn === 1) inAiT = setTimeout(inAi, 550); }
  inInfo();
}
const inGain = (grid, own, c, cx, cy) => { const gg = grid.map(r => r.slice()); for (const k of own) { const [x, y] = k.split(',').map(Number); gg[y][x] = c; } return inRegion(gg, cx, cy).size; };
function inAi() {  // l’ordi prend la couleur qui lui rapporte le plus ; à égalité, celle qui en laisse le moins à toi au coup d’après
  if (!fl?.duel || fl.mode !== 'play' || fl.duel.turn !== 1) return; const N = IN.N, d = fl.duel, ban = [fl.grid[0][0], fl.grid[N - 1][N - 1]]; let bk = -1, bs = -1e9;
  for (let c = 0; c < 6; c++) { if (ban.includes(c)) continue; const gg = fl.grid.map(r => r.slice()); for (const k of d.own2) { const [x, y] = k.split(',').map(Number); gg[y][x] = c; }
    let you = 0; for (let e = 0; e < 6; e++) if (e !== c && e !== fl.grid[0][0]) you = Math.max(you, inGain(gg, fl.own, e, 0, 0));
    const sc = inRegion(gg, N - 1, N - 1).size * 3 - you; if (sc > bs) { bs = sc; bk = c; } }
  if (bk >= 0) inDuel(bk, true);
}
function inRegion(grid, x0 = 0, y0 = 0) {  // les cases reliées au coin, de la même couleur que lui
  const c = grid[y0][x0], seen = new Set([x0 + ',' + y0]), q = [[x0, y0]];
  while (q.length) { const [x, y] = q.pop(); for (const [a, b] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) if (grid[b]?.[a] === c && !seen.has(a + ',' + b)) { seen.add(a + ',' + b); q.push([a, b]); } }
  return seen;
}
function inDist(own, x0 = 0, y0 = 0) {  // la distance de chaque case de ta tache au coin, en suivant la tache (l'eau coule par là)
  const d = new Map([[x0 + ',' + y0, 0]]), q = [[x0, y0]];
  for (let i = 0; i < q.length; i++) { const [x, y] = q[i], n = d.get(x + ',' + y); for (const k of [(x + 1) + ',' + y, (x - 1) + ',' + y, x + ',' + (y + 1), x + ',' + (y - 1)]) if (own.has(k) && !d.has(k)) { d.set(k, n + 1); q.push(k.split(',').map(Number)); } }
  return d;
}
function inPlay(c) {
  if (fl.mode !== 'play') return; if (fl.duel) return inDuel(c); if (c === fl.grid[0][0]) return;
  const before = fl.own.size, old = fl.grid.map(r => r.slice()); for (const k of fl.own) { const [x, y] = k.split(',').map(Number); fl.grid[y][x] = c; }
  fl.own = inRegion(fl.grid); fl.moves++;
  fl.flow = new Map(); for (const [k, dist] of inDist(fl.own)) { const [x, y] = k.split(',').map(Number); fl.flow.set(k, {from: old[y][x], t: fl.tick + dist * .9}); }
  beep(300 + fl.own.size * 3, .06, 'triangle', 0, .05 + Math.min(.05, (fl.own.size - before) / 400));
  if (fl.own.size === IN.N * IN.N) { fl.mode = 'won'; fl.endAt = fl.tick;
    if (fl.daily) { const dl = (ins.daily ??= {last: '', streak: 0, best: 0}); if (dl.last !== inDay()) { dl.streak = dl.last === inDay(1) ? dl.streak + 1 : 1; dl.best = Math.max(dl.best, dl.streak); dl.last = inDay(); } if (dl.moves == null || dl.day !== inDay() || fl.moves < dl.moves) { dl.moves = fl.moves; dl.day = inDay(); } saveGames(); }
    else { ins.won++; ins.games++; if (ins.level >= ins.top) ins.top = ins.level + 1; best('inond' + ins.level, -fl.moves); saveGames(); } [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .14, 'triangle'), i * 100)); }
  else if (fl.moves >= fl.limit) { fl.mode = 'over'; fl.endAt = fl.tick; if (!fl.daily) ins.games++; saveGames(); beep(160, .4, 'sawtooth', 80, .08); }
  inInfo();
}
const IN_BG = cnv(W, H, b => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px(b, (x * 3 + y * 5) % 11 === 0 ? '#0e2240' : (x + y) % 2 ? '#0a1a34' : '#08162c', x, y); px(b, '#05010b', IN.X0 - 3, IN.Y0 - 3, IN.N * IN.C + 6, IN.N * IN.C + 6); px(b, '#2e5a9a', IN.X0 - 2, IN.Y0 - 2, IN.N * IN.C + 4, 1); });
const inPal = k => [IN.X0 + k * 38, IN.Y0 + IN.N * IN.C + 12];
function inDraw() {
  g.drawImage(IN_BG, 0, 0);
  const C = IN.C;
  for (let y = 0; y < IN.N; y++) for (let x = 0; x < IN.N; x++) {
    const X = IN.X0 + x * C, Y = IN.Y0 + y * C, f = fl.flow.get(x + ',' + y), p = f ? (fl.tick - f.t) / 10 : 9;
    if (p >= 1.6 || f.from === fl.grid[y][x] && p >= 1) { g.drawImage(IN_TILE[fl.grid[y][x]], X, Y); continue; }
    const h = Math.max(0, Math.min(C, Math.round(p * C))); g.drawImage(IN_TILE[f.from], X, Y);  // l'ancienne couleur, puis la nouvelle qui monte depuis le bas
    if (h) { g.drawImage(IN_TILE[fl.grid[y][x]], 0, C - h, C, h, X, Y + C - h, C, h); if (h < C) { px(g, IN.COLS[fl.grid[y][x]][1], X + 1, Y + C - h, C - 2, 1); px(g, '#ffffff', X + 2 + (fl.tick >> 1) % (C - 6), Y + C - h, 3, 1); } }
    else if (p > -.3) px(g, '#ffffff', X + 3, Y + C - 2, C - 6, 1);
    if (p >= 1 && p < 1.6) { g.globalAlpha = .35 * (1.6 - p); px(g, '#ffffff', X + 1, Y + 1, C - 2, C - 2); g.globalAlpha = 1; }  // l'éclat quand la case est pleine
  }
  if (fl.mode === 'play') for (const k of fl.own) { if (((k.length * 7 + fl.tick) >> 3) % 23) continue; const [x, y] = k.split(',').map(Number); px(g, '#ffffff', IN.X0 + x * C + 4 + (fl.tick >> 2) % 6, IN.Y0 + y * C + 5, 3, 1); }  // des reflets qui passent sur l'eau
  for (const k of fl.own) { const [x, y] = k.split(',').map(Number); if (!fl.own.has(x + ',' + (y - 1))) px(g, '#ffffff', IN.X0 + x * IN.C, IN.Y0 + y * IN.C, IN.C, 1); if (!fl.own.has((x - 1) + ',' + y)) px(g, '#ffffff', IN.X0 + x * IN.C, IN.Y0 + y * IN.C, 1, IN.C); }  // le contour de ta tache
  if (fl.duel) for (const k of fl.duel.own2) { const [x, y] = k.split(',').map(Number), o = fl.duel.own2, X = IN.X0 + x * IN.C, Y = IN.Y0 + y * IN.C;  // celui de l’autre, en jaune
    if (!o.has(x + ',' + (y + 1))) px(g, '#ffd84a', X, Y + IN.C - 1, IN.C, 1); if (!o.has((x + 1) + ',' + y)) px(g, '#ffd84a', X + IN.C - 1, Y, 1, IN.C); if (!o.has(x + ',' + (y - 1))) px(g, '#ffd84a', X, Y, IN.C, 1); if (!o.has((x - 1) + ',' + y)) px(g, '#ffd84a', X, Y, 1, IN.C); }
  for (let k = 0; k < 6; k++) { const [x, y] = inPal(k), on = fl.hover === k && fl.mode === 'play', cur = k === fl.grid[0][0] || (fl.duel && k === fl.grid[IN.N - 1][IN.N - 1]);
    px(g, on ? '#ffffff' : '#05010b', x - 1, y - 1 - (on ? 1 : 0), 35, 22); g.drawImage(IN_BTN[k], x, y - (on ? 1 : 0)); PXK.fill(g, String(k + 1), x + 4, y + 12, IN.COLS[k][2], 1);
    if (cur) { g.globalAlpha = .6; px(g, '#05010b', x, y, 33, 20); g.globalAlpha = 1; } }
  const dn = fl.duel && inNames(), tot = IN.N * IN.N;
  if (fl.duel) { const t = fl.duel.turn, pc = n => Math.round(n / tot * 100) + ' %'; pxFont(g, (t === 0 && fl.mode === 'play' ? '▶ ' : '') + dn[0] + ' ' + pc(fl.own.size), IN.X0, 15, '#ffffff', 8); pxFont(g, dn[1] + ' ' + pc(fl.duel.own2.size) + (t === 1 && fl.mode === 'play' ? ' ◀' : ''), W - 16, 15, '#ffd84a', 8, 'right'); }
  else { pxFont(g, 'COUPS ' + fl.moves + ' / ' + fl.limit, IN.X0, 15, fl.limit - fl.moves <= 3 ? '#ff4a5a' : '#ffffff', 8); pxFont(g, fl.daily ? 'DU JOUR' : 'NIVEAU ' + ins.level, W - 16, 15, fl.daily ? '#ffd84a' : '#a8c0e0', 8, 'right'); }
  const end = (title, col, lines) => { px(g, 'rgba(3,10,20,.8)', 0, 96, W, 82); PXK.fill(g, title, W / 2 + 2, 126, '#05010b', 2, 'center'); PXK.fill(g, title, W / 2, 124, col, 2, 'center'); lines.forEach(([t, c], i) => pxFont(g, t, W / 2, 146 + i * 16, c, 8, 'center')); };
  if (fl.duel && fl.mode !== 'play' && fl.tick - fl.endAt > 30) { const r = fl.duel.res; end(r < 0 ? 'ÉGALITÉ' : fl.duel.ai ? (r === 0 ? 'GAGNÉ !' : 'L’ORDI GAGNE') : dn[r] + ' GAGNE !', r === 0 || (r === 1 && !fl.duel.ai) ? '#5fdf6a' : r < 0 ? '#ffd84a' : '#ff4a5a', [[fl.own.size + ' cases contre ' + fl.duel.own2.size, '#ffffff'], ['Clic : nouvelle partie', '#ffd84a']]); }
  else if (fl.mode === 'won' && fl.tick - fl.endAt > 30) end('TOUT EST INONDÉ !', '#5fdf6a', [[fl.moves + ' coups sur ' + fl.limit, '#ffffff'], [fl.daily ? 'Reviens demain pour une autre grille' : 'Clic : niveau suivant', '#ffd84a']]);
  else if (fl.mode === 'over' && fl.tick - fl.endAt > 30) end('PLUS DE COUPS', '#ff4a5a', [[Math.round(fl.own.size / (IN.N * IN.N) * 100) + ' % couvert', '#ffffff'], ['Clic : réessayer', '#ffd84a']]);
  if (fl.duel) cv.setAttribute('aria-label', 'Inondation en duel : ' + dn[0] + ' ' + fl.own.size + ' cases, ' + dn[1] + ' ' + fl.duel.own2.size + ' cases, au tour de ' + dn[fl.duel.turn]); else
  cv.setAttribute('aria-label', 'Inondation, ' + (fl.daily ? 'grille du jour' : 'niveau ' + ins.level) + ' : coups ' + ins.level + ' : coups ' + fl.moves + ' sur ' + fl.limit + ', ' + Math.round(fl.own.size / (IN.N * IN.N) * 100) + ' % couvert');
}
const inNames = () => fl.duel.ai ? ['TOI', 'ORDI'] : ['J1', 'J2'];
const inAgain = () => inNew(fl.mode === 'won' && !fl.duel && !fl.daily ? ins.level + 1 : ins.level);
const inAt = e => { const [x, y] = cpos(e); for (let k = 0; k < 6; k++) { const [px0, py0] = inPal(k); if (x >= px0 && x < px0 + 33 && y >= py0 && y < py0 + 20) return k; } const cx = Math.floor((x - IN.X0) / IN.C), cy = Math.floor((y - IN.Y0) / IN.C); return cx >= 0 && cy >= 0 && cx < IN.N && cy < IN.N ? fl.grid[cy][cx] : -1; };
cv.onpointermove = e => { if (fl) fl.hover = inAt(e); };
cv.onpointerdown = e => { e.preventDefault(); if (!fl) return; if (fl.mode !== 'play') { if (fl.tick - fl.endAt > 30) inAgain(); return; } const k = inAt(e); if (k >= 0) inPlay(k); };
document.addEventListener('keydown', e => { if (!keyOk(e) || !fl) return; const k = '123456'.indexOf(e.key); if (k >= 0) inPlay(k); if (e.key === ' ' && fl.mode !== 'play') { e.preventDefault(); inAgain(); } });
function inInfo() { $('inMode').value = ins.mode || 'solo'; const dl = ins.daily, du = ins.duel || {w: 0, l: 0, d: 0};
  if (fl?.daily) return showStats([['Grille du jour', dl?.last === inDay() ? 'faite ✓ en ' + dl.moves + ' coups' : 'à faire'], ['Série de jours', (dl?.last === inDay() || dl?.last === inDay(1) ? dl.streak : 0) + ' (record ' + (dl?.best || 0) + ')']]);
  if (fl?.duel) return showStats([['Contre l’ordi', du.w + ' gagnés · ' + du.l + ' perdus' + (du.d ? ' · ' + du.d + ' nuls' : '')], ['Règle', 'plus de la moitié gagne']]);
  const b = games.best['inond' + ins.level]; showStats([['Niveau le plus loin', ins.top], ['Record de ce niveau', b != null ? -b + ' coups' : '—'], ['Grilles réussies', ins.won + ' / ' + ins.games]]); }
$('gNew').onclick = () => { inNew(ins.level); $('gNew').blur(); };
$('inRnd').checked = !!ins.rnd; $('inRnd').onchange = () => { ins.rnd = $('inRnd').checked; saveGames(); inNew(ins.level); $('inRnd').blur(); };  // plans au hasard : la taille suit toujours le niveau

$('inMode').onchange = () => { ins.mode = $('inMode').value; saveGames(); inNew(ins.level); $('inMode').blur(); };
$('inPrev').onclick = () => { if ((ins.mode || 'solo') !== 'solo') return; if (ins.level > 1) inNew(ins.level - 1); $('inPrev').blur(); }; $('inNext').onclick = () => { if ((ins.mode || 'solo') !== 'solo') return; if (ins.level < ins.top) inNew(ins.level + 1); $('inNext').blur(); };
$('gFs').onclick = () => { const box = cv.parentElement; document.fullscreenElement ? document.exitFullscreen() : box.requestFullscreen?.().catch(() => {}); $('gFs').blur(); };
function inCheck() {  // vérification : jouer la couleur la plus rentable finit toujours la grille, pas très loin de la limite ; l'eau part du coin
  const keep = fl, ks = JSON.stringify(ins), kb = {...games.best}; let ok = true, flow = true;
  for (const lv of [1, 7, 20]) { fl = null; inNew(lv); let n = 0; while (fl.mode === 'play' && n < 60) { let bk = 0, bs = -1; for (let c = 0; c < 6; c++) { if (c === fl.grid[0][0]) continue; const gg = fl.grid.map(r => r.slice()); for (const k of fl.own) { const [x, y] = k.split(',').map(Number); gg[y][x] = c; } const s = inRegion(gg).size; if (s > bs) { bs = s; bk = c; } } fl.limit = 99; inPlay(bk); n++;
      if (n === 3) { const f = fl.flow; flow &&= f.size === fl.own.size && f.get('0,0').t === fl.tick && [...f.values()].every(v => v.t >= fl.tick); } } ok &&= fl.mode === 'won' && n <= inLimit(lv) + 12; }
  let duel = true, daily = true; const km = ins.mode;
  for (let t = 0; t < 4; t++) { ins.mode = 'ordi'; fl = null; inNew(1); let n = 0; while (fl.mode === 'play' && n < 300) { const N = IN.N, ban = [fl.grid[0][0], fl.grid[N - 1][N - 1]];
      if (fl.duel.turn === 0) { let c = 0; while (ban.includes(c)) c++; inDuel(c); } else { clearTimeout(inAiT); const t0 = fl.moves; inAi(); duel &&= fl.moves === t0 + 1 && !ban.includes(fl.grid[N - 1][N - 1]) || fl.mode !== 'play'; } n++; }
    duel &&= fl.mode !== 'play' && fl.own.size + fl.duel.own2.size <= IN.N * IN.N && [...fl.own].every(k => !fl.duel.own2.has(k)); }
  ins.mode = 'jour'; fl = null; inNew(1); const g1 = JSON.stringify(fl.grid); inNew(5); daily = g1 === JSON.stringify(fl.grid) && fl.daily && fl.limit === 28;
  ins.mode = km; clearTimeout(inAiT);
  fl = keep; for (const k of Object.keys(ins)) delete ins[k]; Object.assign(ins, JSON.parse(ks)); games.best = kb;
  return [ok ? '' : 'grille non finie', duel ? '' : 'duel', daily ? '' : 'grille du jour', flow ? '' : 'écoulement', inPal(5)[0] + 33 <= W && inPal(0)[1] + 20 <= H ? '' : 'palette hors cadre'].filter(Boolean).join(' | ') || 'ok';
}
{ const c = inCheck(); console.assert(c === 'ok', 'inondation', c); cv.__in = {check: inCheck, st: () => fl, play: k => inPlay(k), ai: () => { clearTimeout(inAiT); inAi(); }, again: () => inNew(ins.level), ins}; }
ctx.onOpen(() => { if (!fl) inNew(); gameLoop(fl, 'inondation', () => {}, inDraw); inInfo(); });

}
