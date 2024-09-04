const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: no token provided.' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await User.findById(decoded.id); 

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: user not found.' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: invalid token' });
    }
};

module.exports = authMiddleware;
