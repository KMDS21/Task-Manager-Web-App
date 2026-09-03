const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', requireRole('super_admin'), adminController.updateUserRole);
router.put('/users/:id/department', adminController.updateUserDepartment);
router.delete('/users/:id', requireRole('super_admin'), adminController.deleteUser);

module.exports = router;
