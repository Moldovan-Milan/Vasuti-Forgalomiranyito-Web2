import {
  LEVELS, WORLD, createGame, update, toggleSwitch, toggleSignal, toggleBrake,
  hitSwitch, hitSignal, hitTrain, serialize, deserialize, errorCount, formatTime,
} from './state.js';
import { render, updateHud } from './render.js';

const SAVE_KEY = 'railsim.save.v1';
const scoreKey = (levelId) => `railsim.scores.${levelId}`;

const $ = (sel, root = document) => root.querySelector(sel);

const htmlElements = {
  menu: $('#screen-menu'),
  game: $('#screen-game'),
  canvas: $('.board'),
  name: $('.name-input'),
  nameError: $('.field-error'),
  menuMsg: $('.menu-msg'),
  toast: $('.toast'),
  modal: $('.modal'),
  modalTitle: $('[data-modal="title"]'),
  modalText: $('[data-modal="text"]'),
  lbSelect: $('[data-lb-select]'),
  lbTable: $('.lb-table'),
  pauseBtn: $('[data-action="pause"]'),
};

const hud = {};
document.querySelectorAll('[data-hud]').forEach((el) => { hud[el.dataset.hud] = el; });

const ctx = htmlElements.canvas.getContext('2d');
const app = { game: null, paused: false, last: 0, resultShown: false, toastUntil: 0 };

// tárolás (local storage)

// Biztonságos kiolvasás a localStorage-ból JSON formátumban (hiba vagy hiány esetén fallback értékkel tér vissza)
function storeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn('Tárhely olvasási hiba:', err);
    return fallback;
  }
}

// Érték mentése JSON szövegként a localStorage-ba
function storeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('Tárhely írási hiba:', err);
    return false;
  }
}

// ranglista

// Elmenti az eredményt: a hibátlan futamok előre kerülnek, azon belül a gyorsabb idő dönt (top 10 marad)
function addScore(g) {
  const list = storeGet(scoreKey(g.levelId), []);
  list.push({
    name: g.player,
    time: Math.round(g.time),
    errors: errorCount(g),
    date: new Date().toLocaleDateString('hu-HU'),
  });
  list.sort((a, b) => (Number(a.errors > 0) - Number(b.errors > 0)) || (a.time - b.time) || (a.errors - b.errors));
  storeSet(scoreKey(g.levelId), list.slice(0, 10));
}

// Megjeleníti a kiválasztott pálya ranglistáját a DOM-ban
function renderLeaderboard() {
  const levelId = Number(htmlElements.lbSelect.value);
  const list = storeGet(scoreKey(levelId), []);
  htmlElements.lbTable.textContent = '';
  if (!Array.isArray(list) || list.length === 0) {
    const p = document.createElement('p');
    p.className = 'lb-empty';
    p.textContent = 'Még nincs rögzített eredmény ezen a pályán.';
    htmlElements.lbTable.append(p);
    return;
  }
  const table = document.createElement('table');
  const head = table.createTHead().insertRow();
  for (const h of ['#', 'Játékos', 'Idő', 'Hibapont', 'Dátum']) {
    const th = document.createElement('th');
    th.textContent = h;
    head.append(th);
  }
  const body = table.createTBody();
  list.forEach((row, i) => {
    const tr = body.insertRow();
    const cells = [i + 1, row.name, formatTime(row.time), row.errors, row.date];
    cells.forEach((value, idx) => {
      const td = tr.insertCell();
      td.textContent = String(value);
      if (idx === 3 && row.errors === 0) td.className = 'flawless';
    });
  });
  htmlElements.lbTable.append(table);
}


function showScreen(name) {
  htmlElements.menu.classList.toggle('hidden', name !== 'menu');
  htmlElements.game.classList.toggle('hidden', name !== 'game');
}

// Értesítés kiírása (játék mentve stb...)
function toast(message) {
  htmlElements.toast.textContent = message;
  htmlElements.toast.classList.remove('hidden');
  app.toastUntil = performance.now() + 2500;
}

function openModal(kind, title, text) {
  htmlElements.modalTitle.textContent = title;
  htmlElements.modalTitle.className = kind;
  htmlElements.modalText.textContent = text;
  htmlElements.modal.classList.remove('hidden');
}

function closeModal() {
  htmlElements.modal.classList.add('hidden');
}

function startGame(g) {
  app.game = g;
  app.paused = false;
  app.resultShown = false;
  htmlElements.pauseBtn.textContent = 'Szünet';
  closeModal();
  showScreen('game');
}

function backToMenu() {
  app.game = null;
  closeModal();
  showScreen('menu');
  htmlElements.menuMsg.textContent = '';
  renderLeaderboard();
}

// Játékosnév beolvasása és érvényesítése (ha üres, figyelmeztetést jelenít meg)
function readName() {
  const name = htmlElements.name.value.trim();
  if (!name) {
    htmlElements.nameError.textContent = 'A játékos nevének megadása kötelező!';
    htmlElements.name.setAttribute('aria-invalid', 'true');
    htmlElements.name.focus();
    return null;
  }
  htmlElements.nameError.textContent = '';
  htmlElements.name.removeAttribute('aria-invalid');
  return name;
}

// Játék lezárásának kezelése: eredmény kiértékelése, ranglista mentése és modális ablak megjelenítése
function onGameEnd(g) {
  app.resultShown = true;
  if (g.status === 'lost') {
    openModal('lose', 'Katasztrófa! Vonatütközés', 'Két szerelvény összeütközött, a szimuláció véget ért.');
    return;
  }
  const errors = errorCount(g);
  addScore(g);
  if (errors === 0) {
    openModal('win', 'Sikeres forgalomirányítás!',
      `Minden szerelvény a helyes peronra érkezett. Menetidő: ${formatTime(g.time)}, hibapont: 0.`);
  } else {
    openModal('lose', 'Futam vége hibákkal',
      `Az összes szerelvény feldolgozásra került, de ${errors} hibapontot gyűjtöttél. Menetidő: ${formatTime(g.time)}.`);
  }
}

// Egérkattintás képernyő-koordinátáinak átszámítása a játék belső (WORLD) koordinátarendszerébe
function boardPoint(e) {
  const r = htmlElements.canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (WORLD.w / r.width), y: (e.clientY - r.top) * (WORLD.h / r.height) };
}

// Bal egérgombos kattintás a pályán: jelző állítása vagy váltó átkapcsolása
function handleBoardClick(e) {
  const g = app.game;
  if (!g || g.status !== 'playing' || app.paused) return;
  const { x, y } = boardPoint(e);
  const sig = hitSignal(g, x, y);
  if (sig) { toggleSignal(g, sig); return; }
  const sw = hitSwitch(g, x, y);
  if (sw) toggleSwitch(g, sw);
}

// A felület gombjaihoz (data-action) tartozó parancsok központi végrehajtása
function handleAction(action) {
  const g = app.game;
  switch (action) {
    case 'start': {
      const name = readName();
      if (!name) return;
      const checked = $('input[name="level"]:checked');
      const levelId = checked ? Number(checked.value) : 1;
      startGame(createGame(levelId, name));
      break;
    }
    case 'load': {
      const data = storeGet(SAVE_KEY, null);
      if (!data) { htmlElements.menuMsg.textContent = 'Nincs elmentett játékállás.'; return; }
      try {
        startGame(deserialize(data));
        toast('Játékállás betöltve.');
      } catch (err) {
        console.error(err);
        htmlElements.menuMsg.textContent = `A mentés nem tölthető be: ${err.message}`;
      }
      break;
    }
    case 'pause':
      if (!g || g.status !== 'playing') return;
      app.paused = !app.paused;
      htmlElements.pauseBtn.textContent = app.paused ? 'Folytatás' : 'Szünet';
      break;
    case 'reset':
    case 'retry':
      if (g) startGame(createGame(g.levelId, g.player));
      break;
    case 'save':
      if (!g || g.status !== 'playing') return;
      toast(storeSet(SAVE_KEY, serialize(g)) ? 'Játékállás elmentve.' : 'A mentés nem sikerült.');
      break;
    case 'menu':
      backToMenu();
      break;
    default:
      break;
  }
}

// Globális kattintáskezelő: menü- és vezérlőgombok kattintása, vagy a játéktérre (canvas) kattintás
document.addEventListener('click', (e) => {
  try {
    const btn = e.target.closest('[data-action]');
    if (btn) { handleAction(btn.dataset.action); return; }
    if (e.target === htmlElements.canvas) handleBoardClick(e);
  } catch (err) {
    console.error('Kattintáskezelési hiba:', err);
  }
});

// Jobb egérgombos kattintás: vészfék / fék ki- és bekapcsolása a rákattintott vonaton
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('.board-wrap')) return;
  e.preventDefault(); // böngészős menü tiltása a rajzterületen
  try {
    const g = app.game;
    if (e.target !== htmlElements.canvas || !g || g.status !== 'playing' || app.paused) return;
    const { x, y } = boardPoint(e);
    const id = hitTrain(g, x, y);
    if (id) toggleBrake(g, id);
  } catch (err) {
    console.error('Vészfék hiba:', err);
  }
});

// Pályaválasztó legördülő menü változásakor ranglista újrarajzolása
document.addEventListener('change', (e) => {
  if (e.target.closest('[data-lb-select]')) renderLeaderboard();
});

htmlElements.name.addEventListener('input', () => {
  htmlElements.nameError.textContent = '';
  htmlElements.name.removeAttribute('aria-invalid');
});

// Fő játékhurok: kiszámítja az eltelt időt (dt), lépteti a szimulációt, újrarajzolja a vásznat és a HUD-ot
function frame(ts) {
  try {
    // Delta idő (dt) másodpercben mérve, maximum 0.05 mp-re korlátozva az ugrások és akadozások elkerülésére
    const dt = app.last ? Math.min((ts - app.last) / 1000, 0.05) : 0;
    app.last = ts;
    const g = app.game;
    if (g) {
      if (!app.paused && g.status === 'playing') update(g, dt);
      render(ctx, g, { clock: ts / 1000, paused: app.paused });
      updateHud(hud, g);
      if (g.status !== 'playing' && !app.resultShown) onGameEnd(g);
    }
    // Felugró értesítés (toast) eltüntetése a megadott idő lejárta után
    if (app.toastUntil && ts > app.toastUntil) {
      htmlElements.toast.classList.add('hidden');
      app.toastUntil = 0;
    }
  } catch (err) {
    console.error('Hiba a játékhurokban:', err);
  }
  requestAnimationFrame(frame);
}

// Alkalmazás inicializálása: alapértelmezett pálya ranglistájának betöltése és a hurok indítása
try {
  htmlElements.lbSelect.value = String(LEVELS[0].id);
  renderLeaderboard();
} catch (err) {
  console.error('Inicializálási hiba:', err);
}
requestAnimationFrame(frame);
