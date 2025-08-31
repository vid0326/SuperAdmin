const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireSuperadmin = require('../middleware/requireSuperadmin');
const userService = require('../services/userService');

router.use(auth, requireSuperadmin);

// GET  users list
router.get('/', async (req, res) => {
  try {
    const users = await userService.getUsers(req.query);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET  get single user by id
// routes/users.js
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST   add user 
router.post('/', async (req, res) => {
  try {
    const { name, email, password, roleIds } = req.body;
    const user = await userService.createUser({ name, email, password, roleIds, actorUserId: req.user.id });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT edit user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, roleIds } = req.body;
    const user = await userService.updateUser(req.params.id, { name, email, password, roleIds }, req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id, req.user.id);
    res.json({ message: 'User deleted', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
