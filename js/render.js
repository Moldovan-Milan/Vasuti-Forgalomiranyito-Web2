import { COLORS, CFG, WORLD, getGeom, signalPos, formatTime, errorCount } from './state.js';

const TAU = Math.PI * 2;
const INK = '#2b2a26';

function drawBackground(ctx) {
  ctx.save();
  ctx.fillStyle = '#ece2c8';
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.strokeStyle = 'rgba(43, 42, 38, 0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= WORLD.w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.h); }
  for (let y = 0; y <= WORLD.h; y += 40) { ctx.moveTo(0, y); ctx.lineTo(WORLD.w, y); }
  ctx.stroke();
  ctx.restore();
}

function drawTracks(ctx, geo) {
  for (const e of Object.values(geo.edges)) {
    const nx = -e.uy;
    const ny = e.ux;
    ctx.save();
    ctx.lineCap = 'butt';
    // zúzottkő ágy
    ctx.strokeStyle = '#cdbf9c';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(e.ax, e.ay);
    ctx.lineTo(e.bx, e.by);
    ctx.stroke();
    // talpfák
    ctx.strokeStyle = '#8a6d46';
    ctx.lineWidth = 15;
    ctx.setLineDash([3, 9]);
    ctx.stroke();
    ctx.setLineDash([]);
    // sínszálak
    ctx.strokeStyle = '#3b3a36';
    ctx.lineWidth = 2.5;
    for (const side of [-4, 4]) {
      ctx.beginPath();
      ctx.moveTo(e.ax + nx * side, e.ay + ny * side);
      ctx.lineTo(e.bx + nx * side, e.by + ny * side);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function plaque(ctx, text, cx, cy, fill, textColor) {
  ctx.save();
  ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = fill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.fillRect(cx - w / 2, cy - 10, w, 20);
  ctx.strokeRect(cx - w / 2, cy - 10, w, 20);
  ctx.fillStyle = textColor;
  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

function drawStations(ctx, g) {
  for (const n of Object.values(g.level.nodes)) {
    if (n.type === 'station') {
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.fillStyle = COLORS[n.color].hex;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.fillRect(-10, -28, 20, 56);
      ctx.strokeRect(-10, -28, 20, 56);
      ctx.restore();
      plaque(ctx, n.label, n.x - 20, n.y - 42, '#fbf6ea', INK);
    } else if (n.type === 'entry') {
      plaque(ctx, `${(n.label || 'Belépő').toUpperCase()} ▶`, n.x + 50, n.y - 22, INK, '#ffb000');
    }
  }
}

function drawSwitches(ctx, g, geo) {
  for (const [id, states] of Object.entries(g.level.switches)) {
    const n = g.level.nodes[id];
    const st = states[g.switches[id]];
    const out = geo.edges[st.to];
    const inc = geo.edges[st.from];
    ctx.save();
    ctx.translate(n.x, n.y);
    // rombusz alakú váltójelző
    ctx.fillStyle = '#b8862b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -17); ctx.lineTo(17, 0); ctx.lineTo(0, 17); ctx.lineTo(-17, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.lineCap = 'round';
    // bejövő ág (vékony, sötét)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-inc.ux * 11, -inc.uy * 11);
    ctx.stroke();
    // kimenő ág (vastag nyíl)
    ctx.strokeStyle = '#a8442a';
    ctx.fillStyle = '#a8442a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(out.ux * 20, out.uy * 20);
    ctx.stroke();
    ctx.save();
    ctx.translate(out.ux * 24, out.uy * 24);
    ctx.rotate(Math.atan2(out.uy, out.ux));
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(-4, -5); ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }
}

function drawSignals(ctx, g) {
  for (const s of g.level.signals) {
    const p = signalPos(g.level, s);
    const green = g.signals[s.id];
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.px, p.py);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = INK;
    ctx.fillRect(-10, -18, 20, 36);
    const lamp = (cy, color, lit) => {
      ctx.save();
      ctx.fillStyle = lit ? color : '#4a4943';
      if (lit) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
      ctx.beginPath();
      ctx.arc(0, cy, 6.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    };
    lamp(-8, '#ff3b30', !green);
    lamp(8, '#34d058', green);
    ctx.restore();
  }
}

function drawExplosion(ctx, clock) {
  ctx.save();
  ctx.rotate(clock * 2);
  ctx.fillStyle = '#f97316';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 12; i += 1) {
    const r = i % 2 === 0 ? 30 : 14;
    const a = (i / 12) * TAU;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function trainBody(ctx, hex, outline, lw) {
  ctx.fillStyle = hex;
  ctx.strokeStyle = outline;
  ctx.lineWidth = lw;
  ctx.fillRect(-16, -9, 32, 18);
  ctx.strokeRect(-16, -9, 32, 18);
}

function drawTrains(ctx, g, clock) {
  for (const t of g.trains) {
    if (t.state === 'pending' || t.state === 'done') continue;
    ctx.save();
    ctx.translate(t.x, t.y);
    if (t.state === 'crashed') {
      drawExplosion(ctx, clock);
      ctx.restore();
      plaque(ctx, 'ÜTKÖZÉS', t.x, t.y - 38, '#a8442a', '#fff7e0');
      continue;
    }
    if (t.state === 'derailed') {
      ctx.rotate(t.angle + 0.5);
      trainBody(ctx, '#8d8a80', '#a8442a', 3);
      ctx.strokeStyle = '#a8442a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -5); ctx.lineTo(10, 5);
      ctx.moveTo(10, -5); ctx.lineTo(-10, 5);
      ctx.stroke();
      ctx.restore();
      plaque(ctx, 'KISIKLÁS', t.x, t.y - 26, '#a8442a', '#fff7e0');
      continue;
    }
    ctx.rotate(t.angle);
    const outline = t.atRed ? '#d62828' : (t.braked ? '#e0a100' : INK);
    trainBody(ctx, COLORS[t.color].hex, outline, t.atRed || t.braked ? 4 : 2.5);
    // ablaksor és fényszóró
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillRect(-10, -4, 16, 8);
    ctx.fillStyle = '#fff3a8';
    ctx.fillRect(14, -5, 4, 10);
    ctx.restore();
    if (t.braked) plaque(ctx, 'FÉK', t.x, t.y - 26, '#e0a100', INK);
    else if (t.atRed) plaque(ctx, 'TILOS', t.x, t.y - 26, '#d62828', '#fff7e0');
  }
}

function drawWarnings(ctx, g, clock) {
  const phase = (Math.sin(clock * 8) + 1) / 2;
  for (const w of g.warnings) {
    ctx.save();
    ctx.setLineDash([9, 6]);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = `rgba(214, 40, 40, ${0.45 + 0.55 * phase})`;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r + phase * 6, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBanner(ctx, text, color) {
  ctx.save();
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.textAlign = 'center';
  const w = ctx.measureText(text).width + 34;
  ctx.fillStyle = INK;
  ctx.fillRect(WORLD.w / 2 - w / 2, 14, w, 34);
  ctx.fillStyle = color;
  ctx.fillText(text, WORLD.w / 2, 38);
  ctx.restore();
}

export function render(ctx, g, view) {
  const geo = getGeom(g.level);
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  drawBackground(ctx);
  drawTracks(ctx, geo);
  drawStations(ctx, g);
  drawSwitches(ctx, g, geo);
  drawSignals(ctx, g);
  drawTrains(ctx, g, view.clock);
  drawWarnings(ctx, g, view.clock);

  if (g.deadlock) drawBanner(ctx, 'HOLTPONT GYANÚ: minden vonat áll!', '#ffb000');
  if (view.paused) drawBanner(ctx, 'SZÜNET', '#ffb000');
}

// HUD szöveges mezők frissítése (az elemeket az app.js adja át)
export function updateHud(hud, g) {
  hud.player.textContent = g.player;
  hud.level.textContent = `${g.level.name} (${g.level.difficulty})`;
  hud.time.textContent = formatTime(g.time);
  hud.traffic.textContent = `${g.stats.delivered} / ${g.trains.length}`;
  hud.errors.textContent = String(errorCount(g));
  if (hud.hint) hud.hint.textContent = g.level.hint || '';
  if (hud.timetable) hud.timetable.textContent = timetableText(g);
}

function trainStatus(t) {
  switch (t.state) {
    case 'pending': return 'várakozik a belépőnél';
    case 'moving': return t.braked ? 'vészfékezve' : (t.atRed ? 'vörös jelzőnél áll' : 'úton');
    case 'done': return t.ok ? 'célba ért ✔' : 'rossz peron ✘';
    case 'derailed': return 'kisiklott ✘';
    default: return 'ütközött ✘';
  }
}

function timetableText(g) {
  const head = 'Vonat  Cél peron  Belépő     Indul  Állapot';
  const rows = g.trains.map((t) => {
    const startEdge = g.level.trains.find((x) => x.id === t.id).edge;
    const startNode = g.level.nodes[g.level.edges.find((e) => e.id === startEdge).from];
    return `${t.id.padEnd(7)}${COLORS[t.color].name.padEnd(12)}${(startNode.label || '').padEnd(11)}${formatTime(t.spawn).padEnd(7)}${trainStatus(t)}`;
  });
  return [head, ...rows].join('\n');
}

export { CFG };
