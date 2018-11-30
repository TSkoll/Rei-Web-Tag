const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const config = require('./config.json');
const multerConfig = require('./multer.js');

const session = require('express-session');
const multer = require('multer');
const uploads = multer(multerConfig);

const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const mariadb = require('mariadb');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy(config.discordAuth,
(accessToken, resfreshToken, profile, cb) => {
    process.nextTick(() => {
        return cb(null, profile);
    });
}));

const cors = require('cors');
app.use(cors());

app.use(session(config.sessionAuth));

app.use(passport.initialize());
app.use(passport.session());

app.use('/public', express.static('public'));

/* 
    TAG UPLOAD
*/
const tagUpload = require('./paths/tag/upload');
app.post('/tag/upload', [
    checkAuth,
    uploads.single('fileContent')
], tagUpload);

/*
    TAG UPDATE
*/
const tagUpdate = require('./paths/tag/update');
app.post('/tag/update', [
    checkAuth,
    uploads.single('fileContent')
], tagUpdate);

/*
    TAG DELETE
*/
const tagDelete = require('./paths/tag/delete');
app.get('/tag/delete/:name', checkAuth, tagDelete);

/*
    TAG GET
*/
const tagGet = require('./paths/tag/get');
app.get('/tag/get/:name', checkAuth, tagGet);

/*
    TAG LIST
*/
const tagList = require('./paths/tag/list');
app.get('/tag/list', checkAuth, tagList)

/*
    FILE MIME
*/
const fileMime = require('./paths/file/mime');
app.get('/file/mime/:name', checkAuth, fileMime);

/*
    FILE GET
*/
const fileGet = require('./paths/file/get');
app.get('/file/get/:name', checkAuth , fileGet);


/* 
    GENERAL
*/
app.get('/', (req, res) => {
    if (req.user) 
        res.redirect('/app')
    else
        res.sendFile(__dirname + '/html/offlineindex.html');
});

app.get('/app', checkAuth, (req, res) => {
    res.sendFile(__dirname + '/html/index.html');
})

app.get('/callback',
    passport.authenticate('discord', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect('/');
});

app.get('/logout', checkAuth, (req, res) => {
    req.logout();
    res.redirect('/')
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

function checkAuth(req, res, next) {
    if (req && req.isAuthenticated())
        return next();

    // API Key must be specified either in POST body or in GET query parameter
    const apiKey = (req.query && req.query.k) || null;
    if (apiKey) {
        mariadb.createConnection(config.database)
        .then(conn => {
            conn.query("SELECT * FROM apikey WHERE apikey.key=?",
            [ apiKey ])
            .then(rows => {
                if (rows.length > 0) {
                    req.apiKey = rows[0].key;
                    return next();
                }
            })
        });
    } else {
        res.send("Not authenticated!");
    }
}