require('dotenv').config();
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, taskController.createTask);

router.get('/:id', authMiddleware, taskController.getTaskById);

router.get('/', authMiddleware, taskController.getAllTasks);

router.put('/:id', authMiddleware, taskController.updateTask);

router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;