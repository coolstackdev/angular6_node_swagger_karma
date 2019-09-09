const Referral = require('../models/ReferralModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    setReferral: setReferral,
    getReferrals: getReferrals,
    deleteReferral: deleteReferral
};

function setReferral(req, res) {
    const referral = new Referral(req.body);
    Referral
        .findOneAndUpdate({_id: referral._id}, referral, {
            upsert: true,
            new: true
        })
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({referral: data});
        });
}

function getReferrals(req, res) {
    Referral
        .find()
        .exec((err, referrals) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({referrals: referrals});
        });
}


function deleteReferral(req, res) {
    let ids = req.query.ids.split(',');
    Referral
        .deleteMany({'_id': {$in: ids}})
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}

