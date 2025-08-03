// Basic usage example for env_schema_validator
const { validateEnv } = require('env_schema_validator');

// This will validate your environment variables against .env.schema.json
// and return the processed environment with proper types
try {
  const env = validateEnv();
  
  console.log('✅ Environment validation passed!');
  console.log('NODE_ENV:', env.NODE_ENV); // string
  console.log('PORT:', env.PORT);         // number
  console.log('DEBUG:', env.DEBUG);       // boolean
  
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}
