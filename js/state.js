export const WORLD = { w: 1000, h: 560 };

export const CFG = {
  GAP: 85,            // minimális követési távolság ugyanazon a vágányon (px)
  WARN: 75,           // korai figyelmeztetés távolsága (px)
  CRIT: 20,           // ütközési limit (px)
  STOP_BEFORE: 16,    // ennyivel a jelző előtt áll meg a vonat
  IDLE_LIMIT: 20,     // ennyi mp mozdulatlanság után holtpont-gyanú
  SIGNAL_OFFSET: 26,  // a jelző távolsága a sínektől
  SWITCH_HIT: 22,
  SIGNAL_HIT: 18,
  TRAIN_HIT: 18,
};

export const COLORS = {
  red:    { hex: '#ef4444', name: 'Piros' },
  orange: { hex: '#f59e0b', name: 'Narancs' },
  green:  { hex: '#10b981', name: 'Zöld' },
  blue:   { hex: '#3b82f6', name: 'Kék' },
};

export const LEVELS = [
  {
    id: 1,
    name: '1. szint: Kitérő vágány jelzőkkel',
    difficulty: 'Könnyű',
    hint: 'Egyetlen belépő, két váltó. A bal váltó dönt a főág (egyenes) és a kitérő (alsó hurok) között, a jobb váltó pedig a peronok között. ' +
      'A jobb váltót mindig arról az ágról engedi át, amelyre állítottad: a vonat érkezése előtt állítsd be!',
    nodes: {
      in:  { x: 40,  y: 280, type: 'entry', label: 'Belépő' },
      s1:  { x: 240, y: 280, type: 'switch' },
      p:   { x: 430, y: 410, type: 'plain' },
      s2:  { x: 620, y: 280, type: 'switch' },
      red: { x: 900, y: 170, type: 'station', color: 'red',  label: '1. Vágány (Piros)' },
      blue:{ x: 900, y: 390, type: 'station', color: 'blue', label: '2. Vágány (Kék)' },
    },
    edges: [
      { id: 'e0', from: 'in', to: 's1' },
      { id: 'm',  from: 's1', to: 's2' },
      { id: 'p1', from: 's1', to: 'p' },
      { id: 'p2', from: 'p',  to: 's2' },
      { id: 'r',  from: 's2', to: 'red' },
      { id: 'b',  from: 's2', to: 'blue' },
    ],
    switches: {
      s1: [{ from: 'e0', to: 'm' }, { from: 'e0', to: 'p1' }],
      s2: [{ from: 'm', to: 'r' }, { from: 'm', to: 'b' }, { from: 'p2', to: 'r' }, { from: 'p2', to: 'b' }],
    },
    signals: [
      { id: 'J1', edge: 'e0', at: 150 },
      { id: 'J2', edge: 'm',  at: 100 },
      { id: 'J3', edge: 'p2', at: 120 },
    ],
    trains: [
      { id: 'T1', color: 'red',  speed: 90,  spawn: 3,  edge: 'e0' },
      { id: 'T2', color: 'blue', speed: 80,  spawn: 16, edge: 'e0' },
      { id: 'T3', color: 'blue', speed: 100, spawn: 30, edge: 'e0' },
      { id: 'T4', color: 'red',  speed: 70,  spawn: 44, edge: 'e0' },
    ],
  },
  {
    id: 2,
    name: '2. szint: Rendező-pályaudvar',
    difficulty: 'Közepes',
    hint: 'Az A (felső) belépő vonatai a Piros vagy a Zöld, a B (alsó) belépő vonatai a Kék vagy a Zöld peronra tartanak. ' +
      'A Zöld peronhoz a közös középső ág vezet, ahol egyszerre csak egy vonat mehet: használd a jelzőket és a középső váltót!',
    nodes: {
      a:  { x: 40,  y: 130, type: 'entry', label: 'A belépő' },
      b:  { x: 40,  y: 430, type: 'entry', label: 'B belépő' },
      s1: { x: 220, y: 130, type: 'switch' },
      s2: { x: 220, y: 430, type: 'switch' },
      j:  { x: 560, y: 280, type: 'switch' },
      R:  { x: 900, y: 130, type: 'station', color: 'red',   label: '1. Vágány (Piros)' },
      G:  { x: 900, y: 280, type: 'station', color: 'green', label: '2. Vágány (Zöld)' },
      B:  { x: 900, y: 430, type: 'station', color: 'blue',  label: '3. Vágány (Kék)' },
    },
    edges: [
      { id: 'ea', from: 'a',  to: 's1' },
      { id: 'eb', from: 'b',  to: 's2' },
      { id: 'e1', from: 's1', to: 'R' },
      { id: 'e2', from: 's1', to: 'j' },
      { id: 'e3', from: 's2', to: 'B' },
      { id: 'e4', from: 's2', to: 'j' },
      { id: 'e5', from: 'j',  to: 'G' },
    ],
    switches: {
      s1: [{ from: 'ea', to: 'e1' }, { from: 'ea', to: 'e2' }],
      s2: [{ from: 'eb', to: 'e3' }, { from: 'eb', to: 'e4' }],
      j:  [{ from: 'e2', to: 'e5' }, { from: 'e4', to: 'e5' }],
    },
    signals: [
      { id: 'J1', edge: 'ea', at: 120 },
      { id: 'J2', edge: 'eb', at: 120 },
      { id: 'J3', edge: 'e2', at: 150 },
      { id: 'J4', edge: 'e4', at: 150 },
    ],
    trains: [
      { id: 'T1', color: 'red',   speed: 90,  spawn: 2,  edge: 'ea' },
      { id: 'T2', color: 'blue',  speed: 70,  spawn: 7,  edge: 'eb' },
      { id: 'T3', color: 'green', speed: 110, spawn: 13, edge: 'ea' },
      { id: 'T4', color: 'green', speed: 80,  spawn: 15, edge: 'eb' },
      { id: 'T5', color: 'green', speed: 60,  spawn: 20, edge: 'ea' },
    ],
  },
  {
    id: 3,
    name: '3. szint: Fejpályaudvari csúcsforgalom',
    difficulty: 'Nehéz',
    hint: 'Két belépő (A és B), négy peron. Az A felső belépőből induló alsó ág és a B belépőből induló felső ág keresztezi egymást: ott ne legyen egyszerre két vonat. ' +
      'A két jobb oldali váltó (2 bemenet, 2 kimenet) csak arról a bejövő ágról enged át, amelyre állítottad.',
    nodes: {
      a:   { x: 40,  y: 150, type: 'entry', label: 'A belépő' },
      b:   { x: 40,  y: 430, type: 'entry', label: 'B belépő' },
      sa:  { x: 300, y: 150, type: 'switch' },
      sb:  { x: 300, y: 430, type: 'switch' },
      jc:  { x: 520, y: 200, type: 'switch' },
      jd:  { x: 520, y: 380, type: 'switch' },
      st1: { x: 900, y: 70,  type: 'station', color: 'red',    label: '1. Vágány (Piros)' },
      st2: { x: 900, y: 200, type: 'station', color: 'orange', label: '2. Vágány (Narancs)' },
      st3: { x: 900, y: 350, type: 'station', color: 'green',  label: '3. Vágány (Zöld)' },
      st4: { x: 900, y: 490, type: 'station', color: 'blue',   label: '4. Vágány (Kék)' },
    },
    edges: [
      { id: 'ea', from: 'a',  to: 'sa' },
      { id: 'eb', from: 'b',  to: 'sb' },
      { id: 'ac', from: 'sa', to: 'jc' },
      { id: 'ad', from: 'sa', to: 'jd' },
      { id: 'bc', from: 'sb', to: 'jc' },
      { id: 'bd', from: 'sb', to: 'jd' },
      { id: 'c1', from: 'jc', to: 'st1' },
      { id: 'c2', from: 'jc', to: 'st2' },
      { id: 'd1', from: 'jd', to: 'st3' },
      { id: 'd2', from: 'jd', to: 'st4' },
    ],
    switches: {
      sa: [{ from: 'ea', to: 'ac' }, { from: 'ea', to: 'ad' }],
      sb: [{ from: 'eb', to: 'bd' }, { from: 'eb', to: 'bc' }],
      jc: [{ from: 'ac', to: 'c1' }, { from: 'ac', to: 'c2' }, { from: 'bc', to: 'c1' }, { from: 'bc', to: 'c2' }],
      jd: [{ from: 'ad', to: 'd1' }, { from: 'ad', to: 'd2' }, { from: 'bd', to: 'd1' }, { from: 'bd', to: 'd2' }],
    },
    signals: [
      { id: 'J1', edge: 'ea', at: 160 },
      { id: 'J2', edge: 'eb', at: 160 },
      { id: 'J3', edge: 'ac', at: 100 },
      { id: 'J4', edge: 'ad', at: 110 },
      { id: 'J5', edge: 'bc', at: 110 },
      { id: 'J6', edge: 'bd', at: 100 },
    ],
    trains: [
      { id: 'T1', color: 'red',    speed: 100, spawn: 1,  edge: 'ea' },
      { id: 'T2', color: 'blue',   speed: 90,  spawn: 4,  edge: 'eb' },
      { id: 'T3', color: 'green',  speed: 120, spawn: 8,  edge: 'ea' },
      { id: 'T4', color: 'orange', speed: 80,  spawn: 11, edge: 'eb' },
      { id: 'T5', color: 'blue',   speed: 100, spawn: 14, edge: 'ea' },
      { id: 'T6', color: 'red',    speed: 110, spawn: 17, edge: 'eb' },
    ],
  },
    {
    id: 4,
    name: '4. szint: Nagy rendezőpályaudvar',
    difficulty: 'Extrém nehéz',
    hint: 'Három belépő, négy peron. Az A vonatai a Piros vagy a Narancs, a C vonatai a Zöld vagy a Kék peronra tartanak, ' +
      'a B vonatai bárhová mehetnek. Az A vágányon kitérő hurok van: egy lassú vonatot ide terelve az utána érkező gyorsabb elhagyhatja. ' +
      'A két középső csomópont (2 bemenet, 2 kimenet) csak arról az ágról enged át, amelyre állítottad.',
    nodes: {
      a:  { x: 40,  y: 90,  type: 'entry', label: 'A belépő' },
      b:  { x: 40,  y: 280, type: 'entry', label: 'B belépő' },
      c:  { x: 40,  y: 470, type: 'entry', label: 'C belépő' },
      sa: { x: 160, y: 90,  type: 'switch' },
      pa: { x: 290, y: 35,  type: 'plain' },
      ra: { x: 420, y: 90,  type: 'switch' },
      sb: { x: 220, y: 280, type: 'switch' },
      m1: { x: 620, y: 170, type: 'switch' },
      m2: { x: 620, y: 390, type: 'switch' },
      st1: { x: 900, y: 70,  type: 'station', color: 'red',    label: '1. Vágány (Piros)' },
      st2: { x: 900, y: 220, type: 'station', color: 'orange', label: '2. Vágány (Narancs)' },
      st3: { x: 900, y: 360, type: 'station', color: 'green',  label: '3. Vágány (Zöld)' },
      st4: { x: 900, y: 490, type: 'station', color: 'blue',   label: '4. Vágány (Kék)' },
    },
    edges: [
      { id: 'ea',  from: 'a',  to: 'sa' },
      { id: 'am',  from: 'sa', to: 'ra' },
      { id: 'ap1', from: 'sa', to: 'pa' },
      { id: 'ap2', from: 'pa', to: 'ra' },
      { id: 'ar',  from: 'ra', to: 'm1' },
      { id: 'eb',  from: 'b',  to: 'sb' },
      { id: 'b1',  from: 'sb', to: 'm1' },
      { id: 'b2',  from: 'sb', to: 'm2' },
      { id: 'ec',  from: 'c',  to: 'm2' },
      { id: 'k1',  from: 'm1', to: 'st1' },
      { id: 'k2',  from: 'm1', to: 'st2' },
      { id: 'k3',  from: 'm2', to: 'st3' },
      { id: 'k4',  from: 'm2', to: 'st4' },
    ],
    switches: {
      sa: [{ from: 'ea', to: 'am' }, { from: 'ea', to: 'ap1' }],
      ra: [{ from: 'am', to: 'ar' }, { from: 'ap2', to: 'ar' }],
      sb: [{ from: 'eb', to: 'b1' }, { from: 'eb', to: 'b2' }],
      m1: [{ from: 'ar', to: 'k1' }, { from: 'ar', to: 'k2' }, { from: 'b1', to: 'k1' }, { from: 'b1', to: 'k2' }],
      m2: [{ from: 'b2', to: 'k3' }, { from: 'b2', to: 'k4' }, { from: 'ec', to: 'k3' }, { from: 'ec', to: 'k4' }],
    },
    signals: [
      { id: 'J1', edge: 'ea',  at: 80 },
      { id: 'J2', edge: 'am',  at: 120 },
      { id: 'J3', edge: 'ap2', at: 70 },
      { id: 'J4', edge: 'ar',  at: 100 },
      { id: 'J5', edge: 'eb',  at: 120 },
      { id: 'J6', edge: 'b1',  at: 150 },
      { id: 'J7', edge: 'b2',  at: 150 },
      { id: 'J8', edge: 'ec',  at: 200 },
    ],
    trains: [
      { id: 'T1', color: 'red',    speed: 90,  spawn: 1,  edge: 'ea' },
      { id: 'T2', color: 'blue',   speed: 100, spawn: 3,  edge: 'ec' },
      { id: 'T3', color: 'orange', speed: 80,  spawn: 6,  edge: 'eb' },
      { id: 'T4', color: 'orange', speed: 120, spawn: 9,  edge: 'ea' },
      { id: 'T5', color: 'green',  speed: 70,  spawn: 12, edge: 'eb' },
      { id: 'T6', color: 'green',  speed: 110, spawn: 15, edge: 'ec' },
      { id: 'T7', color: 'red',    speed: 90,  spawn: 18, edge: 'eb' },
      { id: 'T8', color: 'red',    speed: 60,  spawn: 21, edge: 'ea' },
    ],
  },
];

const geomCache = new Map(); // pályák egyszeri betöltése

// Kiszámítja és gyorsítótárazza a pálya geometriai adatait (szakaszok hossza, egységvektorok, kimenő élek)
export function getGeom(level) {
  if (!geomCache.has(level.id)) {
    const edges = {};
    const outs = {};
    for (const e of level.edges) {
      const a = level.nodes[e.from];
      const b = level.nodes[e.to];
      // Irányvektor (dx, dy), a szakasz hossza (len) és normalizált egységvektora (ux, uy)
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      edges[e.id] = { ...e, ax: a.x, ay: a.y, bx: b.x, by: b.y, len, ux: dx / len, uy: dy / len };
      outs[e.from] = outs[e.from] || [];
      outs[e.from].push(e.id);
    }
    geomCache.set(level.id, { edges, outs });
  }
  return geomCache.get(level.id);
}

// Megadja egy vágányszakaszon lévő adott távolság x, y koordinátáját és forgási szögét
export function pointOnEdge(geo, edgeId, pos) {
  const e = geo.edges[edgeId];
  return { x: e.ax + e.ux * pos, y: e.ay + e.uy * pos, angle: Math.atan2(e.uy, e.ux) };
}

// Kiszámítja a fényjelző helyét: a vágány adott pontjára merőlegesen eltolva helyezi el
export function signalPos(level, sig) {
  const e = getGeom(level).edges[sig.edge];
  const px = e.ax + e.ux * sig.at;
  const py = e.ay + e.uy * sig.at;
  // Merőleges vektor (normálvektor) hozzáadása, hogy a jelző a sín mellett álljon
  return { px, py, x: px + e.uy * CFG.SIGNAL_OFFSET, y: py - e.ux * CFG.SIGNAL_OFFSET };
}

export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export const errorCount = (g) => g.stats.wrong + g.stats.derailed;

// Frissíti a vonat x, y koordinátáit és szögét az aktuális vágány és pozíció alapján
function placeTrain(g, t) {
  const p = pointOnEdge(getGeom(g.level), t.edge, t.pos);
  t.x = p.x;
  t.y = p.y;
  t.angle = p.angle;
}

export function createGame(levelId, player) {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) throw new Error(`Ismeretlen pálya: ${levelId}`);
  const switches = {};
  for (const id of Object.keys(level.switches)) switches[id] = 0;
  const signals = {};
  for (const s of level.signals) signals[s.id] = false; // false = vörös
  const trains = level.trains.map((t) => ({
    id: t.id, color: t.color, speed: t.speed, spawn: t.spawn, edge: t.edge,
    pos: 0, x: 0, y: 0, angle: 0, state: 'pending', braked: false, atRed: false, ok: false,
  }));
  const g = {
    levelId, level, player, time: 0, status: 'playing',
    switches, signals, trains,
    stats: { delivered: 0, wrong: 0, derailed: 0 },
    idle: 0, deadlock: false, warnings: [],
  };
  for (const t of trains) placeTrain(g, t);
  return g;
}

export function toggleSwitch(g, id) {
  if (!(id in g.switches)) return false;
  g.switches[id] = (g.switches[id] + 1) % g.level.switches[id].length;
  return true;
}

export function toggleSignal(g, id) {
  if (!(id in g.signals)) return false;
  g.signals[id] = !g.signals[id];
  return true;
}

export function toggleBrake(g, id) {
  const t = g.trains.find((x) => x.id === id && x.state === 'moving');
  if (!t) return false;
  t.braked = !t.braked;
  return true;
}

export function hitSignal(g, x, y) {
  for (const s of g.level.signals) {
    const p = signalPos(g.level, s);
    if (Math.hypot(p.x - x, p.y - y) <= CFG.SIGNAL_HIT) return s.id;
  }
  return null;
}

export function hitSwitch(g, x, y) {
  for (const id of Object.keys(g.level.switches)) {
    const n = g.level.nodes[id];
    if (Math.hypot(n.x - x, n.y - y) <= CFG.SWITCH_HIT) return id;
  }
  return null;
}

export function hitTrain(g, x, y) {
  let best = null;
  let bestD = CFG.TRAIN_HIT;
  for (const t of g.trains) {
    if (t.state !== 'moving') continue;
    const d = Math.hypot(t.x - x, t.y - y);
    if (d <= bestD) { best = t.id; bestD = d; }
  }
  return best;
}

// Szimuláció

// Meghatározza, hogy a vonat melyik vágányra léphet tovább a jelenlegi szakasz végéről
function nextEdgeId(g, geo, t) {
  const edge = geo.edges[t.edge];
  const node = g.level.nodes[edge.to];
  // Váltó esetén: megnézi, hogy a beállított irány az aktuális bejövő ághoz tartozik-e
  if (node.type === 'switch') {
    const st = g.level.switches[edge.to][g.switches[edge.to]];
    return st.from === edge.id ? st.to : null;
  }
  // Sima összekötő pont: továbbhaladás az egyetlen kimenő ágon
  if (node.type === 'plain') return (geo.outs[edge.to] || [])[0] || null;
  return null;
}

// Kezeli a vonat megérkezését a szakasz végére (állomásra érkezés, váltóra lépés vagy kisiklás)
function arrive(g, geo, t) {
  const edge = geo.edges[t.edge];
  const node = g.level.nodes[edge.to];
  if (node.type === 'station') {
    t.state = 'done';
    t.ok = node.color === t.color;
    if (t.ok) g.stats.delivered += 1; else g.stats.wrong += 1;
    return;
  }
  const next = nextEdgeId(g, geo, t);
  if (next) {
    t.edge = next;
    t.pos = 0;
  } else {
    t.state = 'derailed'; // nincs bekötve: kisiklás
    g.stats.derailed += 1;
  }
}

// A szimuláció fő léptető függvénye (időlépés: dt)
export function update(g, dt) {
  if (g.status !== 'playing') return;
  const geo = getGeom(g.level);
  g.time += dt;

  // Menetrend szerinti indítás: csak akkor lép pályára a vonat, ha eljött az ideje és van elég követési távolság
  for (const t of g.trains) {
    if (t.state !== 'pending' || g.time < t.spawn) continue;
    const blocked = g.trains.some((o) => o.state === 'moving' && o.edge === t.edge && o.pos < CFG.GAP);
    if (!blocked) { t.state = 'moving'; t.pos = 0; placeTrain(g, t); }
  }

  // Mozgás (az elöl haladók előbb lépnek, hogy ne akadályozzák feleslegesen a mögöttük jövőket)
  const moving = g.trains.filter((t) => t.state === 'moving').sort((a, b) => b.pos - a.pos);
  let moved = false;
  for (const t of moving) {
    t.atRed = false;
    if (t.braked) continue;
    const edge = geo.edges[t.edge];

    // Megállási határ ellenőrzése vörös jelző előtt
    let redStop = Infinity;
    for (const s of g.level.signals) {
      if (s.edge !== t.edge || g.signals[s.id]) continue;
      const stopAt = s.at - CFG.STOP_BEFORE;
      if (t.pos <= stopAt + 0.5) redStop = Math.min(redStop, stopAt);
    }

    // Követési távolság betartása az előttünk lévő vonathoz (ugyanazon vagy a következő szakaszon)
    let leaderLimit = Infinity;
    const nextId = nextEdgeId(g, geo, t);
    for (const o of g.trains) {
      if (o === t || o.state !== 'moving') continue;
      if (o.edge === t.edge && o.pos > t.pos) leaderLimit = Math.min(leaderLimit, o.pos - CFG.GAP);
      else if (nextId && o.edge === nextId) leaderLimit = Math.min(leaderLimit, edge.len + o.pos - CFG.GAP);
    }

    // A megállási távolság a vörös jelző és az előttünk álló vonat korlátai közül a szigorúbb
    const limit = Math.min(redStop, leaderLimit);
    const newPos = Math.max(t.pos, Math.min(t.pos + t.speed * dt, limit));
    if (newPos > t.pos + 1e-6) moved = true;
    t.pos = newPos;
    t.atRed = redStop < Infinity && redStop <= leaderLimit && t.pos >= redStop - 1;

    // Ha a vonat elérte a szakasz végét, továbblép a következő vágányra vagy befejezi útját
    if (t.pos >= edge.len - 1e-6) { t.pos = edge.len; placeTrain(g, t); arrive(g, geo, t); }
    if (t.state === 'moving') placeTrain(g, t);
  }

  // Holtpont-gyanú (ha vannak mozgásban lévő vonatok, de senki sem tud haladni és nincsenek fékezve)
  const active = g.trains.filter((t) => t.state === 'moving');
  const stuck = active.length > 0 && !moved && !active.some((t) => t.braked);
  g.idle = stuck ? g.idle + dt : 0;
  g.deadlock = g.idle > CFG.IDLE_LIMIT;

  // Ütközésvizsgálat: páronként ellenőrzi a távolságot a vonatok között (figyelmeztető kör vagy karambol)
  g.warnings = [];
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i];
      const b = active[j];
      if (a.state !== 'moving' || b.state !== 'moving') continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      if (d < CFG.CRIT) {
        a.state = 'crashed';
        b.state = 'crashed';
        g.status = 'lost';
      } else if (d < CFG.WARN) {
        g.warnings.push({ x: mx, y: my, r: d / 2 + 24 });
      }
    }
  }

  if (g.status === 'playing' && g.trains.every((t) => t.state === 'done' || t.state === 'derailed')) {
    g.status = 'finished';
  }
}

// Mentés / Betöltés
const TRAIN_STATES = ['pending', 'moving', 'done', 'derailed', 'crashed'];

export function serialize(g) {
  return {
    player: g.player,
    levelId: g.levelId,
    time: g.time,
    switches: { ...g.switches },
    signals: { ...g.signals },
    stats: { ...g.stats },
    trains: g.trains.map((t) => ({
      id: t.id, color: t.color, speed: t.speed, spawn: t.spawn, edge: t.edge,
      pos: t.pos, x: t.x, y: t.y, angle: t.angle, state: t.state, braked: t.braked, ok: t.ok,
    })),
  };
}

// Mentett állapot betöltése és biztonsági ellenőrzése (hibás adatoknál kivételt dob)
export function deserialize(data) {
  if (!data || typeof data !== 'object') throw new Error('Érvénytelen mentés.');
  const g = createGame(Number(data.levelId), String(data.player || 'Névtelen'));
  if (!Number.isFinite(data.time) || data.time < 0) throw new Error('Hibás időadat a mentésben.');
  g.time = data.time;
  const geo = getGeom(g.level);

  for (const id of Object.keys(g.switches)) {
    const v = data.switches ? data.switches[id] : 0;
    if (Number.isInteger(v) && v >= 0 && v < g.level.switches[id].length) g.switches[id] = v;
  }
  for (const id of Object.keys(g.signals)) g.signals[id] = Boolean(data.signals && data.signals[id]);

  for (const key of ['delivered', 'wrong', 'derailed']) {
    const v = data.stats ? data.stats[key] : 0;
    g.stats[key] = Number.isInteger(v) && v >= 0 ? v : 0;
  }

  if (!Array.isArray(data.trains)) throw new Error('Hiányzó vonatadatok.');
  for (const saved of data.trains) {
    const t = g.trains.find((x) => x.id === saved.id);
    if (!t) throw new Error(`Ismeretlen szerelvény: ${saved.id}`);
    if (!geo.edges[saved.edge]) throw new Error('Ismeretlen vágányszakasz.');
    if (!TRAIN_STATES.includes(saved.state)) throw new Error('Ismeretlen vonatállapot.');
    if (!Number.isFinite(saved.pos) || saved.pos < 0 || saved.pos > geo.edges[saved.edge].len + 1e-6) throw new Error('Hibás vonatpozíció.');
    if (!Number.isFinite(saved.speed) || saved.speed <= 0) throw new Error('Hibás sebesség.');
    t.edge = saved.edge;
    t.pos = saved.pos;
    t.speed = saved.speed;
    t.state = saved.state === 'crashed' ? 'moving' : saved.state;
    t.braked = Boolean(saved.braked);
    t.ok = Boolean(saved.ok);
    placeTrain(g, t);
  }
  return g;
}
