const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const File = sequelize.define('File', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  taskId: { type: DataTypes.UUID, allowNull: false, field: 'task_id' },
  uploadedById: { type: DataTypes.UUID, allowNull: false, field: 'uploaded_by_id' },
  fileUrl: { type: DataTypes.STRING(500), allowNull: false, field: 'file_url' },
  originalName: { type: DataTypes.STRING(255), allowNull: false, field: 'original_name' },
  fileType: { type: DataTypes.STRING(100), allowNull: true, field: 'file_type' },
  sizeBytes: { type: DataTypes.INTEGER, allowNull: true, field: 'size_bytes' },
}, {
  tableName: 'files',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

module.exports = File;
