'use strict';
const LocalStrategy = require('passport-local').Strategy,
    FacebookTokenStrategy = require('passport-facebook-token'),
    GoogleTokenStrategy = require('passport-google-token').Strategy,
    async = require('async');

const User = require('../api/models/UserModel'),
    Role = require('../api/models/RoleModel'),
    Grade = require('../api/models/GradeModel'),
    Balance = require('../api/models/BalanceModel'),
    School = require('../api/models/SchoolModel'),
    ServiceError = require('./error.config'),
    sendEmail = require('../api/helper/mailHelper');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    function validateEmail(email) {
        var test = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return test.test(String(email).toLowerCase());
    }

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        process.nextTick(function () {
            User.findOne({email: email, isDeleted: true}, (err, usr) => {
                if (err) return done(err);
                if (!!usr) {
                    usr.isDeleted = false;
                    usr.isActive = true;
                    usr.password = usr.generateHash(req.body.password);
                    usr.phone = req.body.phone;
                    Balance.deleteMany({'user': usr._id}).exec(console.log());
                    usr.save(function (err) {
                        if (err) return done(err);
                        return done(null, usr);
                    })
                } else {
                    User.findOne({phone: req.body.phone, countryCode: req.body.countryCode}, (err, us) => {
                        if (err) return done(new ServiceError(err, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
                        if (us) return done(new ServiceError("This phone is already in use", ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_PHONE_ALREADY_TAKEN));
                        if (validateEmail(email) === false) {
                            return done(new ServiceError('Please, use correct email.', ServiceError.STATUS.CONFLICT, ServiceError.CODE.INVALID_EMAIL), false);
                        } else {
                            User.findOne({email: req.body.email}, {__v: 0, _id: 0, password: 0}, (err, user) => {
                                if (err)
                                    return done(err);
                                if (user)
                                    return done(new ServiceError('That email is already taken', ServiceError.STATUS.CONFLICT, ServiceError.CODE.ERROR_USERNAME_ALREADY_TAKEN), false);

                                async.waterfall([
                                    (callback) => {
                                        Role.findOne({level: 0})
                                            .exec((err, studentRole) => {
                                                if (err) return callback(err);
                                                callback(null, studentRole)
                                            })
                                    },
                                    (studentRole, callback) => {
                                        let newUser;
                                        newUser = new User();
                                        if (req.body.referral && req.body.referralCode) {
                                            let refNumber = req.body.referral;
                                            let referralCode = req.body.referralCode;
                                            delete req.body.referral;
                                            delete req.body.referralCode;
                                            Object.assign(newUser, req.body);
                                            User
                                                .findOne({phone: refNumber, countryCode: referralCode})
                                                .exec((err, ref) => {
                                                    if (err) console.log('Referral not found');
                                                    if (!!ref) {
                                                        newUser.referral = ref._id;
                                                    }
                                                });
                                        } else {
                                            Object.assign(newUser, req.body);
                                        }
                                        newUser.email = req.body.email;
                                        newUser.username = req.body.username;
                                        newUser.password = newUser.generateHash(password);
                                        newUser.isActive = false;
                                        newUser.role = studentRole;
                                        let id;
                                        if (newUser.schoolName && !newUser.school) {
                                            let school = new School();
                                            school.name = newUser.schoolName;
                                            school.save();
                                            let mailOptions = {
                                                to: 'cedric.in@gmail.com',
                                                title: 'New school VirtuProfs',
                                                content: 'Please, review this school: ' + newUser.schoolName + ' and edit if needed.'
                                            };
                                            sendEmail(mailOptions);
                                            console.log("email sent");
                                            id = school._id;
                                        }
                                        id ? newUser.school = id : newUser.school = req.body.school;


                                        newUser.save(function (err) {
                                            if (err) return callback(err);
                                            req.user = newUser;
                                            newUser.__v = undefined;
                                            newUser.password = undefined;
                                            callback(null, newUser);
                                        });
                                    }
                                ], (err, newUser) => {
                                    if (err)
                                        return done(err);
                                    return done(null, newUser);
                                });
                            });
                        }
                    });
                }
            });

        })
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, username, password, done) {
        User.findOne({
            $or: [
                {email: username}, {username: username}, {countryCode: req.body.username.substring(0, 4), phone: req.body.username.substring(4, 15) }
            ]
        }).populate('role referral').select('+password').exec((err, user) => {
            if (err) {
                return done(err);
            }
            
            if (!user) {
                return done(null, false, req.localStrategyResponse = {
                    message: 'User not found.',
                    errorCode: 'INVALID_AUTHORIZATION_USERNOTFOUND'
                });
            }
            if (user.isDeleted === true) {
                Balance.deleteMany({'user': user._id}).exec(console.log);
                user.isDeleted = false;
                user.isActive = true;
                user.save(console.log);
            }

            if (!user.validPassword(password)) {
                return done(null, false, req.localStrategyResponse = {
                    message: 'Wrong password.',
                    errorCode: 'INVALID_AUTHORIZATION_PASSWORD'
                });
            }
            return done(null, user);
        });
    }));

    passport.use(new FacebookTokenStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET
        }, function (accessToken, refreshToken, profile, done) {
            Grade.findOne({category: 'Beginner'}, (err, grade) => {
                const UserProfile = {
                    username: profile.emails[0].value,
                    email: profile.emails[0].value,
                    name: profile.name.givenName,
                    lastName: profile.name.familyName,
                    photo: profile.photos[0].value,
                    facebookId: profile.id,
                    // grade: grade._id
                };
                User.findOneAndUpdate({email: UserProfile.email}, UserProfile, {
                    upsert: true,
                    new: true
                }).populate('role').exec((err, user) => {
                    if (err) {
                        console.log(err);
                        return done(null, false, {
                            message: 'User not found.',
                            errorCode: 'INVALID_AUTHORIZATION_USERNOTFOUND'
                        });
                    }

                    if (!user) {
                        return done(null, false, req.localStrategyResponse = {
                            message: 'User not found.',
                            errorCode: 'INVALID_AUTHORIZATION_USERNOTFOUND'
                        });
                    }

                    if (user.isDeleted === true) {
                        Balance.deleteMany({'user': user._id});
                        user.isDeleted = false;
                        user.save(console.log);
                    }
                    if (user.role) {
                        return done(null, user);
                    } else {
                        Role.findOne({level: 0}).exec((err, role) => {
                            user.set({role: role});
                            user.save(err => {
                                return done(null, user);
                            });
                        });
                    }
                });
            });
        }
    ));

    passport.use(new GoogleTokenStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        },
        function (accessToken, refreshToken, profile, done) {
            Grade.findOne({category: 'Beginner'}, function (err, grade) {
                if (err) console.log('___________________________');
                const UserProfile = {
                    username: profile.emails[0].value,
                    email: profile.emails[0].value,
                    name: profile.name.givenName,
                    lastName: profile.name.familyName,
                    googleId: profile.id,
                };

                User.findOneAndUpdate({email: UserProfile.email}, UserProfile, {
                    upsert: true,
                    new: true
                }).populate('role').exec((err, user) => {
                    if (err) {
                        console.log(err);
                        return done(null, false, {
                            message: 'User not found.',
                            errorCode: 'INVALID_AUTHORIZATION_USERNOTFOUND'
                        });
                    }

                    if (!user) {
                        return done(null, false, req.localStrategyResponse = {
                            message: 'User not found.',
                            errorCode: 'INVALID_AUTHORIZATION_USERNOTFOUND'
                        });
                    }

                    if (user.isDeleted === true) {
                        Balance.deleteMany({'user': user._id});
                        user.isDeleted = false;
                        user.save(console.log("!!!"));
                    }
                    if (user.role) {
                        return done(null, user);
                    } else {
                        Role.findOne({level: 0}).exec((err, role) => {
                            user.set({role: role});
                            user.save(err => {
                                return done(null, user);
                            });
                        });
                    }
                });
            })
        }
    ));
};
