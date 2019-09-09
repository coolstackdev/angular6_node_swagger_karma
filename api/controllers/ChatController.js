const Chat = require('../models/ChatModel');
const Group = require('../models/GroupModel');
const ServiceError = require('../../config/error.config');
const async = require('async');

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

module.exports = {
    createGroup: createGroup,
    sendMessage: sendMessage,
    // getUserMessages: getUserMessages,
    getMessages: getMessages,
    // getChats: getChats
};

/**
 * @description Create group chat for groupChat or private conversation
 * @param req
 * @param res
 */
function createGroup(req, res) {
    req.body.admin = req.user._id;
    let group = new Group(req.body);

    group.save(err => {
        if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));

        res._end({success: true});
    });
}

function sendMessage(req, res) {
    let message = new Chat(req.body);
    message.sender = req.user._id;
    message.save(function (err) {
        if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
        res._end({message: "Message sent."})
    })
}

/**
 * @description Get grouped chats by groups and filtered by current user
 */
function getMessages(req, res) {
    Chat.aggregate([
        {
            $match: {$and: [{$or: [{sender: req.user._id}, {recipient: req.user._id}]}, {question: {$exists: false}}]}
        },
        {
            $project:
                {
                    _id: 0,
                    sender: "$sender",
                    recipient: "$recipient",
                    message: "$message",
                    isRead: "$isRead",
                    createdAt: "$createdAt",
                    group:
                        {
                            $cond: {
                                if: {$ne: ["$sender", req.user._id]},
                                then: "$sender",
                                else: "$recipient"
                            }
                        }
                }
        },
        {
            $group: {
                _id: "$group",
                messages: {
                    $push: {
                        message: "$message",
                        sender: "$sender",
                        recipient: "$recipient",
                        isRead: "$isRead",
                        createdAt: "$createdAt"
                    }
                },
            }
        }
    ])
        .exec((err, messages) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            res._end({messages: messages});
        });
}

// function getChats(req, res) {
//     async.waterfall([
//         function(callback) {
//     Chat
//         .find({$or: [{ sender: req.user._id }, { recipient: req.user._id }]})
//         .exec((err, data)=>{
//             if (err) throw err;
//             var chats = [];
//             data.forEach(function (message) {
//                 if (message.sender.toString() === req.user._id.toString()) {
//                     if (chats.includes(message.recipient.toString()) === false) {
//                         chats.push(message.recipient.toString());
//                 }
//                 }
//                 if (message.recipient === req.user._id) {
//                     if (chats.includes(message.sender.toString()) === false) {
//                         chats.push(message.sender.toString());
//                 }
//                 }
//             });
//             callback(null, chats)
//         })
//         },
//         function (chats, callback) {
//             var result = [];
//             var itemsProcessed = 0;
//             if (chats.length === 0)
//                 callback(null, result);
//             chats.forEach(function (msg) {
//                 Chat
//                     .find({$or: [{$and: [{sender: req.user._id}, {recipient: msg}]}, {$and: [{sender: msg}, {recipient: req.user._id}]}]})
//                     .exec((err, messages) => {
//                         if (err) throw err;
//                         result.push(messages);
//                         itemsProcessed++;
//                         if (itemsProcessed === chats.length)
//                             callback(null, result)
//                     })
//             })
//
//         }
//         ],
//         function(err, result) {
//             if (err) throw err;
//             res._end(result);
//         })
// }

// function getUserMessages(req, res) {
//     async.waterfall(
//         [
//             function (callback) {
//                 Chat
//                     .find({recipient: req.user._id, isRead: true})
//                     .exec((err, messagesRecievedRead) => {
//                         if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
//                         var messages = {};
//                         messages.recievedRead = messagesRecievedRead;
//                         callback(null, messages);
//                     })
//             },
//             function (messages, callback) {
//                 Chat
//                     .find({sender: req.user._id, isRead: true})
//                     .exec((err, messagesSentRead) => {
//                         if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
//                         messages.sentRead = messagesSentRead;
//                         callback(null, messages);
//                     })
//             },
//             function (messages, callback) {
//                 Chat
//                     .find({recipient: req.user._id, isRead: false})
//                     .exec((err, messagesRecieved) => {
//                         if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
//                         messages.recieved = messagesRecieved;
//                         callback(null, messages);
//                     })
//             },
//             function (messages, callback) {
//                 Chat
//                     .find({sender: req.user._id, isRead: false})
//                     .exec((err, messagesSent) => {
//                         if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
//                         messages.sent = messagesSent;
//                         callback(null, messages);
//                     })
//             }
//         ],
//         function (err, messages) {
//             if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
//             res._end({messages});
//         }
//     );
// }
