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
        const userid = (req.apiKey) ? req.query.u || req.body.u : req.user.id;

        conn.query("SELECT name FROM tag WHERE userid=? AND name=?",
        [ userid, req.body.tagName ])
        .then(rows => {
            if (rows.length > 0) {
                conn.destroy();
                res.send('Tag name overlaps with a pre-existing tag!');
            } else {
                conn.query("INSERT INTO tag VALUES (null, ?, ?, ?, ?)",
                [   req.body.tagName, 
                    userid, 
                    (!req.body.tagContent || req.body.tagContent == '') ? null : req.body.tagContent,
                    (req.file) ? req.file.filename : null
                ]).then(() => {
                    conn.destroy();

                    res.send(200);
                }).catch(err => {
                    if (conn)
                        conn.destroy();

                    res.send(err.code);
                });
            }
        })
    });
}