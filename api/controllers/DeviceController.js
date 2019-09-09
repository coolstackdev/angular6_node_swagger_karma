'use strict';

const DeviceModel = require('../models/DeviceModel');
const SE = require('../../config/error.config');

module.exports = {
    registerDevice: registerDevice
};

function registerDevice(req, res) {
    let newDevice = new DeviceModel(req.swagger.params.deviceInfo.value);
    newDevice.user = req.user._id;
    newDevice.save()
        .then(() => {
            res._end({message: 'Device was registered'})
        })
        .catch(err => {
            if (err)
                return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_SERVER));
        });
}
