const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(authenticate);

router.get('/', requireRole('admin', 'super_admin'), departmentController.getDepartments);
router.post('/', requireRole('super_admin'), departmentController.createDepartment);
router.put('/:id', requireRole('super_admin'), departmentController.updateDepartment);
router.delete('/:id', requireRole('super_admin'), departmentController.deleteDepartment);

module.exports = router;
