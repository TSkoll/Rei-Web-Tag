/*
    /file/mime/:name

    Returns the mime type of a specified file.
    If mime type is unknown to the system, return "unknown" instead.
*/

const mime = require('mime-types');

module.exports = function(req, res) {
    const type = mime.lookup(req.params.name);
    if (type)
        res.send(type);
    else
        res.send("unknown");
}