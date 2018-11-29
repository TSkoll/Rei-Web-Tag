const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const mime = require('mime-types');
const fs = require('fs');

const config = require('./config.json');
const multerConfig = require('./multer.js');

const session = require('express-session');
const multer = require('multer');
const uploads = multer(multerConfig);

const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const mariadb = require('mariadb');

/*

TODO:
    - Overlap checks (discord user id & name)
    - File size check (client)
    - Bot authentication path (allow api key in checkAuth)

*/

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
    })
}));

const cors = require('cors');
app.use(cors());

app.use(session(config.sessionAuth));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    if (req.user) {
        res.sendFile(__dirname + '/html/index.html');
    } else {
        res.sendFile(__dirname + '/html/offlineindex.html');
    }
})

app.use('/public', express.static('public'));

app.get('/callback',
    passport.authenticate('discord', {failureRedirect: '/'}),
    (req, res) => {
    res.redirect('/');
});

app.post('/tag/upload', [
    checkAuth,
    uploads.single('fileContent')
], (req, res) => {
    mariadb.createConnection(config.database)
    .then(async conn => {
        conn.query("INSERT INTO tag VALUES (null, ?, ?, ?, ?)",
        [   req.body.tagName, 
            req.user.id, 
            (req.body.tagContent == '') ? null : req.body.tagContent,
            (req.file) ? req.file.filename : null
        ]);
        await conn.destroy();

        res.send(200);
    });
});

app.post('/tag/update', [
    checkAuth,
    uploads.single('fileContent')
], (req, res) => {
    mariadb.createConnection(config.database)
    .then(conn => {
        conn.query("SELECT id, name, userid, content, file FROM tag WHERE name=? AND userid=?",
        [ req.body.name, req.user.id ])
        .then(rows => {
            let oldData = rows[0];

            conn.query("UPDATE tag SET content=?, file=? WHERE id=?", [
                (req.body.content == '') ? null : req.body.content,
                (req.file) ? req.file.filename : oldData.file,
                oldData.id
            ]).then(upd => {
                if (oldData.file && req.file)
                    fs.unlink(__dirname + '/tags/' + oldData.file);

                conn.destroy();
                res.send(200);
            });
        });
    });
});

app.get('/tag/delete/:name', checkAuth, (req, res) => {
    mariadb.createConnection(config.database)
    .then(conn => {
        conn.query("SELECT id, name, userid, content, file FROM tag WHERE name=? AND userid=?", [ req.params.name, req.user.id ])
        .then(rows => {
            const data = rows[0];

            if (data.file)
                fs.unlink(__dirname + '/tags/' + data.file);
    
            conn.query("DELETE FROM tag WHERE id=?", [ data.id ])
            .then(() => {
                conn.destroy();

                console.log(200);
                res.send(200);
            });
        });
    });
});

app.get('/tag/get/:name', checkAuth, (req, res) => {
    mariadb.createConnection(config.database)
    .then(async conn => {
        const row = await conn.query("SELECT name, content, file FROM tag WHERE userid=? AND name=?", [ req.user.id, req.params.name ]);
        await conn.destroy();

        res.send(row[0]);
    });
});

app.get('/file/mime/:name', checkAuth, (req, res) => {
    const type = mime.lookup(req.params.name);
    if (type)
        res.send(type);
    else
        res.send("unknown");
});

app.get('/file/get/:name', checkAuth , (req, res) => {
    res.sendFile(__dirname + '/tags/' + req.params.name);
});

app.get('/tag/list/', checkAuth, (req, res) => {
    mariadb.createConnection(config.database)
    .then(async conn => {
        const row = await conn.query("SELECT name FROM tag WHERE userid=?",  [ req.user.id ]);
        await conn.destroy();

        res.send(row.map(x => x.name));
    });
})

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
    else
        res.send(401, 'Not logged in!');
}