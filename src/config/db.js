const { Pool } = require('pg');

// Use DATABASE_URL from environment, or fall back to Neon connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Za5HrLIFi2Cy@ep-frosty-mountain-a18f2jo7.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
