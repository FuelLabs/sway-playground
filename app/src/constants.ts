const SERVER_API =
  process.env.REACT_APP_SERVER_API ||
  "https://api.sway-playground.fuel.network";

export const FUEL_GREEN = "#00f58c";
export const LOCAL_SERVER_URI = "http://0.0.0.0:8080";
export const SERVER_URI = process.env.REACT_APP_LOCAL_SERVER
  ? LOCAL_SERVER_URI
  : SERVER_API;

// AI Configuration
export const AI_BACKEND_URL = process.env.REACT_APP_AI_BACKEND_URL || 'http://localhost:3001';
export const AI_FEATURES_ENABLED = process.env.REACT_APP_AI_FEATURES_ENABLED === 'true';
