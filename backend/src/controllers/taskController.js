const { Task, File, User, Department } = require('../models/index');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// GET /api/tasks
const getAllTasks = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 6 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];

    // Role-based task scoping:
    // Regular employees / non-admins ONLY see tasks strictly assigned to them
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      conditions.push({ assigneeId: req.user.id });
    } else if (req.user.role === 'admin' && req.user.departmentId) {
      // Department Admin sees tasks created by them OR assigned to employees in their department
      conditions.push({
        [Op.or]: [
          { createdById: req.user.id },
          { '$assignee.department_id$': req.user.departmentId },
        ],
      });
    }
    // Super Admin sees all tasks

    if (status) conditions.push({ status });

    if (search) {
      conditions.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'departmentId'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'departmentId'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
        { model: File, as: 'files' },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      subQuery: false,
    });

    return res.status(200).json({
      tasks: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'departmentId'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'departmentId'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
        { model: File, as: 'files', include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }] },
      ],
    });

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && task.assigneeId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Employees cannot create tasks. Only Admin can assign tasks.' });
    }

    const { title, description, dueDate, assigneeId } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const task = await Task.create({
      title,
      description,
      status: 'pending',
      dueDate,
      assigneeId: assigneeId || null,
      createdById: req.user.id,
    });

    return res.status(201).json({ message: 'Task created and assigned successfully.', task });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/:id/accept
const acceptTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.assigneeId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the assigned employee can accept this task.' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ message: `Task cannot be accepted because it is already ${task.status}.` });
    }

    await task.update({ status: 'in_progress' });
    return res.status(200).json({ message: 'Task accepted and moved to In Progress.', task });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/:id/reject
const rejectTask = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.assigneeId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the assigned employee can reject this task.' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ message: `Task cannot be rejected because it is already ${task.status}.` });
    }

    await task.update({ status: 'rejected', rejectionReason: reason });
    return res.status(200).json({ message: 'Task rejected.', task });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/:id/complete
const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.assigneeId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the assigned employee can mark this task complete.' });
    }

    if (task.status !== 'in_progress') {
      return res.status(400).json({ message: 'Task must be in progress before marking complete.' });
    }

    await task.update({ status: 'completed' });
    return res.status(200).json({ message: 'Task marked completed.', task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Employees cannot edit task details.' });
    }

    const { title, description, dueDate, assigneeId } = req.body;
    await task.update({ title, description, dueDate, assigneeId });

    return res.status(200).json({ message: 'Task updated successfully.', task });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Employees cannot delete tasks.' });
    }

    await task.destroy();
    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/:id/files
const uploadTaskFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const file = await File.create({
      taskId: task.id,
      uploadedById: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    return res.status(201).json({ message: 'File uploaded successfully.', file });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id/files/:fileId
const deleteTaskFile = async (req, res, next) => {
  try {
    const file = await File.findByPk(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found.' });

    const filePath = path.join(__dirname, '../../', file.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await file.destroy();
    return res.status(200).json({ message: 'File deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  acceptTask,
  rejectTask,
  completeTask,
  updateTask,
  deleteTask,
  uploadTaskFile,
  deleteTaskFile,
};
