/*
    GET /tag/list

    Returns a list of tag names user has created.
*/

const mariadb = require('mariadb');
const config = require('../../config.json');

module.exports = function(req, res) {
    mariadb.createConnection(config.database)
    .then(conn => {
        conn.query("SELECT name FROM tag WHERE userid=?",
        [ req.user.id ])
        .then(rows => {
            conn.destroy();

            res.send(rows.map(x => x.name));
        });
    });
}