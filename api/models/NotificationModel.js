const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
        type: {
            type: Number,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        new: {
            type: Boolean,
            default: true
        },
        goto: {
            type: String,
            required: true
        },
        softDeleted: {
            type: Boolean,
            default: false
        },
        noticeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NoticeBoard',
        }
    },
    {timestamps: true});

module.exports = mongoose.model('Notification', NotificationSchema);
