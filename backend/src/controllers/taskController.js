const { Task, User } = require('../models/index');
const { Op } = require('sequelize');

// GET /api/tasks
const getAllTasks = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 6 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (req.user.role !== 'admin') {
      where.assigneeId = req.user.id;
    }

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
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
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role !== 'admin' && task.assigneeId !== req.user.id) {
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
    const { title, description, status, dueDate, assigneeId } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      dueDate,
      assigneeId: assigneeId || req.user.id,
      createdById: req.user.id,
    });

    return res.status(201).json({ message: 'Task created successfully.', task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role !== 'admin' && task.assigneeId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { title, description, status, dueDate, assigneeId } = req.body;
    await task.update({ title, description, status, dueDate, assigneeId });

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

    if (req.user.role !== 'admin' && task.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await task.destroy();
    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTasks, getTask, createTask, updateTask, deleteTask };
