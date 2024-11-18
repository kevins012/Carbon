// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const flash = require('connect-flash');
// const session = require('express-session');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const app = express();
// const port = 3000;

// // Middleware setup
// app.use(express.static(path.join(__dirname))); // Serve static files from the root directory
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser('secret'));
// app.use(
//   session({
//     httpOnly: true,
//     cookie: { maxAge: 600000000 },
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: true,
//   }).
// );
// app.use(flash());
const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) =>{
    const  authorization = req.cookies.token;
    console.log(authorization);
    console.log('-----------');
  
   
    try {
        const secret =  req.body.jwt ? req.body.jwt : process.env.JWT_SECRET_KEY; 
        const decoded = jwt.verify(authorization, secret);
        console.log('++++++++++++++++');
        console.log(decoded);
        req.user = decoded; // Store the decoded user info in the request object
        next();
    } catch (error) {
        console.log("Thanks");
        return res.redirect('/login'); // Redirect to login if token is invalid
    }
}

const generate = (id ,user,role) => {
    const payload = {
        id,

   
        username: user,
        role
    };

    const options = {
        expiresIn: '1h',  // Token will expire in 1 hour
        algorithm: 'HS256',
        issuer: 'my_app',
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, options);
    return token;
};

module.exports = {verifyToken,generate,jwt};
// app.get('/login', (req, res) => {
//     const  authorization = req.cookies.token;
//     try {
//         const decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
//         console.log('++++++++++++++++');
//         console.log(decoded);
//         req.user = decoded; // Store the decoded user info in the request object
//         res.redirect('/')
//     } catch (error) {
//         console.log("Thanks");
//         res.sendFile(path.join(__dirname, 'login.html'));// Redirect to login if token is invalid
//     }
//     // Serve login.html directly
// });
// // Route to serve login.html
// app.get('/', verifyToken, (req, res) => {
//     res.send(`Hallo Dunia, ${req.user.username}`); // Greet user by username
// });

// app.post('/login/user', (req, res) => {
   
//     if (req.body.username === 'admin' && req.body.password === 'admin') {
//         const token = generate(req.body); // Generate token
      

//         // Set token in cookie
//         res.cookie('token', token, { maxAge: 900000,httpOnly: true, secure: false }); // Use secure: true in production
//         return res.redirect('/'); // Redirect to root after successful login
//     } else {
//         res.status(401).send('Invalid credentials'); // Send error response for invalid login
//     }
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).send('<h1>404 Not Found</h1>');
// });

// app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
// });

// (async () => {
//     try {
//         // Membaca kunci privat dari file
//         var privateKey = await fs.readFile('privateKey.key', 'utf8');

//         // Membuat token JWT
//         jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' }, function(err, token) {
//             if (err) {
//                 console.error('Error signing token:', err);
//             } else {
//                 console.log("----------");
//                 console.log('Generated Token:', token);
//             }
//         });
//     } catch (error) {
//         console.error('Error reading private key:', error);
//     }
// })();

// older_token = jwt.sign({
//     exp: Math.floor(Date.now() / 1000) + (60 * 60),
//     data: 'foobar'
//   }, 'secret');
// console.log(Date.now());
// console.log((Date.now() / 1000) + (60 * 60));
// console.log(older_token);

// var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
// // verify a token symmetric - synchronous
// var decoded = jwt.verify(token, 'shhhhh');
// console.log(decoded) // bar

// // verify a token symmetric
// jwt.verify(token, 'shhhhh', function(err, decoded) {
//   console.log(decoded.foo) // bar
// });

// // invalid token - synchronous
// try {
//   var decoded = jwt.verify(token, 'wrong-secret');
// } catch(err) {
//   // err
// }

// // invalid token
// jwt.verify(token, 'wrong-secret', function(err, decoded) {
//   // err
//   // decoded undefined
// });

// // verify a token asymmetric
// var cert = fs.readFileSync('public.pem');  // get public key
// jwt.verify(token, cert, function(err, decoded) {
//   console.log(decoded.foo) // bar
// });

// // verify audience
// var cert = fs.readFileSync('public.pem');  // get public key
// jwt.verify(token, cert, { audience: 'urn:foo' }, function(err, decoded) {
//   // if audience mismatch, err == invalid audience
// });

// // verify issuer
// var cert = fs.readFileSync('public.pem');  // get public key
// jwt.verify(token, cert, { audience: 'urn:foo', issuer: 'urn:issuer' }, function(err, decoded) {
//   // if issuer mismatch, err == invalid issuer
// });

// // verify jwt id
// var cert = fs.readFileSync('public.pem');  // get public key
// jwt.verify(token, cert, { audience: 'urn:foo', issuer: 'urn:issuer', jwtid: 'jwtid' }, function(err, decoded) {
//   // if jwt id mismatch, err == invalid jwt id
// });

// // verify subject
// var cert = fs.readFileSync('public.pem');  // get public key
// jwt.verify(token, cert, { audience: 'urn:foo', issuer: 'urn:issuer', jwtid: 'jwtid', subject: 'subject' }, function(err, decoded) {
//   // if subject mismatch, err == invalid subject
// });

// // alg mismatch
// var cert = fs.readFileSync('public.pem'); // get public key
// jwt.verify(token, cert, { algorithms: ['RS256'] }, function (err, payload) {
//   // if token alg != RS256,  err == invalid signature
// });

// // Verify using getKey callback
// // Example uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
// var jwksClient = require('jwks-rsa');
// var client = jwksClient({
//   jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json'
// });
// function getKey(header, callback){
//   client.getSigningKey(header.kid, function(err, key) {
//     var signingKey = key.publicKey || key.rsaPublicKey;
//     callback(null, signingKey);
//   });
// }

// jwt.verify(token, getKey, options, function(err, decoded) {
//   console.log(decoded.foo) // bar
// });
// 