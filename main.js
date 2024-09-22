const {loadContact,findContact,addContact,checkDuplicate,deleteContact,editContact} = require('./utils/contacts.js');
const {getData} = require('./mysql');
const {getPw} = require('./bcrypt');

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { query, validationResult, check } = require('express-validator');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var session = require('express-session');
const app = express();
const path = require('path');
const port = 3000;
const mahasiswa2 = [
  {nama:"bulan",email:"bulan456@gmail.com"},
  {nama:"angin",email:"angin012@gmail.com"}
]
mahasiswa2.forEach((m, i) => {
  console.log(m['nama']);
});

// gunakan ejs
app.set('view engine','ejs');

//third Party MiddleWare
app.use(expressLayouts);


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
//Apllication of Middleware
app.use(cookieParser('secret'));


app.use(session({
  cookie: { 
    maxAge: 600000, // Bisa diperpanjang, misalnya 10 menit
    secure: false,   // Gunakan true jika situs menggunakan HTTPS
    httpOnly: true, // Mencegah akses dari JavaScript
    sameSite: 'strict' // Hanya mengizinkan cookie diakses dari domain yang sama
  },
  secret: 'secret', // Pastikan ini rahasia dan cukup panjang
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());


const authMiddleware = async (req, res, next) => {
  console.log('Authenticated:', req.session.authenticated);
  if (req.session.authenticated) {
      return next();
  } else {
      res.redirect('/login');
  }
};

app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.render('login', {
    title: 'Login Page',
    layout:'layouts/first'
  });
});
app.get('/registration', (req, res) => {
  res.render('registration', {
    title: 'Login Page',
    layout:'layouts/first',
  });
});

app.post('/login/user', [
  check('email').custom(async (value, { req }) => {
    try {
      const results = await getData('SELECT * FROM user');

      // Mengumpulkan semua Promise getPw
      const pwChecks = results
        .filter(r => r.email === req.body.email) // Hanya hasil yang email-nya cocok
        .map(async (r) => {
          // Memeriksa password jika email cocok
          return getPw(req.body.password, r.password, 1);
        });
      
      // Menunggu semua Promise selesai
   
      const pwResults = await Promise.all(pwChecks) ;
  
      // Memeriksa jika ada hasil yang benar
      const anyTrue = pwResults.some((result) => result);

      if (!anyTrue) {
        console.log("pw salaahhhh");
        return Promise.reject("salah PW");
      }

      return true;
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      return Promise.reject("Terjadi kesalahan saat memeriksa password");
    }
  })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('errorrrr');
    res.render('login', {
      title: "Form Add Contact",
      layout: 'layouts/first',
      errors: errors.array()
    });
  } else {
    console.log("PW BENAR");
    req.session.authenticated = true;
   
    res.redirect('/');
    // Lakukan tindakan setelah login berhasil
  }
});

// Rute untuk proses login (simulasi)
app.post('/registration/user',[
  check('email').custom(async (value,{req}) => {
    await getData('SELECT * FROM user').then((result) => {
      console.log("result :");
      result.forEach((r, i) => {
        if (r.email == value ){
          console.log("email ADAAA");
          throw new Error('Email has avaiable');
    
        }else if (req.body.nik === r.nik){
          throw new Error('NIK has been available');
        }
        
        if(req.body.password !== req.body.confirmPassword){
          throw new Error('password tidak sama dengan konfirmasi');

        }
        
        return true;
      });
    });
  
  
}),
  check('email','Bukan email').isEmail() 

],
  
  
  (req, res) => {
    const errors = validationResult(req);
   
  
if(!errors.isEmpty()){
  console.log('errorrrr');
  
  res.render('registration',{
    title:"Form Add Contact",
    layout:'layouts/first',
   
    errors:errors.array()
  })
}
else{
  console.log("INSERT");
  
  const fullName = req.body.fullName;
  


  const nik = req.body.nik; 
  const email = req.body.email;

  const query = "INSERT INTO `user` (`ID`, `Nama`,  `password`, `email`,`nik`, `last_login`) VALUES (NULL, ?, ?, ?, ?, current_timestamp())";
  
  getPw(req.body.password).then(resultz=>{
    const password = resultz;
    const values = [fullName, password, email,nik];
    getData(query, values)
    .then((result) => {
      console.log(result);
      
    })
})
 
  
  res.redirect('/login');
}
  



  
});

app.get('/', authMiddleware, (req, res) => {
  const mahasiswa = [
    { nama: "bulan", email: "bulan456@gmail.com" },
    { nama: "angin", email: "angin012@gmail.com" }
  ];
  res.render('index', {
    layout: 'layouts/main_layout',
    nama: "KevBlod",
    title: "Belajarku",
    mahasiswa
  });
});

app.get('/about',authMiddleware,(req,res) => {

  res.render('about',{layout:'layouts/main_layout',title:"Halaman About"});
});

app.get('/contact',authMiddleware,(req,res) => {
  const contacts = loadContact();
 
 
  res.render('contact',{
    layout:'layouts/main_layout',
    title:"Halaman Contact",
    contacts,
    msg:req.flash('msg'),
  });

});

// Halaman form tambah data
app.get('/contact/add',authMiddleware,(req,res) => {
  res.render('add-contact',{
    title:'Add Data Form',
    layout:'layouts/main_layout',
    contact:[]

  });
});
 //proses data kontak
app.post('/contact',[
    check('nama').custom(async value => {
    const duplicate = await checkDuplicate(value);
    console.log(duplicate);
    if (duplicate){
      throw new Error('Nama Kontak has avaiable');

    }
    return true;
    
  }),
    check('email','Email Not Valid').isEmail(),
    check('no_Hp', 'No Hp Not Valid').isMobilePhone('id-ID')
],(req,res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('add-contact',{
      title:"Form Add Contact",
      layout:'layouts/main_layout',
      errors:errors.array()
    })
  }else{
    console.log(req.body);
    addContact(req.body);
    req.flash('msg','Data Kontact finshed Adding');
    
  
    res.redirect('/contact');

  }
});

app.post('/contact/update',[
  check('nama').custom ((value,{req}) => {
    const duplicate =  checkDuplicate(value);
    console.log(duplicate);
    if (value != req.body.oldName && duplicate){
      throw new Error('Nama Kontak has avaiable');

    }
    return true;
    
  }),
  check('email','Email Not Valid').isEmail(),
  check('no_Hp', 'No Hp Not Valid').isMobilePhone('id-ID')
],(req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('add-contact',{
      title:"Form Add Contact",
      layout:'layouts/main_layout',
      errors:errors.array(),
      contact:[req.body]
    })
  }else{
    editContact(req.body);
    req.flash('msg','Data Kontact finshed Adding');
    
  
    res.redirect('/contact');

  }
  
});





app.get('/contact/delete/:nama',authMiddleware,(req,res) => {
  const result = deleteContact(req.params.nama);

  if(result.length>0){
   
    req.flash('msg','Data Has benn Deleted');
    res.redirect('/contact');

  }else{
    res.status(404);
  res.send('<h1>404</h1>');

  }
});
app.get('/contact/edit/:nama',authMiddleware,(req,res) => {
  const contact = [findContact(req.params.nama)];
 


  res.render('add-contact',{
    title:'Edit Form',
    layout:'layouts/main_layout',
    contact

  });
  
});
app.get('/contact/:nama',authMiddleware,(req,res) => {
  const contact = findContact(req.params.nama);
  

 
 
  res.render('detail',{
    layout:'layouts/main_layout',
    title:"Halaman Detail Contact",
    contact,
  });

});

app.get('/add',authMiddleware,(req,res) => {
 console.log('jddjdk'); 
 res.render('add',{
  layout:'layouts/main_layout'
 });
});

app.use('/',(req,res) => {
  res.status(404);
  res.send('<h1>404</h1>');
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});



