/* 
    POST /tag/upload

    Creates a new tag for a specified user with data
    specified in request body.

    Disallow creation if tag name overlaps with a pre-existing
    tag user has created.
*/

const mariadb = require('mariadb');
const config = require('../../config.json');

module.exports = function(req, res) {
    mariadb.createConnection(config.database)
    .then(conn => {
        conn.query("SELECT name FROM tag WHERE userid=? AND name=?",
        [ req.user.id, req.body.tagName ])
        .then(rows => {
            if (rows.length > 0) {
                conn.destroy();
                res.send('Tag name overlaps with a pre-existing tag!');
            } else {
                conn.query("INSERT INTO tag VALUES (null, ?, ?, ?, ?)",
                [   req.body.tagName, 
                    req.user.id, 
                    (req.body.tagContent == '') ? null : req.body.tagContent,
                    (req.file) ? req.file.filename : null
                ]).then(() => {
                    conn.destroy();

                    res.send(200);
                }).catch(err => {
                    conn.destroy();

                    res.send(err);
                });
            }
        })
    });
}