// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded.id; 
        req.role = decoded.role
        // Store user info in request
        next();
    } catch (error) {
        return res.redirect('/login');
    }
};

module.exports = { verifyToken };
