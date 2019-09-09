const SettingsModel = require('../models/SettingsModel');
const SE = require('../../config/error.config');

module.exports = {
    setSettings: setSettings,
    getSettings: getSettings,
    changeReferralType: changeReferralType
};

function setSettings(req, res) {
    const settings = new SettingsModel(req.body);
    SettingsModel
        .findOneAndUpdate({_id: req.body._id}, settings, {
            new: true
        })
        .exec((err, settings) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({settings: settings});
        })
}

function getSettings(req, res) {
    SettingsModel
        .find()
        .exec((err, settings) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({settings: settings});
        });
}

function changeReferralType(req, res) {
    SettingsModel
        .findOne({name: 'referralAmount'})
        .exec((err, setting) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            if (setting) {
                if (req.body.value > 0){
                    setting.value = req.body.value;
                    setting.percent = 0;
                    setting.save();
                    console.log("Referral now in static value mode");
                } else {
                    if (req.body.percent > 0) {
                        setting.percent = req.body.percent;
                        setting.value = 0;
                        setting.save();
                        console.log("Referral now in percent mode");
                    }
                }
                res._end({success: true, message: "Referral mode changed"});
            }
        })
}
