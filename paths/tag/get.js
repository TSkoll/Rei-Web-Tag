/* 
    GET /tag/get/:name

    Looks for a database record of the specified tag with a name from
    a user.
*/

const mariadb = require('mariadb');
const config = require('../../config.json');

module.exports = function(req, res) {
    mariadb.createConnection(config.database)
    .then(conn => {
        const userid = (req.apiKey) ? req.query.u || req.body.u : req.user.id;

        conn.query("SELECT name, content, file FROM tag WHERE userid=? AND name=?",
        [ userid, req.params.name ])
        .then(rows => {
            conn.destroy();

            res.send(rows[0]);
        })
        .catch(err => {
            if (conn)
                conn.destroy();

            res.send(err.code);
        });
    });
}