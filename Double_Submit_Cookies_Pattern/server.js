//required npm modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuid = require('uuid/v4');
var path = require('path');
var cookieParser = require('cookie-parser');

const port = 3000;

const app = express();

var parseForm = bodyParser.urlencoded({ extended: false });

app.use(session({
    genid: (req) => {
        return uuid(); //using UUID library for defining session id
    },
    name: 'SESSION_ID',
    secret: ';uQGze+#8>sr4"/b',
    resave: false,
    saveUninitialized: true
}));

//changed parts from normal synchronizer  token pattern
// initialize cookieParser middleware
app.use(cookieParser());

// set a cookie if not set already
app.use(function (req, res, next) {
    // check if received cookie
    var csrfCookie = req.cookies._csrf;
    if (csrfCookie === undefined)
    {
        // generate csrf token
        var csrfToken = uuid();

        //set csrf cookie
        res.cookie('_csrf',csrfToken, { maxAge: 900000, httpOnly: false });
        console.log('csrf cookie created!');
    }
    next();
});

//route to index.html upon loading
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// The endpoint receives the session cookie and based on the session identifier return the CSRF token value.
app.post('/middleware', parseForm, function (req, res) {
    var token = req.session.csrfToken; //middleware token
    res.json({ csrfToken: token });
});

app.post('/login', parseForm, function (req, res, next) {
    //check password and username matches just for testing.
    //if((req.body.username == 'vimukthim') && (req.body.password == 'ssd_1234'))
    if(true)
    {
        //console.log('username and password is correct');
        if(req.cookies._csrf !== req.body._csrf) {
            console.log('Invalid CSRF Token!');
            let err = new Error('Invalid CSRF Token!');
            err.status = 403;
            return next(err);
        }
        res.send(`<h1>Login Success ${req.body.username} </h1> <h5>Received CSRF token is valid</h5>`);
    }
    else {
        res.send(`<h1>Invalid Username or Password </h1>`);
    }

});

//print on console that the server is listening on port 3000
app.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});