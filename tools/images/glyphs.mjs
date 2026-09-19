/**
 * Line-icon glyph library, drawn on a 24x24 grid.
 * Every glyph is { main, accent }: `main` is stroked in the base colour, `accent`
 * (optional) in the highlight colour, which gives the icons their two-tone look.
 * These are original drawings made for fluxmigrate.com.
 */

const G = {
  cloud: { main: `<path d="M7 18.5h9.5a3.5 3.5 0 0 0 .6-6.95 5.5 5.5 0 0 0-10.7 1.35A3.05 3.05 0 0 0 7 18.5z"/>` },

  gear: {
    main: `<circle cx="12" cy="12" r="6.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>`,
    accent: `<circle cx="12" cy="12" r="2.4"/>`,
  },

  shield: { main: `<path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z"/>` },
  "shield-check": {
    main: `<path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z"/>`,
    accent: `<path d="m9 12 2.2 2.2L15.2 10"/>`,
  },
  "shield-lock": {
    main: `<path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z"/>`,
    accent: `<rect x="9.2" y="11" width="5.6" height="4.2" rx="1"/><path d="M10.5 11V9.8a1.5 1.5 0 0 1 3 0V11"/>`,
  },

  users: {
    main: `<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.5-3.2 2.8-5 5.5-5s5 1.8 5.5 5"/>`,
    accent: `<circle cx="17" cy="9.5" r="2.4"/><path d="M15.6 14.2c2.3.2 4 1.6 4.4 4.3"/>`,
  },
  user: {
    main: `<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-3.8 3.4-6 7-6s6.4 2.2 7 6"/>`,
  },

  clock: { main: `<circle cx="12" cy="12" r="8.5"/>`, accent: `<path d="M12 7.5V12l3.2 2"/>` },

  hexagon: {
    main: `<path d="M12 3.5 19.5 7.75v8.5L12 20.5 4.5 16.25v-8.5z"/>`,
    accent: `<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6V6.2M14.1 13.2l3 1.7M9.9 13.2l-3 1.7"/>`,
  },

  bars: { main: `<path d="M3 20.5h18"/>`, accent: `<path d="M6 20V11M12 20V4.5M18 20v-6.5"/>` },

  compass: {
    main: `<circle cx="12" cy="12" r="8.5"/>`,
    accent: `<path d="m14.8 9.2-2 5.6-5.6 2 2-5.6z"/>`,
  },

  layers: {
    main: `<path d="m12 4 8 4.2-8 4.2-8-4.2z"/>`,
    accent: `<path d="m4 12.4 8 4.2 8-4.2M4 16.6l8 4.2 8-4.2"/>`,
  },

  server: {
    main: `<rect x="4" y="4" width="16" height="6.5" rx="2"/><rect x="4" y="13.5" width="16" height="6.5" rx="2"/>`,
    accent: `<path d="M8 7.25h.01M8 16.75h.01M12 7.25h4M12 16.75h4"/>`,
  },

  database: {
    main: `<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.55 3.1 2.8 7 2.8s7-1.25 7-2.8V6"/>`,
    accent: `<path d="M5 12c0 1.55 3.1 2.8 7 2.8s7-1.25 7-2.8"/>`,
  },

  terminal: {
    main: `<rect x="3" y="4.5" width="18" height="15" rx="3"/>`,
    accent: `<path d="m7.5 10 3 2.5-3 2.5M13 15h4"/>`,
  },

  branch: {
    main: `<circle cx="6.5" cy="5.5" r="2"/><circle cx="6.5" cy="18.5" r="2"/><circle cx="17.5" cy="9" r="2"/>`,
    accent: `<path d="M6.5 7.5v9M17.5 11c0 3.5-4 3-8 4.2-1.8.5-3 1-3 2"/>`,
  },

  code: { main: `<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>`, accent: `<path d="M13.5 5.5l-3 13"/>` },

  refresh: {
    main: `<path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6"/>`,
    accent: `<path d="M17.7 3v3.4h-3.4M6.3 21v-3.4h3.4"/>`,
  },

  bolt: { main: `<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>` },

  target: {
    main: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/>`,
    accent: `<circle cx="12" cy="12" r="1.3"/>`,
  },

  eye: {
    main: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/>`,
    accent: `<circle cx="12" cy="12" r="3"/>`,
  },

  cube: {
    main: `<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/>`,
    accent: `<path d="M12 12v9M4 7.5l8 4.5 8-4.5"/>`,
  },

  globe: {
    main: `<circle cx="12" cy="12" r="8.5"/>`,
    accent: `<path d="M3.5 12h17M12 3.5c2.6 2.4 4 5.4 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.4-4-8.5s1.4-6.1 4-8.5z"/>`,
  },

  cpu: {
    main: `<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>`,
    accent: `<rect x="9.6" y="9.6" width="4.8" height="4.8" rx="1"/>`,
  },

  pulse: { main: `<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>` },

  file: {
    main: `<path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M14 3.5V8h4"/>`,
    accent: `<path d="M8.5 12.5h7M8.5 16h5"/>`,
  },

  repeat: {
    main: `<path d="M4 11V9.5A2.5 2.5 0 0 1 6.5 7H19M20 13v1.5a2.5 2.5 0 0 1-2.5 2.5H5"/>`,
    accent: `<path d="m16 4 3 3-3 3M8 20l-3-3 3-3"/>`,
  },

  checklist: {
    main: `<path d="M11 7h9M11 13h9M11 19h9"/>`,
    accent: `<path d="M4.5 6.5 6 8l2.5-2.5M4.5 12.5 6 14l2.5-2.5M4.5 18.5 6 20l2.5-2.5"/>`,
  },

  flag: { main: `<path d="M5.5 21V4"/>`, accent: `<path d="M5.5 4h11l-2 4 2 4h-11"/>` },

  calendar: {
    main: `<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>`,
    accent: `<path d="M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01"/>`,
  },

  expand: {
    main: `<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>`,
    accent: `<path d="m4 4 6 6M20 4l-6 6M4 20l6-6M20 20l-6-6"/>`,
  },

  award: {
    main: `<circle cx="12" cy="9" r="5.5"/><path d="m8.7 13.6-1.7 7 5-2.7 5 2.7-1.7-7"/>`,
    accent: `<path d="m10 9 1.4 1.4L14.2 7.6"/>`,
  },

  building: {
    main: `<path d="M4.5 20.5v-16A1.5 1.5 0 0 1 6 3h8a1.5 1.5 0 0 1 1.5 1.5V9H18a1.5 1.5 0 0 1 1.5 1.5v10M2.5 20.5h19"/>`,
    accent: `<path d="M8 7h4M8 11h4M8 15h4M16.8 13h.01M16.8 16.5h.01"/>`,
  },

  signal: {
    main: `<path d="M12 12v9"/><circle cx="12" cy="10" r="1.8"/>`,
    accent: `<path d="M7.7 5.7a6 6 0 0 0 0 8.6M16.3 5.7a6 6 0 0 1 0 8.6M4.9 2.9a10 10 0 0 0 0 14.2M19.1 2.9a10 10 0 0 1 0 14.2"/>`,
  },

  bank: {
    main: `<path d="M3 9.5 12 4l9 5.5zM3.5 20.5h17M5.5 10.5v7M10 10.5v7M14 10.5v7M18.5 10.5v7"/>`,
  },

  search: { main: `<circle cx="10.5" cy="10.5" r="6.5"/>`, accent: `<path d="m20 20-4.9-4.9"/>` },

  map: {
    main: `<path d="M3.5 6.5 9 4l6 2.5 5.5-2.5v13L15 19.5 9 17l-5.5 2.5z"/>`,
    accent: `<path d="M9 4v13M15 6.5v13"/>`,
  },

  link: {
    main: `<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/>`,
    accent: `<path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>`,
  },

  lock: {
    main: `<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
    accent: `<path d="M12 14.5v2.5"/>`,
  },

  headset: {
    main: `<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h2.5v4H5a1 1 0 0 1-1-1zM20 14h-2.5v4H19a1 1 0 0 0 1-1z"/>`,
    accent: `<path d="M15.5 18.5c-.5 1.4-1.8 2-4 2"/>`,
  },

  swap: {
    main: `<path d="M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5"/>`,
    accent: `<path d="M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5"/>`,
  },

  rocket: {
    main: `<path d="M12 3c3 1.5 5 4.5 5 8l-2.5 3h-5L7 11c0-3.5 2-6.5 5-8z"/>`,
    accent: `<path d="M9.5 14l-1 4 3-1.5M14.5 14l1 4-3-1.5"/><circle cx="12" cy="9.5" r="1.2"/>`,
  },

  infinity: {
    main: `<path d="M12 12c-1.7-2.6-3.3-4-5.2-4a4 4 0 1 0 0 8c1.9 0 3.5-1.4 5.2-4z"/>`,
    accent: `<path d="M12 12c1.7 2.6 3.3 4 5.2 4a4 4 0 1 0 0-8c-1.9 0-3.5 1.4-5.2 4z"/>`,
  },

  pencil: {
    main: `<path d="M4 20l4.5-1 10-10a2 2 0 0 0-2.8-2.8l-10 10z"/>`,
    accent: `<path d="M14.5 7.5l2 2"/>`,
  },

  arrow: { main: `<path d="M4 12h15m0 0-5-5m5 5-5 5"/>` },
};

export default G;
