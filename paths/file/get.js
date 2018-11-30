/*
    /tag/get/:name

    Gets the file specified in the name parameter.
*/

module.exports = function(req, res) {
    res.sendFile('tags/' + req.params.name, { 'root': './' });
}