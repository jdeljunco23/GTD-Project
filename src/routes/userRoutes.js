const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.createUser);

router.post('/login', userController.loginUser);

router.get('/:id', authMiddleware, userController.getUserById);

router.get('/', authMiddleware, userController.getAllUsers);

router.put('/:id', authMiddleware, userController.updateUser);

router.delete('/:id', authMiddleware, userController.deleteUser);


module.exports = router;