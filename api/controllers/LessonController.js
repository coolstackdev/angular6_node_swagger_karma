const Lesson = require('../models/LessonModel');
const LessonActivity = require('../models/LessonActivityModel');
const SE = require('../../config/error.config');
const async = require('async');
const mongoose = require('mongoose');

module.exports = {
    manageLessons: manageLessons,
    getLesson: getLesson,
    getLessons: getLessons,
    setLesson: setLesson,
    getLessonsBySubject: getLessonsBySubject,
    deleteLessons: deleteLessons,
    lessonStatistic: lessonStatistic
};

function manageLessons(req, res) {
    const query = {};
    if (req.user.role) {
        if (req.user.role.level !== 5) {
            query.subject = {$in: req.user.subjects}
        }
    }
    Lesson
        .find(query)
        .populate('grade subject')
        .select('title subtitle grade subject')
        //.sort({createdAt: -1})
        .exec((err, lessons) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({lessons: lessons});
        })
}

function getLesson(req, res) {
    Lesson
        .findById(req.swagger.params.id.value)
        .exec((err, lesson) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({lesson: lesson});
        });
}

function getLessons(req, res) {
    Lesson
        .find()
        .populate('subject grade author')
        .exec((err, lessons) => {
            if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({lessons: lessons});
        });
}

function getLessonsBySubject(req, res) {
    let subject = req.query.subject;
    Lesson
        .find({subject: subject, grade: req.user.grade})
        .exec((err, lessons) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            Promise.all(lessons.map((item) => {
                return new Promise((resolve, reject) => {
                    LessonActivity.findOne({user: req.user._id, lesson: item._id})
                        .exec((err, lessonActivity) => {
                            if (err) return reject(err);
                            if (lessonActivity) {
                                item = item.toObject();
                                item.finished = lessonActivity.finished;
                            }
                            resolve(item);
                        })
                })
            })).then(lessons => {
                res._end({lessons: lessons});
            }, err => {
                res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            });
        });
}

function setLesson(req, res) {
    const lesson = new Lesson(req.body);
    lesson.author = req.user._id;
    Lesson
        .findOneAndUpdate({_id: lesson._id}, lesson, {
            upsert: true,
            new: true
        })
        .exec((err, data) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({lesson: data});
        })
}

function deleteLessons(req, res) {
    if (req.user.role.level === 5) {
        let ids = req.query.ids.split(',');
        Lesson
            .deleteMany({'_id': {$in: ids}})
            .exec((err, data) => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                if (data.n === 0) return res._end(new SE('Lessons were not deleted', SE.STATUS.FORBIDDEN, SE.CODE.INVALID_DELETE_LESSONS_ID_OR_PERMISSION));

                return res._end({success: true});
            });
    } else {
        return res._end(new SE('Lessons were not deleted', SE.STATUS.FORBIDDEN, SE.CODE.INVALID_DELETE_LESSONS_ID_OR_PERMISSION));
    }
}

function lessonStatistic(req, res) {
    Lesson.aggregate([
        {
            $match: {
                grade: req.user.grade
            }
        },
        {
            $group: {
                _id: {subject: "$subject"},
                count: {$sum: 1}
            }
        }
    ]).exec((err, groupedLessons) => {
        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

        async.mapLimit(groupedLessons, 10, (subject, callback) => {

            LessonActivity.find({user: req.user._id})
                .populate({
                    path: 'lesson',
                    populate: {path: 'subject'},
                    select: 'subject',
                    match: {subject: subject._id.subject}
                })
                .exec((err, endedLessons) => {
                    if (err) return callback(err);
                    endedLessons = endedLessons.filter(activity => (!!activity.lesson && activity.finished === true));
                    endedLessons.map(console.log);
                    return callback(null, {
                        'subject': subject._id.subject,
                        'total': subject.count,
                        'passed': endedLessons.length
                    });
                })

        }, (err, result) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_SERVER));
            const lessonActivityRate = result.map((subject) => {
                subject.doneRate = Math.round(subject.passed / subject.total * 100);
                return subject;
            });
            return res._end({result: lessonActivityRate});
        })
    });
}
