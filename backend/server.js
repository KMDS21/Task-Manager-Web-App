require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { testConnection, sequelize } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
<<<<<<< HEAD
const adminRoutes = require('./src/routes/adminRoutes');
=======
>>>>>>> feature/file-upload
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

<<<<<<< HEAD
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
=======
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
>>>>>>> feature/file-upload

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

startServer();

module.exports = app;
