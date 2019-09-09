'use strict';

const NotificationModel = require('../models/NotificationModel');
const SE = require('../../config/error.config');

module.exports = {
    getNotifications: getNotifications,
    updateNotification: updateNotification
};

function getNotifications(req, res) {
    NotificationModel.find({softDeleted: false, recipient: req.user._id})
        .sort({createdAt: -1})
        .limit(100)
        .exec((err, notifications) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_SERVER));
            res._end({notifications: notifications});
        });
}

function updateNotification(req, res) {
    NotificationModel.update({_id: {$in: req.swagger.params.notificationIds.value.ids}}, {new: false}, {
        multi: true,
        strict: false,
        new: true
    }).exec((err, notification) => {
        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_SERVER));

        res._end(notification);
    });
}
