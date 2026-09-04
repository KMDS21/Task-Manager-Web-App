require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { testConnection, sequelize } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration allowing AWS Amplify & local clients
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Manager API is running 🚀' });
});

app.use(errorHandler);

const startServer = async () => {
  await testConnection();
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  });
};

// Only listen if not imported by test suite
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
