require('dotenv').config();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.SECRET_KEY;

const createUser = async (req, res) => {
    try {
        console.log('Received request to create user:', req.body);

        let { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Hash the password
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

module.exports = {
    createUser,
    loginUser,
    getUserById
};