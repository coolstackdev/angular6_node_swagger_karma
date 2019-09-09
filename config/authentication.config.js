const jwt = require('jsonwebtoken');
const User = require('../api/models/UserModel');

const ServiceError = require('./error.config');

module.exports = {
    auth: authPassport,
    authAdmin: authAdmin,
    authTeacher: authTeacher
};

function authPassport(req, callback) {
    if (req.headers.authorization) {
        let token = req.headers.authorization;

        jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
            if (err) {
                return callback(new ServiceError('Invalid Token', ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION));
            }

            User.findOne({_id: result.id})
                .populate('role')
                .exec((err, user) => {
                    if (err)
                        return callback(new ServiceError(err.message, ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION));
                    if (!user)
                        return callback(new ServiceError('User not found', ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                    if (user.isDeleted === true)
                        return callback(new ServiceError('This user is deleted', ServiceError.STATUS.NOT_FOUND, ServiceError.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                    if (user.role.level < 0 || user.role.level > 5)
                        return callback(new ServiceError(err.message, ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_PERMISSION));

                    req.user = user;
                    return callback();
                });
        });
    } else {
        return callback(new ServiceError('No authorization key', ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION));
    }
}

function authAdmin(req, callback) {
    if (req.headers.authorization) {
        let token = req.headers.authorization;

        jwt.verify(token, process.env.JWT_SECRET, function (err, result) {
            if (err) {
                return callback(new ServiceError('Invalid Token', ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION));
            }

            User.findOne({_id: result.id})
                .populate('role')
                .exec((err, user) => {
                    if (err)
                        return callback(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_AUTHORIZATION));
                    if (!user)
                        return callback(new ServiceError('User not found', ServiceError.STATUS.NOT_FOUND, ServiceError.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                    if (user.isDeleted === true)
                        return callback(new ServiceError('This user is deleted', ServiceError.STATUS.NOT_FOUND, ServiceError.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                    if (user.role.level !== 5)
                        return callback(new ServiceError('You have not the necessary permission', ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_PERMISSION));

                    req.user = user;
                    return callback();
                });
        });
    } else {
        return callback(new ServiceError('No authorization key', ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION));
    }
}

function authTeacher(req, callback) {
    if (req.headers.authorization) {
        let token = req.headers.authorization;

        jwt.verify(token, process.env.JWT_SECRET, function (err, result) {
            if (err) {
                console.log(result, ' result id');
                return callback(new ServiceError('Invalid Token', ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION));
            }

            User.findOne({_id: result.id})
                .populate('role')
                .exec((err, user) => {
                    if (err)
                        return callback(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_AUTHORIZATION));
                    if (!user)
                        return callback(new ServiceError('User not found', ServiceError.STATUS.NOT_FOUND, ServiceError.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                    if (user.isDeleted === true)
                        return callback(new ServiceError('This user is deleted', ServiceError.STATUS.NOT_FOUND, ServiceError.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
                    if (user.role.level < 3 || user.role.level > 5)
                        return callback(new ServiceError('You have not the necessary permission', ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_PERMISSION));

                    req.user = user;
                    return callback();
                });
        });
    } else {
        return callback(new ServiceError('No authorization key', ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_AUTHORIZATION));
    }
}
