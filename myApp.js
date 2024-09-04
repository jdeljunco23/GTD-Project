require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('./src/middleware/authMiddleware');

const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const projectRoutes = require('./src/routes/projectRoutes');

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process if the database connection fails
    });


// Home route
app.get('/', (req, res) => {
    res.send('Hello GTD System!');
});

// User routes
app.use('/api/users', userRoutes);

// Tasks routes
app.use('/api/tasks', authMiddleware, taskRoutes);

// Project routes
app.use('/api/projects', authMiddleware, projectRoutes);

// Error handling
// Handle 404 for undefined routes
app.use((req, res, next) => {
    res.status(404).send('Route not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});

// Port Number
const PORT = process.env.PORT || 3000;

// Server Setup
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
