const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const { query, validationResult, check } = require('express-validator');
const { loadContact, findContact, addContact, checkDuplicate, deleteContact, editContact } = require('./utils/contacts.js');
const { getData } = require('./mysql');
const { getPw } = require('./bcrypt');
const { fetchAllData, addData, deleteData } = require('./proxy.js');

const app = express();
const port = 3000;

// Middleware setup
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(
  session({
    httpOnly: true,
    cookie: { maxAge: 600000000 },
    secret: 'secret',
    resave: false,
    secure: true,
    saveUninitialized: true,
    sameSite: 'none',
  })
);
app.use(flash());

// Authentication middleware
const authMiddleware = (req, res, next) => {
  if (req.session.authenticated) {
    return next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login Page', layout: 'layouts/first' });
});

app.get('/registration', (req, res) => {
  res.render('registration', { title: 'Registration Page', layout: 'layouts/first' });
});
app.get('/logout', (req, res) => {
  req.session.authenticated = false;
  return res.redirect('/login');
});

app.post(
  '/login/user',
  [
    check('email').custom(async (value, { req }) => {
      try {
        const results = await getData('SELECT * FROM user');
        const pwChecks = results.filter((r) => r.email === req.body.email).map(async (r) => getPw(req.body.password, r.password, 1));
        const pwResults = await Promise.all(pwChecks);
        const anyTrue = pwResults.some((result) => result);
        if (!anyTrue) {
          console.log('Invalid password');
          return Promise.reject('Invalid password');
        }
        return true;
      } catch (error) {
        console.error('Error checking password:', error);
        return Promise.reject('Error checking password');
      }
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login errors:', errors.array());
      res.render('login', { title: 'Login Page', layout: 'layouts/first', errors: errors.array() });
    } else {
      console.log('Login successful');
      req.session.authenticated = true;
      res.redirect('/');
    }
  }
);

app.post(
  '/registration/user',
  [
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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Registration errors:', errors.array());
      res.render('registration', { title: 'Registration Page', layout: 'layouts/first', errors: errors.array() });
    } else {
      console.log('Registration successful');
      const password = await getPw(req.body.password);
      const query = 'INSERT INTO `user` (`ID`, `Nama`, `password`, `email`, `nik`, `last_login`) VALUES (NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP())';
      await getData(query, [req.body.fullName, password, req.body.email, req.body.nik]);
      res.redirect('/login');
    }
  }
);

app.get('/', authMiddleware, (req, res) => {
  const mahasiswa = [
    { nama: 'bulan', email: 'bulan456@gmail.com' },
    { nama: 'angin', email: 'angin012@gmail.com' },
  ];
  res.render('index', { layout: 'layouts/main_layout', nama: 'KevBlod', title: 'Belajarku', mahasiswa });
});

app.get('/about', authMiddleware, (req, res) => {
  res.render('about', { layout: 'layouts/main_layout', title: 'About Page' });
});

app.get('/contact', authMiddleware, async (req, res) => {
  const contacts = await fetchAllData();
  res.render('contact', { layout: 'layouts/main_layout', title: 'Contact Page', contacts, msg: req.flash('msg') });
});

app.get('/contact/add', authMiddleware, (req, res) => {
  res.render('add-contact', { title: 'Add Contact Form', layout: 'layouts/main_layout', contact: [] });
});

app.post(
  '/contact',
  [
    check('email').custom(async (value) => {
      const contacts = await fetchAllData({ email: value });
      if (contacts.length > 0) throw new Error('Contact already exists');
      return true;
    }),
    check('email', 'Invalid email').isEmail(),
    check('no_Hp', 'Invalid phone number').isMobilePhone('id-ID'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', { title: 'Add Contact Form', layout: 'layouts/main_layout', errors: errors.array(), contact: [] });
    } else {
      await addData([req.body], 0);
      req.flash('msg', 'Contact added successfully');
      res.redirect('/contact');
    }
  }
);

app.post(
  '/contact/update',
  [
    check('email').custom(async (value, { req }) => {
      const contacts = await fetchAllData({ email: value });
      if (value !== req.body.oldEmail && contacts.length > 0) throw new Error('Contact already exists');
      return true;
    }),
    check('email', 'Invalid email').isEmail(),
    check('no_Hp', 'Invalid phone number').isMobilePhone('id-ID'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', { title: 'Edit Contact Form', layout: 'layouts/main_layout', errors: errors.array(), contact: [req.body] });
    } else {
      await addData(req.body, 1);
      req.flash('msg', 'Contact updated successfully');
      res.redirect('/contact');
    }
  }
);

app.get('/contact/delete/:id', authMiddleware, async (req, res) => {
  const deleted = await deleteData(req.params.id);
  if (deleted) {
    req.flash('msg', 'Contact deleted successfully');
    res.redirect('/contact');
  } else {
    res.status(404).send('<h1>404 Not Found</h1>');
  }
});

app.get('/contact/edit/:id', authMiddleware, async (req, res) => {
  const contact = await fetchAllData({ _id: req.params.id });
  res.render('add-contact', { title: 'Edit Contact Form', layout: 'layouts/main_layout', contact });
});

app.get('/contact/:id', authMiddleware, async (req, res) => {
  const contact = await fetchAllData({ _id: req.params.id });
  res.render('detail', { layout: 'layouts/main_layout', title: 'Contact Details', contact: contact[0] });
});

app.get('/add', authMiddleware, (req, res) => {
  res.render('add', { layout: 'layouts/main_layout' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
