const Role = require('../models/RoleModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    getRoles: getRoles,
    getRole: getRole
};

function getRoles(req, res) {
    Role
        .find({'code': {$ne: 'admin'}})
        .exec((err, roles) => {
            if (err) return res._end(new ServiceError(err, ServiceError.STATUS.BAD_REQUEST, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({roles: roles});
        })
}

function getRole(req, res) {
    res._end({'level': req.user.role.level});
}
