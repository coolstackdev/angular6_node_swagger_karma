const passport = require('passport');
const jwt = require('jsonwebtoken');
const FB = require('fb');
const sendEmail = require('../helper/mailHelper');
const pug = require('pug');
const {google} = require('googleapis');

const User = require('../models/UserModel');
const Balance = require('../models//BalanceModel');
const Settings = require('../models/SettingsModel');
const ServiceError = require('../../config/error.config');

module.exports = {
    signup: signup,
    login: login,
    confirm: confirm,
    forgot: forgot,
    forgotRestore: forgotRestore,
    facebook: facebookToken,
    google: googleToken
};


function login(req, res, next) {
    if (!req.body.username || !req.body.password ) {
        return res._end(new ServiceError('Empty Credentials', ServiceError.STATUS.BAD_REQUEST, ServiceError.CODE.INVALID_AUTHORIZATION_EMPTY_CREDENTIALS));
    }
    req.body.username = req.body.username.toLowerCase();

    passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_AUTHORIZATION));
        }

        if (!user) {
            return res._end(new ServiceError(info.message, ServiceError.STATUS.METHOD_NOT_ALLOWED, ServiceError.CODE[info.errorCode]));
        }

        let token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        user.password = undefined;
        user.__v = undefined;

        res._end({
            token: token,
            user: user
        });
    })(req, res, next);
}

function facebookToken(req, res) {
    if (req.body.accessToken) {
        req.body.access_token = req.body.accessToken;
        ProceedWithToken();
    } else {
        FB.api('oauth/access_token', {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: req.body.authorizationData.redirect_uri,
            code: req.body.oauthData.code
        }, function (result) {
            req.body = result;
            ProceedWithToken();
        });
    }

    function ProceedWithToken() {
        passport.authenticate('facebook-token', function (err, user, info) {
            if (err) {
                return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_AUTHORIZATION));
            }

            if (!user) {
                return res._end(new ServiceError(info.message, ServiceError.STATUS.METHOD_NOT_ALLOWED, ServiceError.CODE[info.errorCode]));
            }

            let token = jwt.sign({
                id: user._id,
                facebookId: user.facebookId,
                network: 'facebook'
            }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            let tok = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            let link = `${process.env.BASE_URL}api/confirm?token=${tok}`;
            let html = pug.compileFile(__dirname + '/../templates/confirmationEmail.pug', null);

            html = html({
                confirmationLink: link
            });

            //console.log(html);

            let mailOptions = {
                to: user.email,
                title: 'Registration confirmation',
                content: html
            };
            // console.log('mailOptions = ', mailOptions);
            if (!user.isActive) {
                sendEmail(mailOptions);
            }

            user.password = undefined;
            user.__v = undefined;

            res._end({
                token: token,
                user: user
            });
        })(req, res);
    }
}

function googleToken(req, res) {
    if (req.body.accessToken) {
        req.body.access_token = req.body.accessToken;
        ProceedWithToken();
    } else {
        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, req.body.authorizationData.redirect_uri);
        oauth2Client.getToken(req.body.oauthData.code, function (err, tokens) {
            req.body = tokens;
            ProceedWithToken();
        });
    }

    function ProceedWithToken() {
        passport.authenticate('google-token', function (err, user, info) {
            if (err) {
                return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.INVALID_AUTHORIZATION));
            }

            if (!user) {
                return res._end(new ServiceError(info.message, ServiceError.STATUS.METHOD_NOT_ALLOWED, ServiceError.CODE[info.errorCode]));
            }

            let token = jwt.sign({
                id: user._id,
                googleId: user.googleId,
                network: 'google'
            }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            let tok = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            let link = `${process.env.BASE_URL}api/confirm?token=${tok}`;
            let html = pug.compileFile(__dirname + '/../templates/confirmationEmail.pug', null);

            html = html({
                confirmationLink: link
            });

            //console.log(html);

            let mailOptions = {
                to: user.email,
                title: 'Registration confirmation',
                content: html
            };
            // console.log('mailOptions = ', mailOptions);
            if (!user.isActive) {
                sendEmail(mailOptions);
            }


            user.password = undefined;
            user.__v = undefined;

            res._end({
                token: token,
                user: user
            });
        })(req, res);
    }
}

function signup(req, res, next) {
    if (!req.body.email || req.body.email === null) {
        req.body.email = req.body.phone + '@vp.com';
    }
    passport.authenticate('local-signup', function (err, user) {
        if (err) return res._end(err);
        // let cashFlow;
        // Settings
        //     .findOne({name: 'referralAmount'})
        //     .exec((err, amount) => {
        //         if (err) return res._end(new ServiceError(err, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
        //         if (amount && amount.value > 0) {
        //             cashFlow = amount.value;
        //             console.log("trueeeeeeeeee");
        //         }
        //     });
        if (user) {
            Settings
                .findOne({name: 'referralAmount'})
                .exec((err, amount) => {
                    if (err) return res._end(new ServiceError(err, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
                    if (amount && amount.value > 0) {
                        if (user.referral) {
                            User
                                .findOne({_id: user._id})
                                .exec((err, usr) => {
                                    if (err) return res._end(new ServiceError(err, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
                                    if (!!usr) {
                                        usr.referral = user.referral;
                                        usr.firstSubscriptionDone = true;
                                        usr.save();

                                        let balance = new Balance();
                                        balance.cashFlow = amount.value;
                                        balance.user = user.referral;
                                        balance.type = 8;
                                        balance.status = false;
                                        balance.referralFrom = req.user._id;
                                        balance.paymentStatus = 0;
                                        balance.save();

                                        let balanceSecond = new Balance();
                                        balanceSecond.cashFlow = amount.value;
                                        balanceSecond.user = req.user._id;
                                        balanceSecond.type = 8;
                                        balanceSecond.status = false;
                                        balanceSecond.referralTo = user.referral;
                                        balanceSecond.paymentStatus = 0;
                                        balanceSecond.save();
                                    }
                                });
                        }
                    } else {
                        if (user.referral) {
                            User
                                .findOne({_id: user._id})
                                .exec((err, usr) => {
                                    if (err) return res._end(new ServiceError(err, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));
                                    if (!!usr) {
                                        usr.referral = user.referral;
                                        usr.save();
                                    }
                                })
                        }}
                });
            let token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            let link = `${process.env.BASE_URL}api/confirm?token=${token}`;
            let html = pug.compileFile(__dirname + '/../templates/confirmationEmail.pug', null);

            html = html({
                confirmationLink: link
            });

            //console.log(html);

            let mailOptions = {
                to: user.email,
                title: 'Registration confirmation',
                content: html
            };
            // console.log('mailOptions = ', mailOptions);
            if (!user.isActive) {
                sendEmail(mailOptions);
            }

            res._end({
                token: token,
                user: user
            });
        }
    })(req, res, next);
}

function confirm(req, res) {
    jwt.verify(req.query.token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            res.redirect(`${process.env.BASE_URL}login`);
        } else {
            User.findById(decoded.id, function (error, user) {
                user.isActive = true;
                user.save();
                let mailOptions = {
                    to: user.email,
                    title: 'Welcome to VirtuProfs',
                    content: `We are happy you are using our service.`
                };
                sendEmail(mailOptions);
                res.redirect(`${process.env.BASE_URL}login`);
            })
        }
    })
}

function forgot(req, res) {
    const username = req.body.username.toLowerCase();

    if (!username) {
        return res._end(new ServiceError('Please, fill email or username', ServiceError.STATUS.BAD_REQUEST, ServiceError.CODE.ERROR_EMPTY_EMAIL_USERNAME));
    }

    User.findOne({$or: [{email: username}, {username: username}]})
        .exec((err, user) => {
            if (err)
                return res._end(new ServiceError(err, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_FIND));

            if (!user)
                return res._end(new ServiceError('User with this username or email was not found', ServiceError.STATUS.NOT_FOUND, ServiceError.CODE.ERROR_USER_WAS_NOT_FOUND));

            let token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
                expiresIn: 3600
            });
            user.forgotToken = token;
            user.save();

            let mailOptions = {
                to: user.email,
                title: 'VirtuProfs: Recover password',
                content: `To change password follow this link: ${process.env.BASE_URL}forgot-password?token=${token}<br>Link expires in 1 hour.`
            };
            sendEmail(mailOptions);
            return res._end({success: true});
        });
}

function forgotRestore(req, res) {
    if (!req.body.token || !req.body.pw)
        return res._end(new ServiceError('Please, fill token and password', ServiceError.STATUS.BAD_REQUEST, ServiceError.CODE.ERROR_EMPTY_TOKEN_PASSWORD));

    let token = req.body.token,
        password = req.body.pw;

    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err)
            return res._end(new ServiceError(err.message, ServiceError.STATUS.NOT_AUTHORIZED, ServiceError.CODE.INVALID_TOKEN));

        User.findById(decoded.id)
            .exec((err, user) => {
                if (err)
                    return res._end(new ServiceError(err, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_SERVER));

                if (!user)
                    return res._end(new ServiceError('User was not found', ServiceError.STATUS.NOT_FOUND, ServiceError.CODE.ERROR_USER_WAS_NOT_FOUND));

                user.password = user.generateHash(password);
                user.save();

                return res._end({success: true});
            })
    })
}
