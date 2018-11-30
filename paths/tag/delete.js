/*
    GET /tag/delete/:name

    Removes all records of a tag specified in the name parameter
    from a specified user.
*/

const mariadb = require('mariadb');
const fs = require('fs');
const config = require('../../config.json');

module.exports = function(req, res) {
    mariadb.createConnection(config.database)
    .then(conn => {
        conn.query("SELECT id, name, userid, content, file FROM tag WHERE name=? AND userid=?",
        [ req.params.name, req.user.id ])
        .then(rows => {
            const data = rows[0];

            if (data.file) {
                try {
                    fs.unlinkSync(__dirname + '/tags/' + data.file);
                } catch (err) {
                    console.error(`Failed to delete file ${data.file}`);
                }
            }
    
            conn.query("DELETE FROM tag WHERE id=?", [ data.id ])
            .then(() => {
                conn.destroy();
                res.send(200);
            })
            .catch(err => {
                conn.destroy();
                res.send(err);
            });
        });
    });
}