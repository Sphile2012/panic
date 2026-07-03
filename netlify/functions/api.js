/**
 * Netlify Function — wraps the entire Express backend as a serverless function.
 * All /api/* requests from Netlify are routed here via netlify.toml redirect.
 */
const serverless = require("serverless-http");

// Load environment variables
require("dotenv").config();

// Import the Express app
const app = require("../../backend/src/index-netlify");

// Export as serverless handler
module.exports.handler = serverless(app);
