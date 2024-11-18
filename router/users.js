// routes/authRoutes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const { getData } = require('../mysql');
const { getPw } = require('../bcrypt');
const { generate } = require('../jwt');
const { verifyToken } = require('../middleware/auth_middleware');
const { v4: uuidv4 } = require('uuid'); // v4 generates a random UUID

// Generate a UUID

const router = express.Router();
const jwt = require('jsonwebtoken')

router.get('/', verifyToken,async(req, res) => {
    const datas = await getData('SELECT * FROM user WHERE role = 0');
    
    res.render('users/listUsers', { title: 'Registration Page', layout: 'layouts/main_layout' ,role:req.role,datas});
});
router.post('/delete', verifyToken, async (req, res) => {
    const userId = req.body.id_user;  // Get user ID from the route parameter

    // Correct the SQL query by using parameterized queries to avoid SQL injection
    await getData('DELETE FROM `user` WHERE `id_user` = ?', [userId]);

    res.redirect('/users');
});
module.exports = router;