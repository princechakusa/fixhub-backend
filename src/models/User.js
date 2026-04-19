const pool = require('../config/db');

const User = {
  findAll: async (companyId = null) => {
    let query = 'SELECT id, name, email, role, color, access_level, company_id, created_at FROM users WHERE is_active = true';
    const params = [];
    if (companyId) {
      params.push(companyId);
      query += ' AND company_id = $1';
    }
    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    return result.rows;
  },
  findById: async (id) => {
    const result = await pool.query('SELECT id, name, email, role, color, access_level, company_id FROM users WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0];
  },
  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    return result.rows[0];
  },
  create: async (userData) => {
    const { name, email, password_hash, role, color, access_level, company_id } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, color, access_level, company_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id, name, email, role, color, access_level, company_id`,
      [name, email, password_hash, role, color, access_level, company_id]
    );
    return result.rows[0];
  },
  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let idx = 2;
    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); values.push(updates.name); }
    if (updates.email !== undefined) { fields.push(`email = $${idx++}`); values.push(updates.email); }
    if (updates.role !== undefined) { fields.push(`role = $${idx++}`); values.push(updates.role); }
    if (updates.color !== undefined) { fields.push(`color = $${idx++}`); values.push(updates.color); }
    if (updates.access_level !== undefined) { fields.push(`access_level = $${idx++}`); values.push(updates.access_level); }
    if (updates.company_id !== undefined) { fields.push(`company_id = $${idx++}`); values.push(updates.company_id); }
    if (updates.password_hash !== undefined) { fields.push(`password_hash = $${idx++}`); values.push(updates.password_hash); }
    if (fields.length === 0) return null;
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING id, name, email, role, color, access_level, company_id`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  delete: async (id) => {
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);
  }
};

module.exports = User;