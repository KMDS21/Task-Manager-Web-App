const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Task Action Routes
router.post('/:id/accept', taskController.acceptTask);
router.post('/:id/reject', taskController.rejectTask);
router.post('/:id/complete', taskController.completeTask);

// File Attachment Routes
router.post('/:id/files', upload.single('file'), taskController.uploadTaskFile);
router.delete('/:id/files/:fileId', taskController.deleteTaskFile);

module.exports = router;
