const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false   // Required for Render/Neon SSL connections
  }
});

module.exports = pool;