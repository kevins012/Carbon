const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { query, validationResult, check } = require('express-validator');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');

const { loadContact, findContact, addContact, checkDuplicate, deleteContact, editContact } = require('./utils/contacts.js');
const { getData } = require('./mysql');
const { getPw } = require('./bcrypt');

const app = express();
const port = 3000;

// Menggunakan ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(session({
  cookie: { maxAge: null },
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  rolling: true
}));
app.use(flash());

// Middleware autentikasi
const authMiddleware = (req, res, next) => {
    console.log('Sesi:', req.session); // Tambahkan log untuk memeriksa sesi
    if (req.session.authenticated) {
      return next();
    }
    res.redirect('/login');
  };

// Rute
app.get('/login', (req, res) => {
  req.session.authenticated ? res.redirect('/') : res.render('login', { title: 'Login Page', layout: 'layouts/first' });
});

app.get('/registration', (req, res) => res.render('registration', { title: 'Registration Page', layout: 'layouts/first' }));

app.post('/login/user', [
  check('email').custom(async (value, { req }) => {
    const users = await getData('SELECT * FROM user');
    const valid = users.some(async (user) => user.email === req.body.email && await getPw(req.body.password, user.password, 1));
    if (!valid) throw new Error("Invalid password");
    return true;
  })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('login', { title: "Login Page", layout: 'layouts/first', errors: errors.array() });
  } else {
    req.session.authenticated = true;
    res.redirect('/');
  }
});

app.post('/registration/user', [
  check('email').custom(async (value, { req }) => {
    const users = await getData('SELECT * FROM user');
    if (users.some(user => user.email === value)) throw new Error('Email already exists');
    if (req.body.nik && users.some(user => user.nik === req.body.nik)) throw new Error('NIK already exists');
    if (req.body.password !== req.body.confirmPassword) throw new Error('Passwords do not match');
    return true;
  }),
  check('email', 'Invalid email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('registration', { title: "Registration Page", layout: 'layouts/first', errors: errors.array() });
  } else {
    const { fullName, nik, email, password } = req.body;
    const hashedPassword = await getPw(password);
    await getData("INSERT INTO user (Nama, password, email, nik, last_login) VALUES (?, ?, ?, ?, current_timestamp())", [fullName, hashedPassword, email, nik]);
    res.redirect('/login');
  }
});

app.get('/', authMiddleware, (req, res) => {
  const mahasiswa = [
    { nama: "bulan", email: "bulan456@gmail.com" },
    { nama: "angin", email: "angin012@gmail.com" }
  ];
  res.render('index', { layout: 'layouts/main_layout', nama: "KevBlod", title: "Belajarku", mahasiswa });
});

app.get('/about', authMiddleware, (req, res) => res.render('about', { layout: 'layouts/main_layout', title: "About Page" }));

app.get('/contact', authMiddleware, (req, res) => {
    
  res.render('contact', {
    layout: 'layouts/main_layout',
    title: "Contact Page",
    contacts: loadContact(),
    msg: req.flash('msg'),
  });
});

app.get('/contact/add', authMiddleware, (req, res) => res.render('add-contact', { title: 'Add Contact', layout: 'layouts/main_layout' }));

app.post('/contact', [
  check('nama').custom(async (value) => {
    if (await checkDuplicate(value)) throw new Error('Contact name already exists');
    return true;
  }),
  check('email', 'Invalid email').isEmail(),
  check('no_Hp', 'Invalid phone number').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('add-contact', { title: "Add Contact", layout: 'layouts/main_layout', errors: errors.array() });
  } else {
    addContact(req.body);
    req.flash('msg', 'Contact added');
    res.redirect('/contact');
  }
});

app.post('/contact/update', [
  check('nama').custom(async (value, { req }) => {
    if (value !== req.body.oldName && await checkDuplicate(value)) throw new Error('Contact name already exists');
    return true;
  }),
  check('email', 'Invalid email').isEmail(),
  check('no_Hp', 'Invalid phone number').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('add-contact', { title: "Edit Contact", layout: 'layouts/main_layout', errors: errors.array(), contact: [req.body] });
  } else {
    editContact(req.body);
    req.flash('msg', 'Contact updated');
    res.redirect('/contact');
  }
});

app.get('/contact/delete/:nama', authMiddleware, (req, res) => {
  const result = deleteContact(req.params.nama);
  if (result.length > 0) {
    
    req.flash('msg', 'Contact deleted');
    
    res.render('contact', {
        layout: 'layouts/main_layout',
        title: "Contact Page",
        contacts: loadContact(),
        msg: req.flash('msg'),
      });
  } else {
    res.status(404).send('<h1>404</h1>');
  }
});

app.get('/contact/edit/:nama', authMiddleware, (req, res) => {
  res.render('add-contact', { title: 'Edit Contact', layout: 'layouts/main_layout', contact: [findContact(req.params.nama)] });
});

app.get('/contact/:nama', authMiddleware, (req, res) => {
  res.render('detail', { layout: 'layouts/main_layout', title: "Contact Detail", contact: findContact(req.params.nama) });
});

app.get('/add', authMiddleware, (req, res) => res.render('add', { layout: 'layouts/main_layout' }));

app.use((req, res) => res.status(404).send('<h1>404</h1>'));

app.listen(port, () => console.log(`Server running on port ${port}`));
