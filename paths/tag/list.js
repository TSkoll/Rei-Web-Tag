/*
    GET /tag/list

    Returns a list of tag names user has created.
*/

const mariadb = require('mariadb');
const config = require('../../config.json');

module.exports = function(req, res) {
    mariadb.createConnection(config.database)
    .then(conn => {
        const userid = (req.apiKey) ? req.query.u : req.user.id;

        conn.query("SELECT name FROM tag WHERE userid=?",
        [ userid ])
        .then(rows => {
            conn.destroy();

            res.send(rows.map(x => x.name));
        })
        .catch(err => {
            if (conn)
                conn.destroy();

            res.send(err.code);
        });
    });
}