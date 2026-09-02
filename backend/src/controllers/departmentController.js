const { Department, User, Task } = require('../models/index');

// GET /api/departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ departments });
  } catch (error) {
    next(error);
  }
};

// POST /api/departments
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required.' });

    const existing = await Department.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: 'A department with this name already exists.' });

    const department = await Department.create({ name, description });
    return res.status(201).json({ message: 'Department created successfully.', department });
  } catch (error) {
    next(error);
  }
};

// PUT /api/departments/:id
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const { name, description } = req.body;
    await department.update({ name, description });
    return res.status(200).json({ message: 'Department updated successfully.', department });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/departments/:id
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    // Unassign all members before deleting
    await User.update({ departmentId: null }, { where: { departmentId: department.id } });
    await department.destroy();
    return res.status(200).json({ message: 'Department deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
