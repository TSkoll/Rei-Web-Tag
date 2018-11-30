/* 
    POST /tag/update

    Updates a pre-existing tag with new data.
*/

const mariadb = require('mariadb');
const config = require('../../config.json');

const fs = require('fs');

module.exports = function(req, res) {
    mariadb.createConnection(config.database)
    .then(conn => {
        const userid = (req.apiKey) ? req.query.u || req.body.u : req.user.id;

        conn.query("SELECT id, name, userid, content, file FROM tag WHERE name=? AND userid=?",
        [ req.body.name, userid ])
        .then(rows => {
            let oldData = rows[0];

            conn.query("UPDATE tag SET content=?, file=? WHERE id=?", [
                (req.body.content == '' || req.body.content == 'null') ? null : req.body.content,
                (req.file) ? req.file.filename : oldData.file,
                oldData.id
            ]).then(upd => {
                if (oldData.file && req.file)
                    fs.unlink(__dirname + '/../../tags/' + oldData.file);

                conn.destroy();
                res.send(200);
            })
            .catch(err => {
                if (conn)
                    conn.destroy();

                res.send(err);
            });
        })
        .catch(err => {
            if (conn)
                conn.destroy();

            res.send(err);
        });
    });
}