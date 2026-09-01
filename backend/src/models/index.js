const User = require('./User');
const Task = require('./Task');
const File = require('./File');

// Task ↔ User (assignee)
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });

// Task ↔ User (creator)
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdById' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'createdById' });

// Task ↔ File (1-to-many)
Task.hasMany(File, { as: 'files', foreignKey: 'taskId', onDelete: 'CASCADE' });
File.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// File ↔ User (uploader)
File.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedById' });
User.hasMany(File, { as: 'uploadedFiles', foreignKey: 'uploadedById' });

module.exports = { User, Task, File };
