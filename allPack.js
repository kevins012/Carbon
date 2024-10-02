

const modules = ()=>{
    const express = require('express');
    const expressLayouts = require('express-ejs-layouts');
    const path = require('path');
    const cookieParser = require('cookie-parser');
    const flash = require('connect-flash');
    const session = require('express-session');
    const { query, validationResult, check } = require('express-validator');
    const { loadContact, findContact, addContact, checkDuplicate, deleteContact, editContact } = require('./utils/contacts.js');
    
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
    
}
const other_module = ()=>{

    const { getData } = require('./mysql');
    const { getPw } = require('./bcrypt');
    const { fetchAllData, addData, deleteData } = require('./proxy.js');
}
module.exports = {modules}