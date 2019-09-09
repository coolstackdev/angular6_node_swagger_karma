const mongoose = require('mongoose');

const NoticeBoardSchema = new mongoose.Schema({
        type: {
            type: Number,
            required: true,
            default: 0
        },
        message: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    },
    {timestamps: true});

module.exports = mongoose.model('NoticeBoard', NoticeBoardSchema);
