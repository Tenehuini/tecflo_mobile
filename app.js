'use strict';

// Tecflo para celulares: app sin servidor. Todos los datos salen de data.js,
// que se edita a mano.

const $ = (sel) => document.querySelector(sel);
const root = $('#root');

const APP_NAME = 'Tecflo';
const TAGLINE = 'Información de Las Flores';
const THEME_KEY = 'tecflo.theme';
const NEWS_KEY = 'tecflo.newsSeen';

// ---------- helpers de DOM ----------
// h('div.clase', { onclick }, hijo, 'texto', ...)
function h(tag, props, ...children) {
  const [name, ...classes] = tag.split('.');
  const el = document.createElement(name);
  if (classes.length) el.className = classes.join(' ');
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style') Object.assign(el.style, v);
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v);
  }
  el.append(...children.flat().filter((c) => c != null && c !== false));
  return el;
}

// ---------- datos ----------
// Las listas se ordenan acá, así no importa el orden en que estén en data.js.
const byName = (a, b) => a.name.localeCompare(b.name, 'es');
const byField = (f) => (a, b) => String(a[f] ?? '').localeCompare(String(b[f] ?? ''));
const parseDate = (s) => new Date(String(s).replace(' ', 'T')); // Safari no acepta "AAAA-MM-DD HH:MM"

// Antes de las 8 de la mañana sigue de turno la farmacia del día anterior.
function activeTurnoName() {
  const d = new Date();
  if (d.getHours() < 8) d.setDate(d.getDate() - 1);
  return DATA.turnos[String(d.getDate())] ?? null;
}
const getFarmacias = () => {
  const turno = activeTurnoName();
  return DATA.farmacias.map((f) => ({ ...f, es_turno_hoy: f.name === turno }));
};
const getFarmacia = (id) => getFarmacias().find((f) => f.id === id) ?? null;

const getEventos = () => [...DATA.eventos].sort(byField('date'));
const getEvento = (id) => DATA.eventos.find((e) => e.id === id) ?? null;

const equipoById = (id) => DATA.equipos.find((e) => e.id === id) ?? null;
const getJugadores = (equipoId) => DATA.jugadores.filter((j) => j.deporte_equipo_id === equipoId).sort(byName);

const getTorneoOverview = (id) => buildOverview(
  DATA.equipos.filter((e) => e.deporte_torneo_id === id),
  DATA.partidos.filter((p) => p.torneo_id === id),
);
const getCategoriaOverview = (id) => buildOverview(
  DATA.equipos.filter((e) => e.categoria_id === id),
  DATA.partidos.filter((p) => p.categoria_id === id),
);

// Tabla de posiciones (3 puntos por partido ganado, 1 por empate) y partidos ordenados por fecha.
function buildOverview(equipos, partidos) {
  equipos = [...equipos].sort(byName); // a igualdad de puntos, por nombre
  partidos = [...partidos].sort(byField('scheduled_at'));
  const stats = new Map(equipos.map((e) => [e.id, { equipo: e, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0 }]));
  for (const p of partidos) {
    if (p.home_score == null || p.away_score == null) continue;
    for (const [id, gf, ga] of [[p.home_equipo_id, p.home_score, p.away_score], [p.away_equipo_id, p.away_score, p.home_score]]) {
      const s = stats.get(id);
      if (!s) continue;
      s.played += 1; s.goals_for += gf; s.goals_against += ga;
      if (gf > ga) s.won += 1; else if (gf === ga) s.drawn += 1; else s.lost += 1;
    }
  }
  const standings = [...stats.values()]
    .map((s) => ({ ...s, goal_diff: s.goals_for - s.goals_against, points: s.won * 3 + s.drawn }))
    .sort((a, b) => b.points - a.points || b.goal_diff - a.goal_diff || b.goals_for - a.goals_for);

  const jugadorName = (id) => DATA.jugadores.find((j) => j.id === id)?.name ?? '';
  const fixtures = partidos.map((p) => {
    const played = p.home_score != null;
    const goles = played ? DATA.goles.filter((g) => g.partido_id === p.id) : [];
    const toGoal = (g) => ({ jugador_id: g.jugador_id, jugador_name: jugadorName(g.jugador_id), minute: g.minute });
    return {
      ...p,
      home_equipo: equipoById(p.home_equipo_id),
      away_equipo: equipoById(p.away_equipo_id),
      home_scorers: goles.filter((g) => g.equipo_id === p.home_equipo_id).map(toGoal),
      away_scorers: goles.filter((g) => g.equipo_id !== p.home_equipo_id).map(toGoal),
    };
  });
  return { standings, fixtures };
}

// ---------- navegación ----------
// Rutas con # porque GitHub Pages no sabe responder rutas propias de la app.
// history.state.d cuenta cuántas pantallas hay detrás, para que "Atrás" no
// saque de la app si se abrió directo en una pantalla interna.
function go(path) {
  history.pushState({ d: (history.state?.d ?? 0) + 1 }, '', '#' + path);
  render();
}
function back() {
  if ((history.state?.d ?? 0) > 0) history.back();
  else { history.replaceState({ d: 0 }, '', '#/'); render(); }
}
function home() {
  const d = history.state?.d ?? 0;
  if (d > 0) history.go(-d); // vuelve al inicio sin acumular historial
  else { history.replaceState({ d: 0 }, '', '#/'); render(); }
}
window.addEventListener('popstate', render);

const q = (title) => (title ? '?t=' + encodeURIComponent(title) : '');

function navigateToLeaf(leaf, title) {
  switch (leaf.data) {
    case 'torneo_overview': go(`/torneo/${leaf.id}${q(title)}`); break;
    case 'categoria_overview': go(`/categoria/${leaf.id}${q(title)}`); break;
    case 'eventos': go('/eventos'); break;
    case 'farmacias': go('/farmacias'); break;
    case 'info_util': go('/info'); break;
  }
}
const isLeaf = (item) => 'data' in item;

// ---------- tema ----------
function currentTheme() { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
function toggleTheme() {
  const t = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch { /* sin storage */ }
  render();
}
const ThemeBtn = () => h('button.theme-btn', { type: 'button', onclick: toggleTheme, title: 'Cambiar tema', 'aria-label': 'Cambiar tema' }, currentTheme() === 'dark' ? '☀️' : '🌙');

// ---------- componentes ----------
function Layout(title, ...children) {
  return h('div.app', null,
    h('header.header', null,
      h('button.back-btn', { type: 'button', onclick: back }, '← Atrás'),
      h('a.home-link', { href: '#/', onclick: (e) => { e.preventDefault(); home(); } }, 'Inicio'),
      ThemeBtn(),
    ),
    title && h('h1.page-title', null, title),
    h('main.content', null, ...children),
  );
}

const Empty = (message = 'Sin datos todavía.') => h('p.empty', null, message);

function MenuCard(name, item, onclick) {
  return h('button.menu-card', { type: 'button', onclick },
    item.icon && h('span.card-icon', null, item.icon),
    h('span.card-title', null, name),
    item.subtitle && h('span.card-subtitle', null, item.subtitle),
  );
}

// Arma las tarjetas de un nivel del menú. `path` son los nombres desde la raíz.
function MenuGrid(items, path) {
  return h('div.card-grid', null, Object.entries(items).map(([name, item]) =>
    MenuCard(name, item, isLeaf(item)
      ? () => navigateToLeaf(item, name)
      : () => go('/menu/' + [...path, name].map(encodeURIComponent).join('/')))));
}

const InfoRow = (label, value) => h('div.info-row', null, h('span.info-label', null, label), h('span.info-value', null, value));

// ---------- pantallas ----------
function HomePage() {
  return h('div.home', null,
    h('div.home-topbar', null, ThemeBtn()),
    h('div.home-hero', null, h('h1.logo', null, APP_NAME), h('p.tagline', null, TAGLINE)),
    MenuGrid(DATA.menu, []),
    h('footer.home-footer', null,
      h('p', null,
        h('button.link-btn', { type: 'button', onclick: openInstall }, '📲 Cómo instalar la app'),
        ' · ',
        h('button.link-btn', { type: 'button', onclick: () => showNews(-1, 'Novedades') }, 'Novedades'),
      ),
      h('p.data-date', null, 'Datos actualizados al ' + formatDate(DATA.actualizado)),
    ),
  );
}

function MenuPage(path) {
  let node = { items: DATA.menu };
  for (const name of path) {
    node = node.items?.[name];
    if (!node || isLeaf(node)) return null; // ruta vieja o inválida
  }
  return Layout(path[path.length - 1], MenuGrid(node.items, path));
}

function formatDateTime(iso) {
  return parseDate(iso).toLocaleString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function FixtureCard(p) {
  const played = p.home_score != null;
  const scorers = [...p.home_scorers.map((g) => [g, p.home_equipo]), ...p.away_scorers.map((g) => [g, p.away_equipo])];
  return h('div.fixture-card', null,
    h('div.fixture-row', null,
      h('span.fixture-team', null, p.home_equipo?.name ?? ''),
      played
        ? h('span.fixture-score', null, `${p.home_score} – ${p.away_score}`)
        : h('span.fixture-score', { style: { color: '#64748b', fontSize: '14px' } }, 'vs'),
      h('span.fixture-team.fixture-team-right', null, p.away_equipo?.name ?? ''),
    ),
    h('div.fixture-meta', { style: { marginTop: '4px' } }, formatDateTime(p.scheduled_at) + (p.place ? ` · ${p.place}` : '')),
    played && scorers.length > 0 && h('div', { style: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' } },
      scorers.map(([g, eq]) => h('div.fixture-meta', null, `⚽ ${g.jugador_name}${g.minute != null ? ` ${g.minute}'` : ''} (${eq?.name ?? ''})`)),
    ),
  );
}

// Tabla + próximos + jugados (LeagueStandingsPage y CategoriaStandingsPage).
function StandingsPage(title, overview) {
  const now = new Date();
  const upcoming = overview.fixtures.filter((f) => f.home_score == null && parseDate(f.scheduled_at) >= now);
  const past = overview.fixtures.filter((f) => f.home_score != null);
  const th = (t, cls) => h('th' + (cls ? '.' + cls : ''), null, t);
  const td = (t, cls) => h('td' + (cls ? '.' + cls : ''), null, String(t));

  return Layout(title,
    h('p.section-header', null, 'Tabla de posiciones'),
    overview.standings.length === 0 ? h('p.empty', null, 'Sin equipos todavía.') : h('div.table-wrap', { style: { marginBottom: '24px' } },
      h('table.data-table', null,
        h('thead', null, h('tr', null, th('#'), th('Equipo', 'team-col'), th('PJ'), th('G'), th('E'), th('P'), th('DG'), th('Pts', 'pts-col'))),
        h('tbody', null, overview.standings.map((row, i) =>
          h('tr', { 'data-href': '1', onclick: () => go(`/equipo/${row.equipo.id}`) },
            td(i + 1), td(row.equipo.name, 'team-col'), td(row.played), td(row.won), td(row.drawn), td(row.lost),
            td(row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff), td(row.points, 'pts-col')))),
      ),
    ),
    upcoming.length > 0 && [
      h('p.section-header', null, 'Próximos partidos'),
      h('div.list', { style: { marginBottom: '24px' } }, upcoming.map(FixtureCard)),
    ],
    past.length > 0 && [
      h('p.section-header', null, 'Partidos jugados'),
      h('div.list', null, [...past].reverse().map(FixtureCard)),
    ],
  );
}

function TeamDetailPage(id) {
  const equipo = equipoById(id);
  const jugadores = getJugadores(id);
  return Layout(equipo?.name ?? 'Equipo',
    jugadores.length === 0 ? Empty() : h('div.list', null, jugadores.map((j) =>
      h('div.list-row.no-hover', null,
        h('div', { style: { marginRight: '14px', flexShrink: '0' } },
          j.photo
            ? h('img', { src: j.photo, alt: j.name, style: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', display: 'block' } })
            : h('div', { style: { width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              h('span', { style: { color: 'var(--accent)', fontSize: '20px', fontWeight: '700' } }, j.name.charAt(0).toUpperCase())),
        ),
        h('div.list-main', null,
          h('span.list-name', null, j.name),
          j.date_of_birth && h('span.list-meta', null, j.date_of_birth),
        ),
      ))),
  );
}

function EventsPage() {
  const eventos = getEventos();
  return Layout('Eventos',
    eventos.length === 0 ? Empty() : h('div.list', null, eventos.map((e) =>
      h('button.list-row', { type: 'button', onclick: () => go(`/eventos/${e.id}`) },
        h('div.list-main', null,
          h('span.list-name', null, e.name),
          e.date && h('span.list-meta', null, parseDate(e.date).toLocaleDateString('es-AR')),
          e.lugar && h('span.list-meta', null, e.lugar),
        ),
        h('span.chevron', null, '›'),
      ))),
  );
}

function EventDetailPage(id) {
  const e = getEvento(id);
  if (!e) return Layout('Evento', h('p.empty', null, 'Evento no encontrado.'));
  return Layout(e.name,
    h('div.detail-box', null,
      e.date && InfoRow('Fecha', parseDate(e.date).toLocaleString('es-AR')),
      e.lugar && InfoRow('Lugar', e.lugar),
    ),
    e.description && h('div.desc-box', null, h('h3', null, 'Descripción'), h('p', null, e.description)),
  );
}

function FarmaciasPage() {
  const farmacias = getFarmacias();
  return Layout('Farmacias',
    farmacias.length === 0 ? h('p.empty', null, 'Todavía no hay farmacias.') : h('div.list', null, farmacias.map((f) =>
      h('button.list-row' + (f.es_turno_hoy ? '.outstanding-row' : ''), { type: 'button', onclick: () => go(`/farmacias/${f.id}`) },
        h('div.list-main', null,
          h('div.farmacia-name-row', null,
            h('span.list-name', null, f.name),
            f.es_turno_hoy && h('span.badge.badge-blue', null, '🚪 Abierta'),
          ),
          f.address && h('span.list-meta', null, f.address),
        ),
        h('span.chevron', null, '›'),
      ))),
  );
}

function FarmaciaDetailPage(id) {
  const f = getFarmacia(id);
  if (!f) return Layout('Farmacia', h('p.empty', null, 'Farmacia no encontrada.'));
  const hasMap = !!f.latitude && !!f.longitude;
  return Layout(f.name,
    f.es_turno_hoy && h('div.outstanding-banner', null, '🚪 Farmacia Abierta'),
    h('div.detail-box', null,
      f.address && InfoRow('📍 Dirección', f.address),
      f.phone && InfoRow('📞 Teléfono', f.phone),
    ),
    hasMap && h('div.map-embed', null,
      h('iframe', {
        src: `https://maps.google.com/maps?q=${f.latitude},${f.longitude}&z=18&output=embed`,
        title: `Mapa de ${f.name}`, width: '100%', height: '320', loading: 'lazy',
        style: { border: 'none', borderRadius: '12px', display: 'block' },
      }),
    ),
  );
}

function InfoPage() {
  const { telefonos, servicios } = DATA.infoUtil;
  return Layout('Información útil',
    h('p.section-header', null, 'Teléfonos útiles'),
    h('div.list', { style: { marginBottom: '24px' } }, Object.entries(telefonos).map(([name, phone]) =>
      h('div.list-row.no-hover', null,
        h('div.list-main', null, h('span.list-name', null, name)),
        h('span', { style: { color: 'var(--accent)', fontWeight: '700', fontSize: '15px' } }, phone),
      ))),
    h('p.section-header', null, 'Servicios'),
    Object.entries(servicios).map(([name, d]) =>
      h('div', { style: { marginBottom: '16px' } },
        h('p', { style: { fontWeight: '700', fontSize: '15px', marginBottom: '6px' } }, name),
        h('div.detail-box', null,
          d.phone && InfoRow('Teléfono', d.phone),
          d.address && InfoRow('Dirección', d.address),
          d.website && InfoRow('Web', d.website),
          d.open_hours && InfoRow('Horario', d.open_hours),
        ),
      )),
  );
}

// ---------- router ----------
function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart, query = ''] = raw.split('?');
  const title = new URLSearchParams(query).get('t');
  const parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  const id = Number(parts[1]);

  switch (parts[0]) {
    case undefined: return HomePage();
    case 'menu': return MenuPage(parts.slice(1));
    case 'torneo': return StandingsPage(title ?? 'Torneo', getTorneoOverview(id));
    case 'categoria': return StandingsPage(title ?? 'Categoría', getCategoriaOverview(id));
    case 'equipo': return TeamDetailPage(id);
    case 'eventos': return parts[1] ? EventDetailPage(id) : EventsPage();
    case 'farmacias': return parts[1] ? FarmaciaDetailPage(id) : FarmaciasPage();
    case 'info': return InfoPage();
    default: return null;
  }
}

let lastHash = null;
function render() {
  let page = route();
  if (!page) { history.replaceState({ d: 0 }, '', '#/'); page = HomePage(); } // ruta desconocida
  const sameScreen = location.hash === lastHash;
  lastHash = location.hash;
  root.replaceChildren(page);
  if (!sameScreen) window.scrollTo(0, 0);
}

// ---------- novedades ----------
const latestVersion = () => Math.max(0, ...CHANGELOG.map((e) => e.version));

function readNewsSeen() {
  try {
    const v = localStorage.getItem(NEWS_KEY);
    return v === null ? null : Number(v);
  } catch { return null; }
}
function markNewsSeen() {
  try { localStorage.setItem(NEWS_KEY, String(latestVersion())); } catch { /* sin storage */ }
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function openDialog(dlg) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
function closeDialog(dlg) { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }

// Muestra la última entrada con versión mayor a `since` (-1: la última siempre).
function showNews(since, title) {
  const entries = CHANGELOG.filter((e) => e.version > since).sort((a, b) => b.version - a.version).slice(0, 1);
  if (!entries.length) return;
  $('#news-title').textContent = title;
  $('#news-body').replaceChildren(...entries.map((e) =>
    h('section', null, h('h3', null, formatDate(e.date)), h('ul', null, e.items.map((t) => h('li', null, t))))));
  openDialog($('#news-dialog'));
}

$('#news-ok').addEventListener('click', () => { markNewsSeen(); closeDialog($('#news-dialog')); });
$('#news-dialog').addEventListener('cancel', markNewsSeen); // cerrar con "atrás" también cuenta

// Al abrir: quien nunca usó la app no ve el aviso (todo es nuevo para esa
// persona); quien ya la usaba ve lo que cambió desde la última vez.
function checkNews() {
  const seen = readNewsSeen();
  if (seen === null) markNewsSeen();
  else if (seen < latestVersion()) showNews(seen, '¡Hay novedades!');
}

// ---------- Cómo instalar ----------
function setInstallTab(os) {
  document.querySelectorAll('.install-tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.os === os)));
  document.querySelectorAll('.install-panel').forEach((p) => { p.hidden = p.dataset.os !== os; });
}
function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
}
function openInstall() {
  // Arranca en la pestaña del celular que se está usando; la otra sigue disponible.
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  setInstallTab(ios ? 'ios' : 'android');
  $('#install-done').hidden = !isStandalone();
  openDialog($('#install-dialog'));
}
document.querySelectorAll('.install-tab').forEach((t) => t.addEventListener('click', () => setInstallTab(t.dataset.os)));
// Copiar la dirección de la app (para pegarla en Chrome o Safari).
document.querySelectorAll('.copy-url').forEach((b) => b.addEventListener('click', () => {
  const done = () => { b.textContent = '¡Copiado!'; setTimeout(() => { b.textContent = 'Copiar'; }, 2000); };
  const selectText = () => { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(b.dataset.url).then(done, selectText);
  else selectText();
}));
$('#install-ok').addEventListener('click', () => closeDialog($('#install-dialog')));

// ---------- init ----------
if (!history.state) history.replaceState({ d: 0 }, '', location.hash || '#/');
render();
checkNews();

// La farmacia de turno cambia a las 8: al volver a la app, redibujar.
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
