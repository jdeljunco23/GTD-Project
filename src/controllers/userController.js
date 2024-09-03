require('dotenv').config();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.SECRET_KEY;

const createUser = async (req, res) => {
    try {

        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: 'Username already taken' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed:', hashedPassword);

        let newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log('User created:', newUser);
        res.status(201).json({ message: 'User created', user: newUser });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ error: err.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '30d' });
        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getUserById = async (req, res) => {

    try {
        const user = await User.findById(req.params.id).populate('projects').populate('tasks');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('projects').populate('tasks');
        res.status(201).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error. Please try again later.' })
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.params.id;

        if (username) {
            const existingUser = await User.findOne({ username });

            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(409).json({ error: 'Username already taken.' })
            }
        }

        let updateData = { username, email };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User updated', user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

module.exports = {
    createUser,
    loginUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
};