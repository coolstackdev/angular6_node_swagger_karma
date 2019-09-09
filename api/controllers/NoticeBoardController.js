'use strict';

const NoticeBoardModel = require('../models/NoticeBoardModel');
const SE = require('../../config/error.config');
const NotificationHelper = require('../helper/NotificationHelper');
const i18n = require('i18n');

module.exports = {
    getNoticeBoardMessages: getNoticeBoardMessages,
    getNoticeBoardMessage: getNoticeBoardMessage,
    setNoticeMessage: setNoticeMessage,
    deleteNotice: deleteNotice
};

function getNoticeBoardMessages(req, res) {
    NoticeBoardModel.find({})
        .sort({createdAt: -1})
        .exec((err, noticeMessages) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_SERVER));
            res._end({noticeMessages: noticeMessages});
        });
}

function getNoticeBoardMessage(req, res) {
    NoticeBoardModel.find({})
        .sort({createdAt: -1})
        .exec((err, noticeMessages) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_SERVER));
            if (!!noticeMessages) {
                return res._end({noticeMessages: noticeMessages});
            } else {
                return res._end({message: 'No notices'});
            }

        });
}

function setNoticeMessage(req, res) {
    const noticeMessage = new NoticeBoardModel(req.body);
    NoticeBoardModel
        .findOneAndUpdate({_id: noticeMessage._id}, noticeMessage, {
            upsert: true,
            new: true
        })
        .exec((err, noticeMessage) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            NotificationHelper.sendNoticeNotification(noticeMessage._id, 1, 'application.notification.noticeCreated', 'noticeBoard');
            NotificationHelper.sendNoticePushNotification(noticeMessage._id, i18n.__({
                phrase: 'application.notification.noticeCreated'
            }), 'noticeBoard');
            res._end({noticeMessage: noticeMessage});
        });
}

function deleteNotice(req, res) {
    let ids = req.query.ids.split(',');
    NoticeBoardModel
        .deleteMany({'_id': {$in: ids}})
        .exec((err, data) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}
