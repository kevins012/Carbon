// app.js
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./router/auth_router');
const contactRoutes = require('./router/router');
const vehicleRoutes = require('./router/router_vehicle')
const analysisRoutes = require('./router/router_analysis')
const app = express();
const port = 3000;

// Middleware setup
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(session({
    httpOnly: true,
    cookie: { maxAge: 600000000 },
    secret: 'secret',
    resave: false,
    secure: true,
    saveUninitialized: true,
    sameSite: 'none',
}));
app.use(flash());

// Routes
app.use('/', authRoutes);
app.use('/contact', contactRoutes);
app.use('/vehicle',vehicleRoutes)
app.use('/analysis',analysisRoutes)
// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { title: '404 Not Found' });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
