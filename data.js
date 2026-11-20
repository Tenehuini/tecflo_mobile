'use strict';

// Todos los datos que muestra la app. Se editan a mano en este archivo.
// Después de cambiar algo, seguir los pasos de "Para quien mantiene la app"
// en el README (fecha de `actualizado`, changelog.js y CACHE de sw.js).

// Nombres de las farmacias: usarlos en `farmacias` y en `turnos` para no
// escribirlos distinto (si un nombre no coincide, ese día no aparece ninguna
// farmacia abierta).
const F = {
  ARGENTINA: 'Farmacia Argentina',
  SORALUCE: 'Farmacia Soraluce',
  PACULNIS: 'Farmacia Paculnis',
  PASTEUR: 'Farmacia Pasteur',
  SAN_MARTIN: 'Farmacia San Martín',
  NIETO: 'Farmacia Nieto',
  MAFREN: 'Farmacia Mafren',
  GIRALDI: 'Farmacia Giraldi',
  DI_BERNARDI: 'Farmacia Di Bernardi',
  MANZOTTI: 'Farmacia Manzotti',
};

const DATA = {
  // Fecha de la última actualización de los datos (se muestra en el inicio).
  actualizado: '2026-11-20',

  // Tarjetas del inicio y sus submenús. Cada hoja tiene `data`:
  // 'categoria_overview' / 'torneo_overview' (con `id`), 'eventos', 'farmacias' o 'info_util'.
  // `hidden: true` oculta la tarjeta (borrar esa línea para volver a mostrarla).
  menu: {
    'Deportes': {
      hidden: true,
      icon: '🏆',
      subtitle: 'Fútbol y más',
      items: {
        'Fútbol': {
          icon: '⚽',
          items: {
            'Torneo AFA local': {
              icon: '🏆',
              items: {
                'Masculino': {
                  icon: '👦',
                  items: {
                    'Sub-9': { data: 'categoria_overview', id: 1 },
                    'Sub-11': { data: 'categoria_overview', id: 2 },
                    'Sub-13': { data: 'categoria_overview', id: 3 },
                    'Sub-15': { data: 'categoria_overview', id: 4 },
                    'Sub-17': { data: 'categoria_overview', id: 5 },
                    'Reserva': { data: 'categoria_overview', id: 6 },
                    'Primera': { data: 'categoria_overview', id: 7 },
                  },
                },
                'Femenino': {
                  icon: '👧',
                  items: {
                    'Sub-9': { data: 'categoria_overview', id: 8 },
                    'Sub-11': { data: 'categoria_overview', id: 9 },
                    'Sub-13': { data: 'categoria_overview', id: 10 },
                    'Sub-15': { data: 'categoria_overview', id: 11 },
                    'Sub-17': { data: 'categoria_overview', id: 12 },
                    'Reserva': { data: 'categoria_overview', id: 13 },
                    'Primera': { data: 'categoria_overview', id: 14 },
                  },
                },
              },
            },
            'Torneo Senior': { icon: '👴', data: 'torneo_overview', id: 2 },
          },
        },
        'Padel': { icon: '🏓', items: {} },
      },
    },
    'Eventos': { hidden: true, icon: '📅', subtitle: 'Próximos eventos', data: 'eventos' },
    'Farmacias': { icon: '💊', subtitle: 'Farmacias abiertas', data: 'farmacias' },
    'Información útil': { icon: 'ℹ️', subtitle: 'Datos de interés', data: 'info_util' },
  },

  // `id` no se repite y no cambia (se usa en la dirección de cada farmacia).
  farmacias: [
    { id: 1, name: F.ARGENTINA, address: 'Hipólito Yrigoyen 444', phone: '452246', latitude: 40.4168, longitude: -3.7038 },
    { id: 2, name: F.SORALUCE, address: 'Av. Avellaneda 777', phone: '450085', latitude: -36.0218168, longitude: -59.100389 },
    { id: 3, name: F.PACULNIS, address: 'Av. San Martín 911', phone: '450688', latitude: -36.01981885136401, longitude: -59.09396280291596 },
    { id: 4, name: F.PASTEUR, address: 'Pueyrredón 515', phone: '442250', latitude: -36.0190793870177, longitude: -59.09996103107345 },
    { id: 5, name: F.SAN_MARTIN, address: 'Av. San Martín 430', phone: '452223', latitude: -36.015405158497785, longitude: -59.0997296216459 },
    { id: 6, name: F.NIETO, address: 'Av. Pte. Perón 697', phone: '440994', latitude: -36.0133786, longitude: -59.0931463 },
    { id: 7, name: F.MAFREN, address: 'Av. San Martín 289', phone: '450783', latitude: -36.01166721191306, longitude: -59.10460516175925 },
    { id: 8, name: F.GIRALDI, address: 'Av. Pte Perón y Bernardo de Irigoyen', phone: '440878', latitude: -36.01592945917803, longitude: -59.08987060192867 },
    { id: 9, name: F.DI_BERNARDI, address: 'Av. Avellaneda y Av. Rivadavia', phone: '452848', latitude: -36.01806495482405, longitude: -59.10504136249648 },
    { id: 10, name: F.MANZOTTI, address: 'Harosteguy 315', phone: '453944', latitude: -36.01467411398398, longitude: -59.09644469622471 },
  ],

  // Farmacia de turno por día del mes (de 8 a 8: antes de las 8 de la mañana
  // sigue la del día anterior).
  // Fuente: https://playradios.com.ar/wp-content/uploads/2026/11/WhatsApp-Image-2026-11-02-at-07.43.12.jpeg (noviembre 2026)
  turnos: {
    1: F.SAN_MARTIN,
    2: F.NIETO,
    3: F.MAFREN,
    4: F.GIRALDI,
    5: F.DI_BERNARDI,
    6: F.MANZOTTI,
    7: F.ARGENTINA,
    8: F.SORALUCE,
    9: F.PACULNIS,
    10: F.PASTEUR,
    11: F.SAN_MARTIN,
    12: F.NIETO,
    13: F.MAFREN,
    14: F.SORALUCE,
    15: F.DI_BERNARDI,
    16: F.MANZOTTI,
    17: F.ARGENTINA,
    18: F.SORALUCE,
    19: F.PACULNIS,
    20: F.PASTEUR,
    21: F.SAN_MARTIN,
    22: F.NIETO,
    23: F.MAFREN,
    24: F.GIRALDI,
    25: F.DI_BERNARDI,
    26: F.MANZOTTI,
    27: F.ARGENTINA,
    28: F.GIRALDI,
    29: F.PACULNIS,
    30: F.PASTEUR,
  },

  infoUtil: {
    telefonos: {
      'Policía': '911 / 101 / (02244) 452500 / 452222',
      'Bomberos': '100 / (02244) 452888',
      'Hospital': '(02244) 452114 / 452883 / 452046',
      'Instituto Privado de Diagnóstico': '(02244) 452780 / 451155',
    },
    // Campos opcionales: phone, address, website, open_hours (null si no hay).
    servicios: {
      'Municipalidad': { phone: '(02244) 442118 / 441258 / 441124', address: 'Av. Rivadavia y San Martín', website: 'www.lasflores.gob.ar', open_hours: 'Lunes a Viernes de 7:30–13:30' },
      'Registro Civil': { phone: '452050', address: 'Pueyrredón 200', website: null, open_hours: 'Lun–Vie 8:00–14:00' },
      'Juzgado de Paz': { phone: '452080', address: 'Belgrano 320', website: null, open_hours: 'Lun–Vie 8:00–14:00' },
      'Correo Argentino': { phone: '0810-222-6763', address: 'Av. San Martín 100', website: 'www.correoargentino.com.ar', open_hours: 'Lun–Vie 9:00–17:00, Sáb 9:00–13:00' },
      'ANSES': { phone: '130', address: 'Rivadavia 450', website: 'www.anses.gob.ar', open_hours: 'Lun–Vie 8:00–14:00' },
      'PAMI': { phone: '138', address: 'Av. Avellaneda 530', website: 'www.pami.org.ar', open_hours: 'Lun–Vie 8:00–16:00' },
      'Terminal de Ómnibus': { phone: '452500', address: 'Av. Circunvalación s/n', website: null, open_hours: 'Todos los días 6:00–23:00' },
      'Cooperativa de Electricidad y Servicios de Las Flores': { phone: '442066 / 407101', address: '25 de Mayo 513', website: 'https://coopelf.com.ar/', open_hours: 'Lunes a Viernes de 6:00 a 13:00 hs.' },
    },
  },

  // { id, name, description, date: 'AAAA-MM-DD HH:MM', lugar, latitude, longitude }
  eventos: [],

  // Fútbol. `deporte_torneo_id` / `categoria_id` corresponden a los `id` del menú.
  equipos: [
    { id: 1, deporte_torneo_id: 1, categoria_id: null, name: 'Ferro', logo: null },
    { id: 2, deporte_torneo_id: 1, categoria_id: null, name: 'Deportiva', logo: null },
    { id: 3, deporte_torneo_id: 1, categoria_id: null, name: 'Juventud Unida', logo: null },
    { id: 4, deporte_torneo_id: 1, categoria_id: null, name: 'Atlético', logo: null },
    { id: 5, deporte_torneo_id: 1, categoria_id: null, name: 'El Hollín', logo: null },
    { id: 6, deporte_torneo_id: 1, categoria_id: null, name: 'El Taladro', logo: null },
    { id: 7, deporte_torneo_id: 1, categoria_id: null, name: 'Barrio Traut', logo: null },
  ],
  // { id, deporte_equipo_id, name, date_of_birth, photo }
  jugadores: [],
  // { id, torneo_id, categoria_id, home_equipo_id, away_equipo_id, scheduled_at: 'AAAA-MM-DD HH:MM', place, home_score, away_score }
  // Sin resultado todavía: home_score y away_score en null.
  partidos: [],
  // { id, partido_id, jugador_id, equipo_id, minute }
  goles: [],
};
