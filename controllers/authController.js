const { validationResult } = require('express-validator');
const { getPw, hashPw } = require('../utils/bcryptUtils');
const { getData } = require('../mysql');

exports.getLogin = (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login', csrfToken: req.csrfToken(), layout: 'layouts/first' });
};

exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { title: 'Login', layout: 'layouts/first', errors: errors.array(), csrfToken: req.csrfToken() });
  }
  const { email, password } = req.body;
  const results = await getData('SELECT * FROM user WHERE email = ?', [email]);

  if (results.length === 0) {
    return res.render('login', { title: 'Login', layout: 'layouts/first', errors: [{ msg: 'User not found' }], csrfToken: req.csrfToken() });
  }

  const user = results[0];
  const passwordMatch = await getPw(password, user.password, 1);

  if (!passwordMatch) {
    return res.render('login', { title: 'Login', layout: 'layouts/first', errors: [{ msg: 'Incorrect password' }], csrfToken: req.csrfToken() });
  }

  req.session.authenticated = true;
  res.redirect('/');
};

exports.getRegister = (req, res) => {
  res.render('registration', { title: 'Register', csrfToken: req.csrfToken(), layout: 'layouts/first' });
};

exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('registration', { title: 'Register', layout: 'layouts/first', errors: errors.array(), csrfToken: req.csrfToken() });
  }

  const { fullName, email, password, nik } = req.body;
  const hashedPassword = await hashPw(password);

  await getData('INSERT INTO user (Nama, email, password, nik) VALUES (?, ?, ?, ?)', [fullName, email, hashedPassword, nik]);
  res.redirect('/auth/login');
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
};
