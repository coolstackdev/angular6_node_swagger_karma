const randomstring = require('randomstring');
const User = require('../models/UserModel');
const BalanceHelper = require('../helper/BalanceHelper');
const Balance = require('../models/BalanceModel');
const QuizAnswer = require('../models/QuizAnswerModel');
const Lesson = require('../models/LessonModel');
const School = require('../models/SchoolModel');
const LessonActivity = require('../models/LessonActivityModel');
const Referral = require('../models/ReferralModel');
const SE = require('../../config/error.config');
const sendEmail = require('../helper/mailHelper');
const Settings = require('../models/SettingsModel');
const mongoose = require('mongoose');
const async = require('async');
// const fs = require('fs');
// const gm = require('gm').subClass({imageMagick: true});
// const FroalaEditor = require('../../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js');

module.exports = {
    getUsers: getUsers,
    getUsersByDate: getUsersByDate,
    createUser: createUser,
    editUser: editUser,
    deleteUser: deleteUser,
    UserSuccess: UserSuccess,
    topStudents: topStudents,
    changePassword: changePassword
};

function getUsers(req, res) {
    const types = req.query.types.split(',');
    User
        .find()
        .populate({
            path: 'role',
            match: {
                translation: {
                    $in: types
                }
            }
        })
        .populate('school grade')
        .sort({
            createdAt: -1
        })
        .exec((err, users) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            users = users.filter(user => user.role);
            Promise.all(users.map(BalanceHelper.getBalance)).then(usersWithPoints => {
                res._end({users: usersWithPoints});
            });
        });
}

function getUsersByDate(req, res) {
    const start = req.query.start;
    const end = req.query.end;

    User.aggregate([{
            $match: {
                updatedAt: {
                    $gte: new Date(start),
                    $lt: new Date(end)
                }
            }
        },{
            $project: {
                year: {$year: "$updatedAt"},
                month: {$month: "$updatedAt"},
                dayOfMonth: {$dayOfMonth: "$updatedAt"}
            }
        },{
            $group: {
                _id: {
                    year: '$year',
                    month: '$month',
                    dayOfMonth: '$dayOfMonth'
                },
                count: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                updatedAt: -1
            }
        }
    ], function(err, users){
        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
        const dateArray = users.map((value, index, array) => {
            return value._id.year+'-'+value._id.month+'-'+value._id.dayOfMonth
        })
        const counts = users.map((value, index, array) => {
            return value.count
        })
        console.log(dateArray, counts)
        
        return res._end({success:'Success', dateArray: dateArray, counts: counts});
    }
)}

function createUser(req, res) {
    // let newUser = new User();
    // newUser.username = req.body.username;
    // newUser.email = req.body.email;
    // newUser.role = req.body.role;
    // var password = randomstring.generate(7);
    // newUser.password = newUser.generateHash(password);
    // newUser
    //     .save(function (err) {
    //         if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
    //         else {
    //             res._end({user: newUser});
    //         }
    //     })
    // TODO: DEPRECATED
    res._end(new SE(err.message, SE.STATUS.METHOD_NOT_ALLOWED, SE.CODE.INVALID_PERMISSION));
}

function editUser(req, res) {
    if (req.body.password && req.user.role.level > 4) {
        User
            .findOne({_id: req.body._id})
            .populate('role')
            .exec((err, user) => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                user.password = user.generateHash(req.body.password);
                user.email = user.email.toLowerCase();
                user.save(function (err) {
                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                    let mailOptions = {
                        to: user.email,
                        title: 'New password',
                        content: `Your new password on VirtuProfs is : ${req.body.password}`
                    };
                    sendEmail(mailOptions);
                    return res._end({success: true});
                })
            })
    } else {
        const userData = {...req.body}, query = {};
        userData.email = userData.email.toLowerCase();
        const password = randomstring.generate(7);
        let createdByAdmin = false;
        let referral = userData.referral;
        let referralCode = userData.referralCode;

        if (userData._id) {
            delete userData._id;
            delete userData.referral;
            delete userData.referralCode;
            delete userData.password;
            if (userData.language) {
                delete userData.language;
            }

            query._id = req.body._id;
        } else {
            query._id = new mongoose.mongo.ObjectID();
            const user = new User();
            createdByAdmin = true;
            userData.password = user.generateHash(password);
            User
                .findOneAndUpdate(query, userData, {upsert: true, new: true, runValidators: true})
                .populate('role')
                .exec((err, user) => {
                    if (err) {
                        return (err.message.includes('E11000')) ?
                            res._end(new SE('This email address already exists in the database', SE.STATUS.NOT_FOUND, SE.CODE.INVALID_DUPLICATE_MONGODB_SAVE)) :
                            res._end(new SE(err.message, SE.STATUS.BAD_REQUEST, SE.CODE.ERROR_MONGODB_SAVING));
                    }
                    if (!user) return res._end(new SE('err.message', SE.STATUS.NOT_FOUND, SE.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                    if (createdByAdmin) {
                        let mailOptions = {
                            to: userData.email,
                            title: 'Registration on VirtuProfs',
                            content: `Link: ${process.env.BASE_URL} \n Username: ${userData.username} \n Password: ${password}`
                        };
                        sendEmail(mailOptions);
                    }
                    return res._end({user: user});
                })
        }

        if (!!userData.school) {
            School.findOne({_id: userData.school})
                .exec((err, school) => {
                    if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                    if (!!school) {
                        userData.schoolName = school.name;
                    }
                })
        }

        if (userData.phone && userData.countryCode) {
            User.findOne({
                phone: userData.phone,
                countryCode: userData.countryCode,
                _id: {
                    $ne: req.user._id
                }
            }, function (err, user) {
                if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                if (user && req.user.role.level !== 5) return res._end(new SE("This phone is already in use", SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_PHONE_ALREADY_TAKEN));
                else {
                    User
                        .findOneAndUpdate(query, userData, {upsert: true, new: true, runValidators: true})
                        .populate('role')
                        .exec((err, user) => {
                            if (err) {
                                return (err.message.includes('E11000')) ?
                                    res._end(new SE('This email address already exists in the database', SE.STATUS.NOT_FOUND, SE.CODE.INVALID_DUPLICATE_MONGODB_SAVE)) :
                                    res._end(new SE(err.message, SE.STATUS.BAD_REQUEST, SE.CODE.ERROR_MONGODB_SAVING));
                            }
                            if (!user) return res._end(new SE('err.message', SE.STATUS.NOT_FOUND, SE.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                            if (createdByAdmin) {
                                let mailOptions = {
                                    to: userData.email,
                                    title: 'Registration on VirtuProfs',
                                    content: `Link: ${process.env.BASE_URL} \n Username: ${userData.username} \n Password: ${password}`
                                };
                                sendEmail(mailOptions);
                            }

                            if (referral) {
                                Settings
                                    .findOne({name: 'referralAmount'})
                                    .exec((err, amount) => {
                                        if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                        if (amount && amount.value > 0) {
                                            User
                                                .findOne({phone: userData.phone, countryCode: userData.countryCode})
                                                .exec((err, user) => {
                                                    if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                                    if (!!user) {
                                                        User
                                                            .findOne({phone: referral, countryCode: referralCode})
                                                            .exec((err, usr) => {
                                                                if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                                                if (!!usr) {
                                                                    user.referral = usr._id;
                                                                    let balance = new Balance();
                                                                    balance.cashFlow = amount.value;
                                                                    balance.user = user.referral;
                                                                    balance.type = 8;
                                                                    balance.status = false;
                                                                    balance.referralFrom = user._id;
                                                                    balance.paymentStatus = 0;
                                                                    balance.save();

                                                                    let balanceSecond = new Balance();
                                                                    balanceSecond.cashFlow = amount.value;
                                                                    balanceSecond.user = user._id;
                                                                    balanceSecond.type = 8;
                                                                    balanceSecond.status = false;
                                                                    balanceSecond.referralTo = user.referral;
                                                                    balanceSecond.paymentStatus = 0;
                                                                    balanceSecond.save();
                                                                    //asd

                                                                    user.firstSubscriptionDone = true;
                                                                    user.save();
                                                                }
                                                            });
                                                    }
                                                });
                                        } else if (amount && amount.percent > 0) {
                                            User
                                                .findOne({phone: userData.phone})
                                                .exec((err, user) => {
                                                    if (err) return res._end(new SE(err, SE.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                                    if (!!user) {
                                                        User
                                                            .findOne({phone: referral})
                                                            .exec((err, usr) => {
                                                                if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                                                if (!!usr) {
                                                                    user.referral = usr._id;
                                                                    user.save();
                                                                }

                                                            })
                                                    }
                                                });
                                        }
                                        return res._end({user: user});
                                    });
                            } else {
                                return res._end({user: user});
                            }
                        })
                }
            });
        }
    }
}

function UserSuccess(req, res) {
    const todayStartDate = new Date();
    todayStartDate.setHours(0, 0, 0, 0);

    Promise
        .all([
            QuizAnswer
                .aggregate([
                    {
                        $match: {
                            user: req.user._id
                        }
                    },
                    {
                        $project: {
                            total: {$add: ['$questionsTotal']},
                            correct: {$add: ['$questionsCorrect']}
                        }
                    }
                ]),
            LessonActivity
                .find({user: req.user._id, finished: true})
                .select('lesson'),
            Balance
                .aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            status: true,
                            paymentStatus: 2,
                            type: {$ne: 8}
                        }
                    },
                    {
                        $group: {
                            _id: '$user',
                            total: {$sum: "$cashFlow"}
                        }
                    }
                ]),
            Lesson
                .find({grade: {$in: [req.user.grade]}})
                .select('grade'),
            // getUserCountLessons(req)
        ])
        .then((data => {
            data[1] = data[1].filter(lesson => {
                return lesson.lesson ? data[3].filter(l => l._id.toString() === lesson.lesson.toString()).length : false
            });
            res._end({
                statistic: {
                    lessons: {
                        all: data[3].length,
                        total: data[1].length
                    },
                    avgScore: data[0].reduce((avg, quiz) => (quiz.total !== 0) ? (avg !== 0) ? ((avg + (quiz.correct * 100) / quiz.total)) / 2 : quiz.correct * 100 / quiz.total : avg, 0).toFixed(),
                    points: data[2][0] ? data[2][0].total : 0
                }
            });
        }));
}

function deleteUser(req, res) {
    let ids = req.query.ids.split(',');

    User
        .updateMany(
            {
                _id: {
                    $in: ids
                }
            },
            {
                $set: {
                    isDeleted: true,
                    phone: ''
                }
            }
        )
        .then(
            res._end({success: true})
        )
        .catch(function (err) {
            if (err) res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
        });
}

function topStudents1(req, res) {
    let greatTop = false;
    if (!!req.query.top) {
        if (req.query.top.toString() === '100') {
            greatTop = true;
        }
    }
    User
        .find({isDeleted: false})
        .select('name lastName role')
        .populate({
            path: 'role',
            match: {translation: 'role.student'}
        })
        .exec((err, students) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            console.log(students.length, ' students');
            if (students) {
                //Take students with student role
                students = students.filter(student => !!student.role);

                //Calculate user correct answers
                Promise.all(students.map((item) => {
                    return new Promise((resolve, reject) => {
                        QuizAnswer
                            .aggregate([
                                {
                                    $match: {
                                        user: item._id,
                                        author: item._id
                                    }
                                },
                                {
                                    $group: {
                                        _id: '$user',
                                        total: {$sum: '$questionsCorrect'}
                                    }
                                }
                            ])
                            .exec((err, qzs) => {
                                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                User.populate(qzs, {path: '_id'}, (err, done) => {
                                    resolve(done);
                                })
                            })
                    })
                })).then(result => {

                    //Merge all users to get scores for all students
                    result = result.map((user, index) => {
                        if (!user[0]) {
                            return [{_id: students[index], total: 0}]
                        } else {
                            return user
                        }
                    });

                    result = result
                        .filter(item => item.length > 0 && item[0]._id);
                    Promise.all(result.map((it) => {
                        return new Promise((resolve, reject) => {
                            Balance
                                .aggregate([
                                    {
                                        $match: {
                                            user: it[0]._id._id,
                                            type: {$in: [8, 3]},
                                            status: true,
                                            paymentStatus: 2
                                        }
                                    }, {
                                        $group: {
                                            _id: '$user',
                                            total: {$sum: "$cashFlow"}
                                        }
                                    }
                                ])
                                .exec((err, bal) => {
                                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                    if (!!bal[0]) {
                                        it[0].total += bal[0].total;
                                    }
                                    resolve(it);
                                });
                        })
                    })).then(reslt => {
                        reslt = reslt
                            .filter(item => !!item[0]._id)
                            .sort((a, b) => b[0].total - a[0].total);
                        let currentUser = reslt.filter(item => item[0]._id._id.toString() === req.user._id.toString());

                        let rank = reslt.findIndex(item => item[0]._id._id.toString() === req.user._id.toString());
                        rank = (rank === -1) ? reslt.length : rank;

                        let score;
                        if (!!currentUser[0]) {
                            score = currentUser[0][0].total;
                        } else score = 0;

                        if (greatTop === true) {
                            return res._end({
                                top: reslt.slice(0, 100),
                                rank: rank + 1,
                                score: score
                            });
                        } else {
                            return res._end({
                                top: reslt.slice(0, 10),
                                rank: rank + 1,
                                score: score
                            });
                        }

                    })
                })
            } else {
                return res._end({top: [], rank: 0, score: 0});
            }
        })
}

function topStudents(req, res) {
    let greatTop = false;
    if (!!req.query.top) {
        if (req.query.top.toString() === '100') {
            greatTop = true;
        }
    }

    User
        .find({isDeleted: false})
        .select('name lastName role email')
        .populate({
            path: 'role',
            match: {translation: 'role.student'}
        })
        .exec((err, students) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            console.log(students.length, ' students');
            if (students) {
                //Take students with student role
                students = students.filter(student => !!student.role);
                Promise.all(students.map((item) => {
                    return new Promise((resolve, reject) => {
                        Balance
                            .aggregate([
                                {
                                    $match: {
                                        user: item._id,
                                        type: {$in: [8, 3]},
                                        status: true,
                                        paymentStatus: 2
                                    }
                                }, {
                                    $group: {
                                        _id: '$user',
                                        total: {$sum: "$cashFlow"}
                                    }
                                }
                            ])
                            .exec((err, bal) => {
                                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                User.populate(item, {path: '_id'}, (err, done) => {
                                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                    let total;
                                    if (!!bal[0]) {
                                        total = bal[0].total;
                                    } else {
                                        total = 0;
                                    }
                                    resolve([{_id: done, total: total}]);
                                })
                            });
                    })
                })).then(reslt => {
                    reslt = reslt
                        .filter(item => !!item[0]._id._id._id)
                        .sort((a, b) => b[0].total - a[0].total);
                    let currentUser = reslt.filter(item => item[0]._id._id._id.toString() === req.user._id.toString());
                    //console.log(currentUser[0], ' current user');

                    let rank = reslt.findIndex(item => item[0]._id._id._id.toString() === req.user._id.toString());
                    rank = (rank === -1) ? reslt.length : rank;
                    //console.log(rank, ' rank!');

                    let score;
                    if (!!currentUser[0]) {
                        score = reslt[rank][0].total;
                    } else score = 0;

                    //console.log(score, ' score');

                    if (greatTop === true) {
                        return res._end({
                            top: reslt.slice(0, 100),
                            rank: rank + 1,
                            score: score
                        });
                    } else {
                        return res._end({
                            top: reslt.slice(0, 10),
                            rank: rank + 1,
                            score: score
                        });
                    }
                })
            } else {
                return res._end({top: [], rank: 0, score: 0});
            }
        })
}

function changePassword(req, res) {
    User
        .findOne({_id: req.body.user})
        .exec((err, user) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            user.password = user.generateHash(req.body.password);
            user.save(function (err) {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                let mailOptions = {
                    to: user.email,
                    title: 'New password',
                    content: `Your new password on VirtuProfs is : ${req.body.password}`
                };
                sendEmail(mailOptions);
                return res._end({success: true});
            })
        })
}

function getUserCountLessons(req) {
    return new Promise((resolve, reject) => {
        Balance
            .find({user: req.user._id, subjects: {$exists: true, $ne: []}, validTo: {$gte: Date.now()}})
            .exec((err, subscriptions) => {
                if (err) return reject(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

                Promise.all(subscriptions.map((item) => {
                    return new Promise((resolve, reject) => {
                        Lesson
                            .count({subject: item.subjects[0]})
                            .exec((err, lessonsCount) => {
                                if (err) return reject(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                resolve(lessonsCount);
                            })
                    })
                })).then(result => {
                    return resolve(result.reduce((a, b) => a + b, 0));
                })
            })
    });
}
