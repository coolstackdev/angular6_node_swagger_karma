const QuizAnswer = require('../models/QuizAnswerModel');
const User = require('../models/UserModel');
const ServiceError = require('../../config/error.config');
const Balance = require('../models/BalanceModel');
const randomstring = require("randomstring");
const Quiz = require('../models/QuizModel');
const Exam = require('../models/ExamModel');
const async = require('async');

module.exports = {
    setQuizAnswer: setQuizAnswer,
    getQuizAnswers: getQuizAnswers,
    deleteQuizAnswers: deleteQuizAnswers,
    getQuizAnswerByCode: getQuizAnswerByCode,
    quizzesResults: quizzesResults,
    updateQuizAnswer: updateQuizAnswer,
    refresh: refresh,
    setQuizAnswerExam: setQuizAnswerExam,
    getExams: getExams,
    editExam: editExam
};

function setQuizAnswer(req, res) {
    const quizAnswer = new QuizAnswer(req.body);

    quizAnswer.author = req.user._id;
    quizAnswer.accessCode = randomstring.generate(6).toLowerCase();
    quizAnswer
        .save(function (err, data) {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
            res._end({quiz: data})
        })
}

function setQuizAnswerExam(req, res) {
    User.find({school: req.body.school, grade: req.body.grade})
        .exec(async (err, users) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            if (users.length === 0)
                return res._end(new ServiceError('We have not found users for matching filter', ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_USERS_NOT_FOUND));

            //Create new exam
            req.body.author = req.user._id;
            let exam = new Exam(req.body);
            exam = await exam.save();

            //Create quiz answer for each student
            let usersCount = 0;
            async.eachOfLimit(users, 1, (user, key, callback) => {
                console.log(user);

                let quizAnswer = new QuizAnswer(req.body);
                quizAnswer.accessCode = randomstring.generate(6).toLowerCase();
                quizAnswer.author = req.user._id;
                quizAnswer.exam = exam;
                quizAnswer.user = user._id;
                quizAnswer
                    .save((err, data) => {
                        if (err) return callback(err);
                        usersCount++;
                        callback();
                    });
            }, (err) => {
                if (err) console.error(err.message);
                res._end({usersCount: usersCount})
            });
        })
}

function getExams(req, res) {
    Exam
        .find()
        .populate('quizzes author grade school')
        .exec((err, exams) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({exams: exams})
        })
}

function editExam(req, res) {
    const exam = new Exam(req.body);
    Exam
        .findOneAndUpdate({_id: req.body._id}, exam, {new: true})
        .exec((err, examNew) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({exam: examNew})
        })
}

function refresh(req, res) {
    QuizAnswer
        .findOne({accessCode: req.query.code})
        .exec((err, quizAnswer) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            const log = {};
            log.answers = quizAnswer.answers;
            log.questionsTotal = quizAnswer.questionsTotal;
            log.questionsCorrect = quizAnswer.questionsCorrect;
            log.createdAt = quizAnswer.createdAt;
            quizAnswer.history.push(log);
            quizAnswer.answers = [];
            quizAnswer.questionsCorrect = 0;
            quizAnswer.questionsTotal = 0;
            quizAnswer.createdAt = 0;
            quizAnswer.finished = false;
            quizAnswer.save(function (err) {
                if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
            });
            res._end({quizAnswer: quizAnswer});
        })
}

function getQuizAnswers(req, res) {
    const options = !!req.query.homework ? {quiz: {$exists: true}} : {'quizzes.0': {$exists: true}};
    options.author = req.user._id;
    QuizAnswer
        .find(options)
        .populate(!!req.query.homework ? 'user quiz' : 'user quizzes')
        .sort({updatedAt: -1})
        .exec((err, quizanswers) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            // quizanswers = quizanswers.filter(el => el.quiz || el.quizzes.length);
            res._end({quizzes: quizanswers});
        });
}

function getQuizAnswerByCode(req, res) {
    QuizAnswer
        .findOne({'accessCode': req.swagger.params.code.value.toLowerCase()})
        .populate('quiz quizzes')
        .exec((err, quizAnswer) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({quiz: quizAnswer});
        });
}

function deleteQuizAnswers(req, res) {
    let ids = req.query.ids.split(',');
    QuizAnswer
        .deleteMany({'_id': {$in: ids}, 'finished': false})
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            return res._end({success: true});
        });
}

function quizzesResults(req, res) {
    QuizAnswer
        .find({user: req.user._id, finished: true})
        .populate('quiz')
        .sort({
            updatedAt: -1
        })
        .exec((err, quizzes) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            return res._end({quizzes: quizzes});
        })
}

function updateQuizAnswer(req, res) {
    //req.body.finished = true;
    //delete req.body.quiz;
    //delete req.body.quizzes;
    //delete req.body.user;
    console.log(req.body);

    if (req.body.answers) {
        req.body.questionsCorrect = req.body.answers.filter(q => q.correct).length;
    }

    QuizAnswer
        .findOneAndUpdate({'_id': req.body._id, 'finished': false}, req.body, {
            new: true
        })
        .exec((err, quizAnswer) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
            if (!quizAnswer) return res._end(new ServiceError('A quiz is finished or hasn\'t found in DB', ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_QUIZ_NOT_UPDATED));
            QuizAnswer
                .find({quiz: quizAnswer.quiz, user: req.user._id, _id: {$ne: quizAnswer._id}})
                .exec((err, prev) => {
                    if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
                    console.log("11111");
                    if (prev.length > 0) {
                        res._end({quiz: quizAnswer});
                    } else {
                        Quiz
                            .findOne({_id: quizAnswer.quiz})
                            .exec((err, quiz) => {
                                if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
                                if  (quizAnswer.questionsTotal > 0) {
                                    let points = new Balance();
                                    points.user = req.user._id;
                                    points.cashFlow = Math.round((quizAnswer.questionsCorrect / quizAnswer.questionsTotal) * quiz.points);
                                    points.status = true;
                                    points.type = 3;
                                    points.paymentStatus = 2;
                                    points.save(function (err) {
                                        if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
                                        res._end({quiz: quizAnswer, points: points.cashFlow});
                                    });
                                } else res._end({quiz: QuizAnswer});
                            })
                    }
                })
        });
}
