const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAdminStats,
  getAdminUsers,
  createUser,
  getAllAdminTickets,
} = require('../controllers/admin.controller');

// All admin routes require protect and authorize('admin')
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.post('/users/create', createUser);
router.post('/users/create-agent', createUser);
router.get('/tickets', getAllAdminTickets);

module.exports = router;
