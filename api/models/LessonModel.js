const mongoose = require('mongoose');

require('./SubjectModel');
require('./GradeModel');
require('./UserModel');

const lessonSchema = new mongoose.Schema({
        title: String,
        subtitle: String,
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        grade: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        }],
        sections: [
            {
                title: String,
                subtitle: String,
                content: String,
                homework: [
                    {
                        title: String,
                        subtitle: String,
                        variant: String,
                        options: [
                            {
                                value: String,
                                answer: String
                            }
                        ],
                        answer: String,
                        answerDescription: String
                    }
                ]
            }
        ],
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        views: Number
    },
    {timestamps: true});

lessonSchema.post('findOne', (doc, next) => {
    if (!!doc) {
        doc.views = (doc.views) ? ++doc.views : 1;
        doc.save();
        next();
    } else {
        next();
    }

});

module.exports = mongoose.model('Lesson', lessonSchema);
