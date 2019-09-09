const Grade = require('../models/GradeModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    setGrade: setGrade,
    getGrades: getGrades,
    deleteGrades: deleteGrades
};

function setGrade(req, res) {
    const grade = new Grade(req.body);
    Grade
        .findOneAndUpdate({_id: grade._id}, grade, {
            upsert: true,
            new: true
        })
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
            res._end({grade: data});
        });
}

function getGrades(req, res) {
    Grade
        .find()
        .exec((err, grades) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({grades: grades});
        });
}


function deleteGrades(req, res) {
    let ids = req.query.ids.split(',');
    Grade
        .deleteMany({'_id': {$in: ids}})
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}

