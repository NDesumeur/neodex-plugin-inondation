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
  // la grille du jour : la même à chaque départ ; puis le duel contre l'ordi (il répond tout seul) et le duel à deux (chacun son tour)
  const mode = async m => { await pj(`(() => { const s = document.getElementById('inMode'); s.value = '${m}'; s.dispatchEvent(new Event('change')); return 0; })()`); await sleep(200); };
  const dg = []; for (let k = 0; k < 2; k++) { await mode('jour'); dg.push(await C('return fl.daily + JSON.stringify(fl.grid) + fl.limit;')); }
  if (dg[0] !== dg[1] || !dg[0].startsWith('true') || !dg[0].endsWith('28')) throw new Error('grille du jour');
  if (!/Grille du jour/.test(await pj(`document.getElementById('gStats').textContent`))) throw new Error('grille du jour : stats');
  await shot('4-du-jour');
  const free = `const N = 14, ban = [fl.grid[0][0], fl.grid[N-1][N-1]]; let c = 0; while (ban.includes(c)) c++; return c;`;
  await mode('ordi'); const o0 = await C('return fl.duel.own2.size;');
  for (let t = 0; t < 3; t++) { const c = await C(free); await click(16 + c * 38 + 16, 268); await sleep(80);
    if (await C('return fl.duel.turn;') !== 1) throw new Error('duel : le coup devait passer la main à l’ordi');
    await click(16 + c * 38 + 16, 268); await sleep(900); }
  const od = await C('return fl.duel.turn + "|" + fl.moves + "|" + (fl.duel.own2.size >= ' + o0 + ');'); if (od !== '0|6|true') throw new Error('duel contre l’ordi : ' + od);
  await shot('5-duel-ordi');
  await mode('deux'); for (let t = 0; t < 2; t++) { const c = await C(free); await click(16 + c * 38 + 16, 268); await sleep(300); }
  if (await C('return fl.duel.turn + "|" + fl.moves + "|" + fl.duel.ai;') !== '0|2|false') throw new Error('duel à deux');
  await shot('6-duel-deux');
  await C('fl.duel.own2 = new Set(); for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) if (x + y > 14) fl.duel.own2.add(x + "," + y); return 0;');
  await mode('ordi'); await C('const N = 14; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) fl.grid[y][x] = x + y < 13 ? 0 : 1; fl.grid[0][0] = 0; fl.own = new Set(); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (x + y < 13) fl.own.add(x + "," + y); fl.duel.own2 = new Set(); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (x + y > 13) { fl.duel.own2.add(x + "," + y); fl.grid[y][x] = 1; } for (let x = 0; x < N; x++) fl.grid[13 - x][x] = 2; T.play(2); return 0;');
  await sleep(900); const fin = await C('return fl.mode + "|" + fl.duel.res;'); if (fin !== 'won|0') throw new Error('fin du duel : ' + fin); await shot('7-duel-fin');
  await mode('solo');
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
