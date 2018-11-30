const multer = require('multer');
const mime = require('mime-types');
const path = require('path');

/*
        DISK STORAGE
*/
function diskStorageDestinationHandler(req, file, cb) {
    cb(null, 'tags/')
}

function diskStorageFilenameHandler(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
}

const storage = multer.diskStorage({
    destination: diskStorageDestinationHandler,
    filename: diskStorageFilenameHandler
});

const limits = {
    fileSize: 8388608 // This should be 8MB
}

const e = {
    limits,
    storage
}

module.exports = e;