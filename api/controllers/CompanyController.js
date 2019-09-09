const Company = require('../models/CompanyModel');
const Balance = require('../models/BalanceModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    setCompany: setCompany,
    getCompanies: getCompanies,
    deleteCompany: deleteCompany,
    updateCompany: updateCompany
};

function setCompany(req, res) {
    let company = new Company();
    company.name = req.body.name;
    company.description = req.body.description;
    company.icon = req.body.icon;
    company.save();
    res._end({company: company});
}

function updateCompany(req, res) {
    Company
        .updateOne({_id: req.body._id}, req.body)
        .exec((err, company) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
            res._end({sucess: true});
        })
}

function getCompanies(req, res) {
    Company
        .find()
        .exec((err, companies) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({companies: companies});
        })
}

function deleteCompany(req, res) {
    Company
        .deleteOne({_id: req.query.company})
        .exec((err) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}
