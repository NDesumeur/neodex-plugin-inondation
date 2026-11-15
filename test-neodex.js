// lancé par le test « local » de NeoDex : la vérification interne (grilles finies, l'eau qui part du coin), quelques coups à la souris
// avec l'eau qui s'écoule, la fin de partie, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('gc').__in, fl = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('gc').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'inondation-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  // un clic sur la palette, en coordonnées du canevas (256 × 284)
  const click = (x, y) => pj(`(() => { const c = document.getElementById('gc'), r = c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('pointerdown', {clientX: r.left + ${x} / 256 * r.width, clientY: r.top + ${y} / 284 * r.height, bubbles: true})); })(), 0`);
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  await C('T.again(); return 0;'); await sleep(200); await shot('0-depart');
  // la couleur voisine la plus fréquente, choisie sur la palette : 6 boutons de 33 px, tous les 38 px, à y 258
  const pick = `const own = fl.own, cnt = [0,0,0,0,0,0]; for (const k of own) { const [x, y] = k.split(',').map(Number); for (const [a, b] of [[x+1,y],[x,y+1]]) if (fl.grid[b]?.[a] != null && !own.has(a+','+b)) cnt[fl.grid[b][a]]++; } cnt[fl.grid[0][0]] = -1; return cnt.indexOf(Math.max(...cnt));`;
  for (let i = 0; i < 6; i++) { const k = await C(pick); await click(16 + k * 38 + 16, 268); await sleep(i === 5 ? 120 : 500); }
  await shot('1-ecoulement'); await sleep(900); await shot('2-apres');
  const s = await C('return { moves: fl.moves, own: fl.own.size, flow: fl.flow.size };');
  if (s.moves !== 6 || s.own < 8 || s.flow !== s.own) throw new Error('les clics sur la palette devaient jouer : ' + JSON.stringify(s));
  await C('fl.limit = fl.moves + 1; return 0;'); await C(pick.replace('return cnt.indexOf(Math.max(...cnt));', 'T.play(cnt.indexOf(Math.max(...cnt))); return 0;'));
  await sleep(900); if (await C('return fl.mode;') !== 'over') throw new Error('la partie devait finir sans coups'); await shot('3-fin');
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  // plein écran, et la zone de jeu qui tient dans la fenêtre
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(200);
  await pj(`document.getElementById('gFs').click(), 0`); await sleep(800);
  const fs = await pj(`(() => { const c = document.getElementById('gc'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(400);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('gc').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('gc').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  await C('T.again(); return 0;');
  return 'vérification ok · 6 coups à la palette, ' + s.own + ' cases inondées · fin sans coups · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
