const Idea = require('../models/IdeaModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    setIdea: setIdea,
    getIdeas: getIdeas
};

function setIdea(req, res) {
    let idea = new Idea(req.body);
    idea.author = req.user._id;
    Idea
        .findOneAndUpdate({_id: idea._id}, idea, {
            upsert: true,
            new: true
        })
        .exec((err, data) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            res._end({idea: data});
        })
}

function getIdeas(req, res) {
    Idea
        .find()
        .sort({createdAt: -1})
        .populate('author')
        .exec((err, ideas) => {
            if (err) return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
            return res._end({ideas: ideas});
        })
}
