/**
 * Auto-restart wrapper for the Panic Ring backend.
 * Run with: node start.js
 * Restarts the server automatically if it crashes.
 */
const { spawn } = require('child_process');
const path = require('path');

let restarts = 0;
const MAX_RESTARTS = 10;
const RESTART_DELAY_MS = 2000;

function start() {
  if (restarts >= MAX_RESTARTS) {
    console.error(`❌ Server crashed ${MAX_RESTARTS} times. Giving up.`);
    process.exit(1);
  }

  console.log(`🚀 Starting Panic Ring backend... (attempt ${restarts + 1})`);

  const child = spawn('node', [path.join(__dirname, 'src/index.js')], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (code === 0) {
      console.log('✅ Server exited cleanly.');
      process.exit(0);
    }
    restarts++;
    console.error(`⚠️  Server crashed (code=${code}, signal=${signal}). Restarting in ${RESTART_DELAY_MS}ms...`);
    setTimeout(start, RESTART_DELAY_MS);
  });

  // Forward signals to child
  ['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => {
      child.kill(sig);
      process.exit(0);
    });
  });
}

start();
