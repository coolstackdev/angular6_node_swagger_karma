const User = require('../models/UserModel');
const School = require('../models/SchoolModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    getSchools: getSchools,
    setSchool: setSchool,
    // createSchool: createSchool,
    // readSchools: readSchools,
    // getSchool: getSchool,
    // updateSchool: updateSchool,
    deleteSchool: deleteSchool,
    searchSchool: searchSchool
};

function getSchools(req, res) {
    School
        .find()
        .exec((err, schools) => {
            res._end({schools: schools});
        })
}

function setSchool(req, res) {
    const school = new School(req.body);
    School
        .findOneAndUpdate({_id: school._id}, school, {
            upsert: true,
            new: true
        })
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({school: data});
        });
}

function createSchool(req, res) {
    // let newSchool = new School();
    // newSchool.name = req.body.name;
    // newSchool.email = req.body.email;
    // newSchool.city = req.body.city;
    // User.findOne({_id: req.body._id}, function (err, user) {
    //     if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
    //     newSchool.creator = user;
    // });
    //
    // newSchool.save(function (err) {
    //     if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
    //     res._end({newSchool});
    // })
    res._end();
}

function readSchools(req, res) {
    // School.find({}, function (err, schools) {
    //     if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
    //     if (!schools) return res._end({success: false, message: "Schools not found"});
    //     if (schools) return res._end({success: true, schools: schools});
    // })
    res._end();
}

function getSchool(req, res) {
    // School.findOne({name: req.body.schoolname}, function (err, school) {
    //     if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
    //     if (!school) return res._end({success: false, message: "School not found"});
    //     return res._end({success: true, school: school});
    // });
    res._end();
}

function updateSchool(req, res) {
    // let newSchool = req.body;
    // User.findOneAndUpdate({'_id': req.body._id}, newSchool, {new: true})
    //     .exec((err, school) => {
    //         if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
    //         if (!school) return res._end(new ServiceError('School was not found', ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
    //
    //         return res._end(school);
    // });
    res._end();
}

function deleteSchool(req, res) {
    let ids = req.query.ids.split(',');
    School
        .deleteMany({'_id': {$in: ids}})
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}

function searchSchool(req, res) {
    let query = new RegExp(req.query.filter, 'i');
    School
        .find({
            $or: [{'name': {$regex: query}}, {'address': {$regex: query}}]
        })
        .exec((err, schools) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({'schools': schools})
        })
}
