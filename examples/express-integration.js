// Express.js integration example
const express = require('express');
const { validateEnv } = require('env-config-validator');

// Validate environment at startup
const env = validateEnv({
  schemaPath: '.env.schema.json',
  exitOnError: true
});

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Server is running!',
    environment: env.NODE_ENV,
    port: env.PORT,
    debug: env.DEBUG
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🐛 Debug mode: ${env.DEBUG ? 'enabled' : 'disabled'}`);
});
