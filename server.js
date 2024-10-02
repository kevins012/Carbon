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

require('dotenv').config();
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

const {verifyToken,generate,jwt} = require('./jwt.js')

// Routes
app.get('/login', (req, res) => {
  const  authorization = req.cookies.token;
  console.log(authorization);
  try {
      const decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        console.log('++++++++++++++++');
        console.log(decoded);
        req.user = decoded; // Store the decoded user info in the request object
        res.redirect('/')
    } catch (error) {
        console.log("Thanks");
        res.render('login', { title: 'Login Page', layout: 'layouts/first' });// Redirect to login if token is invalid
    }
  
});

app.get('/registration', (req, res) => {
  res.render('registration', { title: 'Registration Page', layout: 'layouts/first' });
});
app.get('/logout', (req, res) => {
  res.clearCookie("token");
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
      
      const token = generate(req.body.email)
      res.cookie('token', token, { maxAge: 900000,httpOnly: true, secure: false });
      
      
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

app.get('/', verifyToken, (req, res) => {
  const mahasiswa = [
    { nama: 'bulan', email: 'bulan456@gmail.com' },
    { nama: 'angin', email: 'angin012@gmail.com' },
  ];
  res.render('index', { layout: 'layouts/main_layout', nama: 'KevBlod', title: 'Belajarku', mahasiswa });
});

app.get('/about', verifyToken, (req, res) => {
  res.render('about', { layout: 'layouts/main_layout', title: 'About Page' });
});

app.get('/contact', verifyToken, async (req, res) => {
  const contacts = await fetchAllData();
  res.render('contact', { layout: 'layouts/main_layout', title: 'Contact Page', contacts, msg: req.flash('msg') });
});

app.get('/contact/add', verifyToken, (req, res) => {
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

app.get('/contact/delete/:id', verifyToken, async (req, res) => {
  const deleted = await deleteData(req.params.id);
  if (deleted) {
    req.flash('msg', 'Contact deleted successfully');
    res.redirect('/contact');
  } else {
    res.status(404).send('<h1>404 Not Found</h1>');
  }
});

app.get('/contact/edit/:id', verifyToken, async (req, res) => {
  const contact = await fetchAllData({ _id: req.params.id });
  res.render('add-contact', { title: 'Edit Contact Form', layout: 'layouts/main_layout', contact });
});

app.get('/contact/:id', verifyToken, async (req, res) => {
  const contact = await fetchAllData({ _id: req.params.id });
  res.render('detail', { layout: 'layouts/main_layout', title: 'Contact Details', contact: contact[0] });
});

app.get('/add', verifyToken, (req, res) => {
  res.render('add', { layout: 'layouts/main_layout' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
