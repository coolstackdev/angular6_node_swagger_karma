const Quiz = require('../models/QuizModel');
const Subject = require('../models/SubjectModel');
const Grade = require('../models/GradeModel');
const ServiceError = require('../../config/error.config');
const Busboy = require('busboy');
const XLSX = require('xlsx');

module.exports = {
    setQuiz: setQuiz,
    getQuizzes: getQuizzes,
    getQuiz: getQuiz,
    deleteQuiz: deleteQuiz,
    manageQuizzes: manageQuizzes,
    searchQuizzes: searchQuizzes,
    parseQuiz: parseQuiz,
    addOptions: addOptions
};


function setQuiz(req, res) {
    let quiz = new Quiz(req.body);
    quiz.author = req.user._id;
    Quiz
        .findOneAndUpdate({_id: quiz._id}, quiz, {
            upsert: true,
            new: true
        })
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({quiz: data});
        })
}

function getQuizzes(req, res) {
    Quiz
        .find()
        .populate('grade subject grades')
        .exec((err, quizes) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({quizes: quizes});
        });
}

function getQuiz(req, res) {
    Quiz
        .findById(req.swagger.params.id.value)
        .exec((err, quiz) => {
            if (err) res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({quiz: quiz});
        });
}

function deleteQuiz(req, res) {
    let ids = req.query.ids.split(',');
    Quiz
        .deleteMany({'_id': {$in: ids}})
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}

function manageQuizzes(req, res) {
    const query = {};
    if (req.user.role) {
        if (req.user.role.level !== 5) {
            query.subject = {$in: req.user.subjects}
        }
    }
    Quiz
        .find(query)
        .populate('grade subject grades')
        .select('title subtitle grade subject grades')
        .exec((err, quizzes) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({quizzes: quizzes});
        })

}


function readFile(req) {
    let jsonFile;
    return new Promise((resolve, reject) => {
        const busBoy = new Busboy({headers: req.headers});
        busBoy.on('file', (fieldName, file, fileName, encoding, mimeType) => {
            let stream = [];
            file.on('data', (data) => {
                stream.push(data);
            });
            file.on('end', () => {
                const wb = XLSX.read(Buffer.concat(stream), {type: 'buffer'});
                jsonFile = wb.Sheets;
            });
        });
        busBoy.on('finish', function () {
            Promise.all(Object.keys(jsonFile).map(key => {
                return new Promise(resolve => {
                    resolve(XLSX.utils.sheet_to_json(jsonFile[key]));
                });
            })).then((convertedFiles) => {
                resolve(convertedFiles);
            });
            console.log('Done parsing!');
        });
        req.pipe(busBoy);

    });
}

function parseQuiz(req, res) {
    let savedQuizzes = [];

    readFile(req).then((jsonFiles) => {
        return Promise.all(jsonFiles.map(rows => {
            return createQuizzes(rows, req.user);
        })).then((files) => {
            return Promise.all(files.map(file => {
                return new Promise(resolve => {
                    Promise.all(file.map(quiz => {
                        return saveQuizToDataBase(quiz);
                    })).then((q) => {
                        savedQuizzes.push(q);
                        resolve('saved');
                    })
                });
            }));
        }).then(() => {
            console.log(savedQuizzes[savedQuizzes.length - 1], ' @@@@@@@@@@@@@@@@@@@');
            if (savedQuizzes[savedQuizzes.length - 1][0].author && savedQuizzes[savedQuizzes.length - 1][0].points) {
                res._end({status: 'success', quizzes: savedQuizzes});
            } else {
                res._end({status: 'false', message: 'Quizzes were not added', quizzes: savedQuizzes});
            }

        }).catch(err => {
            console.log(err);
        });
    });
}

function createQuizzes(rows, user) {
    const gettableFields = ['Subject', 'Grade', 'Points'];
    let quiz = new Quiz();
    let quizzes = [];
    return new Promise((resolve) => {

        return Promise.all(rows.map((row, index) => {
            const rowHaveFirstCell = !!row && !!row["No"];
            return new Promise(async (resolve, reject) => {
                if (rowHaveFirstCell) {
                    const isNewQuiz = row["No"].toLowerCase().indexOf("quiz") !== -1;
                    if (isNewQuiz) {
                        console.log("!!!!!!!!!!!");
                        if (quiz.author) {
                            quizzes.push(quiz);
                            quiz = new Quiz();
                        }
                        quiz.questions = [];
                        quiz.author = user._id;
                        quiz.title = row["Question"];
                        quiz.subtitle = "Subtitle";
                    } else {
                        if (gettableFields.some(field => field === row['No'])) {
                            switch (row["No"]) {
                                case "Subject":
                                    quiz.saveOptions.subject = row['Question'];
                                    break;
                                case "Grade":
                                    quiz.saveOptions.grade = row['Question'];
                                    break;
                                case "Points":
                                    quiz.points = row["Question"];
                                    break;
                                default:
                                    break;
                            }
                        } else {

                            let question = {
                                title: row["Question"],
                                variant: "options",
                                options: []
                            };

                            for (let key in row) {
                                if (key.indexOf('Option') !== -1) {
                                    question.options.push({
                                        value: row[key],
                                        description: rows[index + 1][key]
                                    });
                                }
                                if (key === 'Réponse') {
                                    switch (row[key].charCodeAt(0)) {
                                        case 65 :
                                            question.answer = question.options[0].value;
                                            break;
                                        case 66 :
                                            question.answer = question.options[1].value;
                                            break;
                                        case 67 :
                                            question.answer = question.options[2].value;
                                            break;
                                        case 68 :
                                            question.answer = question.options[3].value;
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                            if (!question.options.every(o => !o.value)) {
                                quiz.questions.push(question);
                            }

                        }
                    }
                } else {

                }
                if (index === rows.length - 1) {
                    quizzes.push(quiz);
                }
                resolve(row);
            });
        })).then(() => {
            return Promise.all(quizzes.map(q => {
                return new Promise(async resolve => {
                    if (!q.subject) {
                        try {
                            q.subject = await getSubjectId(q.saveOptions.subject);
                        } catch (err) {
                            q.subject = q.saveOptions.subject;
                        }
                    }
                    if (!q.grade) {
                        try {
                            let grade = await getGrade((q.saveOptions.grade));
                            q.grade = grade;
                            q.grades.push(grade);
                        } catch (err) {
                            q.grade = q.saveOptions.grade;
                            q.grades.push(q.saveOptions.grade);
                        }
                    }
                    resolve(q);
                });
            }));
        }).then(newQuizzes => {
            resolve(newQuizzes);
        });
    });

}


function searchQuizzes(req, res) {
    //Student search quiz by subject and grade
    Quiz
        .find({subject: req.query.id, $or: [{grade: req.user.grade}, {grades: req.user.grade}]})
        .populate('grade subject')
        .exec((err, quizzes) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({quizzes: quizzes});
        })
}

function saveQuizToDataBase(quiz) {
    return new Promise((resolve, reject) => {
        quiz.save();
        resolve(quiz);
    });
}

function addOptions() {
    Quiz.find({saveOptions: {$exists: true}, subject: {$exists: false}, grade: {$exists: false}}, (err, quiz) => {
        if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
        if (!quiz || quiz.length === 0) {
            console.log("no quizzez found");
        } else {
            quiz.map(async (q) => {
                try {
                    q.subject = await getSubjectId(q.saveOptions.subject);
                    let grade = await getGrade(q.saveOptions.grade);
                    q.grade = grade;
                    q.grades.push(grade);
                    q.save();
                } catch (err) {
                    console.log('sorry for err');
                }
            });
        }
    });
}

function getSubjectId(subj) {

    return new Promise((resolve, reject) => {
        return Subject.findOne({'name.en': subj}, (err, subject) => {
            if (err || subject === null) reject("sorry for err");
            if (subject) {
                resolve(subject._id);
            }
        });
    });

}

function getGrade(gr) {
    return new Promise((resolve, reject) => {
        return Grade.findOne({category: gr}, (err, grade) => {
            if (err || grade === null) reject("sorry for err");
            if (!!grade) {
                resolve(grade._id);
            }
        });
    });
}
