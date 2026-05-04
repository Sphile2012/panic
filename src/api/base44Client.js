// Compatibility shim — redirects all legacy base44 imports to phumeClient
export { default as base44, auth, entities, functions, tokenStore } from './phumeClient.js';
