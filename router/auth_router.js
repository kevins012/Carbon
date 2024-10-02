// routes/authRoutes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const { getData } = require('../mysql');
const { getPw } = require('../bcrypt');
const { generate } = require('../jwt');
const { verifyToken } = require('../middleware/auth_middleware');

const router = express.Router();
const jwt = require('jsonwebtoken')
router.get('/login', (req, res) => {
    const authorization = req.cookies.token;
    try {
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        req.user = decoded; 
        res.redirect('/');
    } catch (error) {
        console.log("jjj");
        res.render('login', { title: 'Login Page', layout: 'layouts/first' });
    }
});

router.get('/registration', (req, res) => {
    res.render('registration', { title: 'Registration Page', layout: 'layouts/first' });
});

router.get('/logout', (req, res) => {
    res.clearCookie("token");
    return res.redirect('/login');
});

router.post('/login/user', [
    check('email').custom(async (value, { req }) => {
        const results = await getData('SELECT * FROM user');
        const pwChecks = results.filter((r) => r.email === req.body.email)
                                .map(async (r) => getPw(req.body.password, r.password, 1));
        const pwResults = await Promise.all(pwChecks);
        if (!pwResults.some(result => result)) {
            return Promise.reject('Invalid password');
        }
        return true;
    }),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('login', { title: 'Login Page', layout: 'layouts/first', errors: errors.array() });
    } else {
        const token = generate(req.body.email);
        res.cookie('token', token, { maxAge: 900000, httpOnly: true, secure: false });
        res.redirect('/');
    }
});

router.post('/registration/user', [
    check('email').custom(async (value, { req }) => {
        const results = await getData('SELECT * FROM user');
        for (const r of results) {
            if (r.email === value) throw new Error('Email already in use');
            if (req.body.nik === r.nik) throw new Error('NIK already in use');
        }
        if (req.body.password !== req.body.confirmPassword) throw new Error('Passwords do not match');
        return true;
    }),
    check('email', 'Invalid email').isEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('registration', { title: 'Registration Page', layout: 'layouts/first', errors: errors.array() });
    } else {
        const password = await getPw(req.body.password);
        const query = 'INSERT INTO `user` (`ID`, `Nama`, `password`, `email`, `nik`, `last_login`) VALUES (NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP())';
        await getData(query, [req.body.fullName, password, req.body.email, req.body.nik]);
        res.redirect('/login');
    }
});

router.get('/', verifyToken, (req, res) => {
    const mahasiswa = [
        { nama: 'bulan', email: 'bulan456@gmail.com' },
        { nama: 'angin', email: 'angin012@gmail.com' },
    ];
    res.render('index', { layout: 'layouts/main_layout', nama: 'KevBlod', title: 'Belajarku', mahasiswa });
});

router.get('/about', verifyToken, (req, res) => {
    res.render('about', { layout: 'layouts/main_layout', title: 'About Page' });
});

module.exports = router;
