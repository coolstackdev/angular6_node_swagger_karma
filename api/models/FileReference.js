const mongoose = require('mongoose');

const FileReferenceSchema = new mongoose.Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    contentType: {type: String, required: true, minLength: 1},
    size: {type: String, required: true, minLength: 1},
    fileLastModified: {type: Date, default: () => new Date()}
},
    { timestamps: true });

module.exports = mongoose.model('FileReference', FileReferenceSchema);
