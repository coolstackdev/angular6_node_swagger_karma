const BugReport = require('../models/BugReportModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    setBugReport: setBugReport,
    getBugs: getBugs
};

function setBugReport(req, res) {
    let bug = new BugReport(req.body);
    bug.author = req.user._id;
    BugReport
        .findOneAndUpdate({_id: bug._id}, bug, {
            upsert: true,
            new: true
        })
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({bug: data});
        })
}

function getBugs(req, res) {
    BugReport
        .find()
        .populate('author')
        .sort({createdAt: -1})
        .exec((err, bugs) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            return res._end({bugs: bugs});
        })
}
