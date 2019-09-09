const Subject = require('../models/SubjectModel');
const Balance = require('../models/BalanceModel');
const User = require('../models/UserModel');
const SE = require('../../config/error.config');
const Lesson = require('../models/LessonModel');

module.exports = {
    setSubject: setSubject,
    getSubjects: getSubjects,
    getSubjectsManage: getSubjectsManage,
    deleteSubjects: deleteSubjects
};

function setSubject(req, res) {
    const subject = new Subject(req.body);
    Subject
        .findOneAndUpdate({_id: subject._id}, subject, {
            upsert: true,
            new: true
        })
        .populate('subjects')
        .exec((err, data) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({subject: data});
        })
}

function getSubjects(req, res) {
    /*Balance.find({user: {$exists: true}, validTo: {$exists: true}, status: true, type: 4, subjects: {$exists: true}})
        .populate('user')
        .exec((err, balances) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            if (balances) {
                balances.forEach(function (item) {
                    if (!!item) {
                        item.grade = item.user.grade;
                        item.save();
                    }
                })
            }
        });*/
    const dateEndOfToday = new Date();
    dateEndOfToday.setHours(0, 0, 0, 0);

    Subject
        .find()
        .populate('subjects')
        .exec((err, subjects) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            let subSubjects = subjects.map(subject => subject.subjects.length !== 0 && subject.subjects)
                .filter(subject => subject);
            subSubjects = [].concat.apply([], subSubjects);

            // console.log('subSubjects = ', subSubjects);
            Balance
                .aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            grade: req.user.grade
                        }
                    }, {
                        $lookup: {
                            from: 'user',
                            localField: 'subscription',
                            foreignField: '_id',
                            as: 'subscription'
                        }
                    }, {
                        $facet: {
                            subscriptions: [
                                {
                                    $match: {
                                        'subjects.0': {$exists: true},
                                        'validTo': {
                                            $gt: dateEndOfToday
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ])
                .exec((err, data) => {
                    if (err) res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

                    subjects = subjects.map(subject => {

                        let findIndex = data[0].subscriptions.findIndex((balance) => {
                            return balance.subjects[0].toString() === subject._id.toString()
                        });

                        subject = subject.toObject();
                        subject.activated = (findIndex > -1);

                        return subject;
                    });

                    subjects = subjects.filter(subject => {
                        let accessGrades = subject.accessByGrade.map(grade => grade.toString());
                        return accessGrades.includes(req.user.grade._id.toString());
                    });

                    //Hide sub-subjects in order subscription page
                    let subSubjectsIds = subSubjects.map(subjId => subjId._id.toString());
                    subjects = subjects.filter(subject => {
                        return !subSubjectsIds.includes(subject._id.toString());
                    });

                    //Hide sub-subject in primary if user grade not fit to sub-subject
                    subjects = subjects.map(subject => {
                        subject.subjects = subject.subjects.filter(subSubject => {
                            subSubject.accessByGrade = subSubject.accessByGrade.map(item => item.toString());
                            return subSubject.accessByGrade.includes(req.user.grade._id.toString())
                        });
                        return subject;
                    });

                    res._end({subjects: subjects});
                });
        });
}

function getSubjectsManage(req, res) {
    const dateEndOfToday = new Date();
    dateEndOfToday.setHours(0, 0, 0, 0);

    Subject
        .find()
        .populate('subjects')
        .exec((err, subjects) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            if (req.user.role.level === 5){
                return res._end({subjects: subjects});
            }  else if (req.user.role.level >= 3) {
                User
                    .findOne({_id: req.user._id})
                    .populate('subjects')
                    .exec((err, user) => {
                        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                        return res._end({subjects: user.subjects});
                    })
            } else {
                Balance
                    .find({user: req.user._id, subjects:  { $exists: true, $ne: [] }, grade: req.user.grade, validTo: {$gte: dateEndOfToday}, status: true})
                    .populate('subjects')
                    .exec((err, subscriptions) => {
                        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                        let arr = [];
                        console.log(subscriptions.length, ' ))))))))))))');
                        // let subSubjects = [];
                        subscriptions = subscriptions.filter(subscription => subscription.subjects.length !== 0);
                        Promise.all(subscriptions.map((item) => {
                            return new Promise((resolve, reject) => {
                                Subject
                                    .findOne({_id: item.subjects[0]._id})
                                    .populate('subjects')
                                    .exec((err, subject) => {
                                        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                        if (subject.accessByGrade.indexOf(req.user.grade) !== -1) {
                                            arr.push(subject);
                                            resolve(subject);
                                        } else resolve(false);
                                    })
                            })
                        })).then(result => {
                            return res._end({subjects: arr});
                        });
                    })
            }
        });
}


function deleteSubjects(req, res) {
    let ids = req.query.ids.split(',');
    Subject
        .deleteMany({'_id': {$in: ids}})
        .exec((err, data) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}
