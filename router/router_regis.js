



app.get('/registration', (req, res) => {
    res.render('registration', { title: 'Registration Page', layout: 'layouts/first' });
  });

  
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
  