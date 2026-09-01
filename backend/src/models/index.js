const User = require('./User');
const Task = require('./Task');

// Task ↔ User (assignee)
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });

// Task ↔ User (creator)
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdById' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'createdById' });

module.exports = { User, Task };
