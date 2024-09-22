// Fungsi simulasi asinkron untuk memproses angka
function processNumber(num) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(num + 5); // Menambahkan 5 ke angka
      }, 300); // Simulasi delay 0.3 detik
    });
  }
  function processr(num) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Menambahkan 5 ke angka
      }, 300); // Simulasi delay 0.3 detik
    });
  }
  
  // Fungsi utama untuk memproses dan memeriksa angka
  async function processNumbers(values, threshold) {
    try {
      // Membuat array dari Promise untuk memproses angka
      const processedNumbers = values
        .filter(num => num > threshold) // Filter angka yang lebih besar dari threshold
        .map(num => processr(num)); // Proses setiap angka
        const numbers = [5, 8, 12, 20];
console.log(processedNumbers);
        console.log(await Promise.all(numbers.map(num => processr(num))));
        console.log(await Promise.all(numbers.filter(num => num > threshold)));
      // Menunggu semua Promise selesai
      const results = await Promise.all(processedNumbers);
  console.log(results);
      // Memeriksa jika ada hasil yang lebih besar dari threshold setelah diproses
      const anyAboveThreshold = results.some(result => result > threshold + 5);
  
      if (anyAboveThreshold) {
        console.log("Ada angka yang memenuhi kriteria!");
        return true;
      } else {
        console.log("Tidak ada angka yang memenuhi kriteria.");
        return false;
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      return false;
    }
  }
  
//   // Contoh penggunaan
//   (async () => {
//     const numbers = [5, 8, 12, 20];
//     const threshold = 7;
  
//     const result = await processNumbers(numbers, threshold);
//     console.log("Hasil:", result); // Output: Ada angka yang memenuhi kriteria! atau Tidak ada angka yang memenuhi kriteria.
//   })();
  

const results = [
    { email: "user1@example.com", password: "password1" },
    { email: "user2@example.com", password: "password2" },
    { email: "user1@example.com", password: "password3" }
];
const pwChecks = results
    .filter(r => r.email === req.body.email) // Hanya hasil yang email-nya cocok
    .map(async (r) => {
      // Memeriksa password jika email cocok
      return getPw(req.body.password, r.password, 1);
    });

// Menggunakan Promise.all untuk menyelesaikan semua promises
const resolvedPwChecks = await Promise.all(pwChecks);

console.log(resolvedPwChecks); // Ini akan berisi true/false dari getPw

// const express = require('express');
// const session = require('express-session');
// const cookieParser = require('cookie-parser');
// const readline = require('readline');

// const app = express();
// const port = 3000;

// // Setup readline
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// // Setup middleware
// app.use(cookieParser());
// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false } // Set to true if using HTTPS
// }));

// // Fungsi untuk menanyakan pertanyaan autentikasi
// function askQuestion(query) {
//     return new Promise((resolve, reject) => {
//         rl.question(query, (answer) => {
//             resolve(answer);
//         });
//     });
// }

// // Middleware autentikasi
// const authMiddleware = async (req, res, next) => {
//     if (req.session.authenticated) {
//         return next();
//     } else {
//         res.redirect('/');
//     }
// };

// // Route untuk halaman utama
// app.get('/', async (req, res) => {
//     if (req.session.authenticated) {
//         return res.redirect('/home');
//     }

//     try {
//         const answer1 = await askQuestion('Siapa Mulyono? ');
//         const answer2 = await askQuestion('Apa kabar? ');

//         rl.close();

//         if (answer1 === 'a' && answer2 === 'ba') {
//             req.session.authenticated = true;
//             res.redirect('/home');
//         } else {
//             res.send(`
//                 <html>
//                     <head>
//                         <title>Login</title>
//                     </head>
//                     <body>
//                         <h1>Jawaban Salah!</h1>
//                         <p>Silakan coba lagi dengan menjawab pertanyaan dengan benar.</p>
//                     </body>
//                 </html>
//             `);
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Terjadi kesalahan saat mengambil jawaban.');
//     }
// });

// // Route untuk halaman home yang dilindungi
// app.get('/home', authMiddleware, (req, res) => {
//     res.send(`
//         <html>
//             <head>
//                 <title>Home</title>
//             </head>
//             <body>
//                 <h1>Selamat datang di Home Page</h1>
//                 <p>Ini adalah halaman yang dilindungi.</p>
//                 <a href="/about">Go to About Page</a>
//             </body>
//         </html>
//     `);
// });

// // Route untuk halaman about yang dilindungi
// app.get('/about', authMiddleware, (req, res) => {
//     res.send(`
//         <html>
//             <head>
//                 <title>About</title>
//             </head>
//             <body>
//                 <h1>Selamat datang di About Page</h1>
//                 <p>Ini adalah halaman yang dilindungi.</p>
//                 <a href="/home">Go to Home Page</a>
//             </body>
//         </html>
//     `);
// });

// // Menjalankan server
// app.listen(port, () => {
//     console.log(`Server listening at http://localhost:${port}`);
// });


  // app.get('/', function (req, res, next) {
  //   // Update views
  //   req.session.views = (req.session.views || 0) + 1
  
  //   // Send HTML response
  //   res.send(`
  //     <html>
  //       <head>
  //         <title>Session Views</title>
  //       </head>
  //       <body>
  //         <h1>You have visited this page ${req.session.views} times</h1>
  //       </body>
  //     </html>
  //   `)
  // })
  
  // app.listen(3000)
  

  // Contoh data pengguna
// const users = [
//     { email: "user1@example.com", password: "password123" },
//     { email: "user2@example.com", password: "mypassword" },
//     { email: "user1@example.com", password: "password456" },
// ];

// // Fungsi asynchronous untuk memeriksa password (misalkan ini seperti hashing)
// async function checkPassword(inputPassword, storedPassword) {
//     return new Promise((resolve) => {
//         // Simulasi delay seperti hashing (500ms)
//         setTimeout(() => {
//             // Return true jika password cocok, false jika tidak
//             resolve(inputPassword === storedPassword);
//         }, 500);
//     });
// }

// // Fungsi utama untuk memeriksa password untuk semua pengguna dengan email tertentu
// async function checkUserPasswords(emailToCheck, passwordInput) {
//     // Filter pengguna berdasarkan email yang cocok
//     const filteredUsers = users.filter(user => user.email === emailToCheck);

//     // Map untuk memeriksa password secara asynchronous
//     const pwChecks = filteredUsers.map(async (user) => {
//         // Memanggil checkPassword untuk memeriksa setiap password
//         return checkPassword(passwordInput, user.password);
//     });

//     // Menggunakan Promise.all untuk menunggu semua pemeriksaan password selesai
//     const results = await Promise.all(pwChecks);

//     // Menampilkan hasil (true/false untuk setiap pengguna dengan email yang cocok)
//     console.log(`Hasil pemeriksaan password untuk email ${emailToCheck}:`, results);

//     return results;
// }

// // Contoh pemanggilan fungsi
// checkUserPasswords("user1@example.com", "password123").then((result) => {
//     console.log('Semua password cocok?', result.every(r => r)); // Apakah semua password cocok?
// });
