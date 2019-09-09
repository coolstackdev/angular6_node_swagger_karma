'use strict';

const NotificationModel = require('../models/NotificationModel'),
    FCM = require('fcm-node'),
    DeviceModel = require('../models/DeviceModel'),
    SERVER_KEY = process.env.PUSH_SERVER_KEY,
    fcm = new FCM(process.env.PUSH_SERVER_KEY);

module.exports = {
    sendNotification: sendNotification,
    sendPushNotification: sendPushNotification,
    sendNoticeNotification: sendNoticeNotification,
    sendNoticePushNotification: sendNoticePushNotification,
    sendNoticeAndroidPush: sendNoticeAndroidPush
};

/**
 * @description Send notification to student
 * @param userId
 * @param type
 * @param message
 * @param goto
 * @returns null
 */
function sendNotification(userId, type, message, goto) {
    let io = global.io;
    let NotificationData = {'type': type, 'message': message, 'new': true, 'goto': goto};

    NotificationData['recipient'] = userId;

    let Notification = new NotificationModel(NotificationData);

    Notification.save()
        .then((notification) => {
            notification = {
                '_id': notification._id,
                'type': notification.type,
                'message': notification.message,
                'new': notification.new,
                'goto': notification.goto,
                'createdAt': notification.createdAt,
                'updatedAt': notification.updatedAt
            };
            io.to(userId).emit('notification', notification);
        })
        .catch(err => console.error(err));
}

function sendNoticeNotification(noticeId, type, message, goto) {
    let io = global.io;
    let NotificationData = {'noticeId': noticeId, 'type': type, 'message': message, 'new': true, 'goto': goto};

    let Notification = new NotificationModel(NotificationData);
    if (!!Notification.message) {
        Notification.body = 'There is an important notice for VirtuProfs user';
        console.log('1');
    }

    Notification.save()
        .then((notification) => {
            notification = {
                '_id': notification._id,
                'type': notification.type,
                'message': notification.message,
                'new': notification.new,
                'goto': notification.goto,
                'noticeId': noticeId,
                'createdAt': notification.createdAt,
                'updatedAt': notification.updatedAt
            };
            io.to('5b69b678265fb633dc0ad165').emit('notification', notification);
        })
        .catch(err => console.error(err));
}

/**
 * @description Send push notification to teamlead
 * @param userId
 * @param message
 * @param goto
 * @returns null
 */
function sendPushNotification(userId, message, goto) {
    console.log('userId, message, goto');
    console.log(userId, message, goto);
    DeviceModel.findOne({user: userId})
        .sort({createdAt: -1})
        .exec((err, deviceInfo) => {
            if (err) console.error(err);

            if (!deviceInfo) return;

            if (deviceInfo.platform === 'android') {
                console.log(message, ' message');
                sendAndroidPush(deviceInfo, message, goto);
            }
        });
}

function sendNoticePushNotification(noticeId, message, goto) {
    console.log('noticeId, message, goto');
    //console.log(noticeId, message, goto);
    DeviceModel.find({platform: 'android', user: '5b69b678265fb633dc0ad165'})
        .exec((err, deviceInfo) => {
            if (err) console.error(err);

            if (!deviceInfo) return;
            if (!message) {
                message = 'There is an important notice for VirtuProfs user';
            }

            Promise.all(deviceInfo.map((item) => {
                return new Promise((resolve, reject) => {
                    if (item.registrationId) {
                        resolve(item.registrationId)
                    } else {
                        resolve(false)
                    }
                })
            })).then(result => {
                if (result.lenght > 1000) {
                    for(i = 0; i < (result.length/1000); i++) {
                        let arr = result.slice(i*1000, i*1000+1000);
                        sendNoticeAndroidPush(arr, message, goto);
                    }
                } else {
                    sendNoticeAndroidPush(result, message, goto);
                }

            })
        });
}

function sendAndroidPush(deviceInfo, message, goto) {
    console.log('deviceInfo, message, goto ', deviceInfo, message, goto);
    let pushMessage = {
        to: deviceInfo.registrationId,
        collapse_key: 'Notification',
        notification: {
            title: 'VirtuProfs',
            body: message
        },
        android: {
            "ttl": "86400s",
            "notification": {
                "click_action": "OPEN_ACTIVITY_1"
            }
        },
        data: {
            "goto": goto,
            "click_action": goto
        }
    };

    fcm.send(pushMessage, function (err, response) {
        if (err) {
            console.error("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

function sendNoticeAndroidPush(deviceInfo, message, goto) {
    let pushMessage = {
        registration_ids: deviceInfo ,
        collapse_key: 'Notification',
        notification: {
            title: 'VirtuProfs',
            body: message
        },
        android: {
            "ttl": "86400s",
            "notification": {
                "click_action": "OPEN_ACTIVITY_1"
            }
        },
        data: {
            "goto": goto,
            "click_action": goto
        }

    };

    fcm.send(pushMessage, function (err, response) {
        if (err) {
            console.error("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
            console.log("push data ", pushMessage);
        }
    });
}
