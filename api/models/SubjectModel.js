const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
        name: {
            en: {
                type: String,
                required: true
            },
            fr: {
                type: String,
                required: true
            }
        },
        description: {
            type: String
        },
        icon: {
            type: String,
            required: true
        },
        costWeek: {
            type: Number,
            required: true
        },
        costMonth: {
            type: Number,
            required: true
        },
        costYear: {
            type: Number,
            required: true
        },
        callbackCost: {
            type: Number
        },
        questionCost: {
            type: Number
        },
        accessByGrade: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        }],
        isPrimary: Boolean,
        subjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }]
    },
    {timestamps: true});

module.exports = mongoose.model('Subject', subjectSchema);
