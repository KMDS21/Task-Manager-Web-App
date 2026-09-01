const { User, Task } = require('../models/index');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalTasks = await Task.count();
    const pendingTasks = await Task.count({ where: { status: 'pending' } });
    const inProgressTasks = await Task.count({ where: { status: 'in_progress' } });
    const completedTasks = await Task.count({ where: { status: 'completed' } });

    return res.status(200).json({
      stats: { totalUsers, totalTasks, pendingTasks, inProgressTasks, completedTasks },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      include: [{ model: Task, as: 'assignedTasks', attributes: ['id', 'status'] }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin".' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await user.update({ role });
    return res.status(200).json({ message: 'User role updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await user.destroy();
    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUserRole, deleteUser };
