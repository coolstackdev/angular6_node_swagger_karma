const Lesson = require('../models/LessonModel');
const LessonActivity = require('../models/LessonActivityModel');
const SE = require('../../config/error.config');

module.exports = {
    setLessonActivity: setLessonActivity,
    lessonDone: lessonDone,
    getLessonActivities: getLessonActivities,
    getLessonActivity: getLessonActivity
};


function setLessonActivity(req, res) {
    LessonActivity
        .findOneAndUpdate({lesson: req.body.lesson, user: req.user._id}, {
            lesson: req.body.lesson,
            user: req.user._id
        }, {
            upsert: true,
            new: true
        })
        .exec((err, lessonAct) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({lesson: lessonAct});
        })
}

function lessonDone(req, res) {
    LessonActivity
        .findOne({lesson: req.body.lesson, user: req.user._id})
        .exec((err, lessonAct) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            if (lessonAct) {
                lessonAct.finished = !lessonAct.finished;
                lessonAct.doneDate = new Date().toISOString();
                lessonAct.save();
            }
            res._end({lesson: lessonAct});
        })
}

function getLessonActivities(req, res) {
    LessonActivity
        .find({user: req.user._id})
        .populate('user lesson')
        .exec((err, lessons) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({actionLessons: lessons})
        })
}

function getLessonActivity(req, res) {
    LessonActivity
        .findOne({user: req.user._id, _id: req.query.id})
        .populate('user lesson')
        .exec((err, lessons) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({lesson: lessons})
        })
}

function getLessonActivityStat(req, res) {
    Lesson
        .aggregate([
            {
                $match: {
                    grade: req.user.grade
                }
            },
            {
                $group: {
                    _id: '$subject',
                    subject: '$subject',
                    lessons: {$push: '$_id'},
                    length: {$sum: 1}
                }
            }
        ])
        .exec((err, data) => {
            if (err)
                return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            res._end({dashboard: data});
        });
}

