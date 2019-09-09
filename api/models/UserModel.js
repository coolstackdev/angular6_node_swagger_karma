const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

require('./RoleModel');
require('./SchoolModel');
require('./GradeModel');
require('./ReferralModel');
require('./SubjectModel');

// const validatePhone = function(phone) {
//     const re = /[0-9]{1,}/g;
//     console.log(re.test(phone));
//     return re.test(phone)
// };

const userSchema = new mongoose.Schema({
        username: {
            type: String,
            unique: true,
            trim: true,
            sparse: true
        },
        password: {
            type: String,
            select: false
        },
        name: {
            type: String
        },
        lastName: {
            type: String
        },
        countryCode: {
            type: String
        },
        phone: {
            type: String,
            trim: true,
            // validate: [validatePhone, 'Please fill a valid phone number'],
        },
        avatar: {
            type: String
        },
        birthday: {
            type: Date
        },
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        },
        subjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject'
            }
        ],
        gender: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        email: {
            type: String,
            unique: true
        },
        isActive: {
            type: Boolean
        },
        // class_level: String,
        // subject: String,
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        },
        referral: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'

            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: 'Referral'
        },
        firstSubscriptionDone: {
            type: Boolean,
            default: false
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        },
        schoolName: {
            type: String
        },
        facebookId: {
            type: String
        },
        googleId: {
            type: String
        },
        forgotToken: String,
        language: {
            type: String,
            default: 'en'
        }
    },
    {timestamps: true});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.path('phone').validate(function (phone) {
    const regex = /^([0-9]{1,})?$/;
    return regex.test(phone); // Assuming email has a text attribute
}, 'Please fill a valid phone number');

module.exports = mongoose.model('User', userSchema);
