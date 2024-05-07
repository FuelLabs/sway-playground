export const FUEL_GREEN = '#00f58c';

export const LOCAL_SERVER_URI = 'http://0.0.0.0:8080';
export const IS_LOCAL = !!process.env.REACT_APP_LOCAL_SERVER;
export const SERVER_URI = IS_LOCAL
  ? LOCAL_SERVER_URI
  : 'https://api.sway-playground.org';
export const APPROVED_EXTERNAL_DOMAIN = IS_LOCAL
  ? 'http://localhost:3000' // Local domain of docs hub
  : 'https://docs-hub.vercel.app';
