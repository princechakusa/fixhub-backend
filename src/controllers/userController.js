const User = require('../models/User');
const { hashPassword } = require('../utils/hashPassword');

// Get all users (only for managers)
const getAllUsers = async (req, res) => {
  try {
    // Only managers can see all users; technicians see only themselves (optional)
    if (req.user.access_level !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.findAll();
    // Remove password hash from response
    const safeUsers = users.map(({ password_hash, ...rest }) => rest);
    res.json(safeUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    if (req.user.access_level !== 'manager' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    delete user.password_hash;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user (manager only)
const createUser = async (req, res) => {
  try {
    if (req.user.access_level !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, email, role, color, access_level, company_id, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    // Check if email already exists
    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const password_hash = await hashPassword(password);
    const newUser = await User.create({
      name, email, password_hash, role: role || 'Technician',
      color: color || '#0891b2', access_level: access_level || 'technician', company_id
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (manager only)
const updateUser = async (req, res) => {
  try {
    if (req.user.access_level !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, email, role, color, access_level, company_id, password } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (color !== undefined) updates.color = color;
    if (access_level !== undefined) updates.access_level = access_level;
    if (company_id !== undefined) updates.company_id = company_id;
    if (password) updates.password_hash = await hashPassword(password);
    const updated = await User.update(req.params.id, updates);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (manager only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.access_level !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await User.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };