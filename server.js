'use strict';
require('dotenv').load();

const SwaggerExpress = require('swagger-express-mw'),
    SwaggerUi = require('swagger-tools/middleware/swagger-ui');

const bodyParser = require('body-parser'),
    compression = require('compression'), 
    express = require('express'),
    jwt = require('jsonwebtoken'), 
    path = require('path'),
    passport = require('passport'),
    i18n = require("i18n");

require('./config/passport.config')(passport);

if (process.env.NODE_ENV === 'production') {
    const Rollbar = require('rollbar');
    const rollbar = new Rollbar({
        accessToken: '64363c5af7564940a551b7632390712a',
        captureUncaught: true,
        captureUnhandledRejections: true
    });
}

const verifyUser = require('./config/authentication.config').auth;
const verifyAdmin = require('./config/authentication.config').authAdmin;
const verifyTeacher = require('./config/authentication.config').authTeacher;
const subscriptions = require('./api/controllers/SubscriptionController');

i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/src/assets/i18n',
    defaultLocale: 'en',
    register: global,
    objectNotation: true
});

const DB = require('./config/database.config'),
    app = express(),
    appConfig = {
        appRoot: __dirname,
        swaggerSecurityHandlers: {
            passport: (req, params, token, cb) => {
                verifyUser(req, (err) => {
                    if (err)
                        return cb(err);
                    cb.apply();
                });
            },
            admin: (req, params, token, cb) => {
                verifyAdmin(req, (err) => {
                    if (err)
                        return cb(err);
                    cb.apply();
                });
            },
            teacher: (req, params, token, cb) => {
                verifyTeacher(req, (err) => {
                    if (err)
                        return cb(err);
                    cb.apply();
                });
            }
        }
    };

app.use(i18n.init);
app.use(bodyParser.json({limit: 10 * 1024 * 1024}));
app.use(passport.initialize({}));
app.use(express.static(__dirname + '/dist/virtuprofs'));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, token-refresh');
    res.header('Access-Control-Expose-Headers', 'Origin, X-Requested-With, Content-Type, Accept, token-refresh');
    next();
});
app.get('/api/confirm', require('./api/controllers/Authorization').confirm);
// app.get('/virtuprofs/froala/integration/*', function (req, res) {
//     console.log(req);
//     var request = require('request');
//     request.post({url: 'https://pascalium.pp.ua' + req.url}, function (error, response, body) {
//         console.log('error:', error); // Print the error if one occurred
//         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         console.log('body:', body); // Print the HTML for the Google homepage.
//         res.json({ok: 'ok'});
//     });
// });
app.get('/*', function (req, res, next) {
    if (req.originalUrl.match(/\/docs/g) || req.originalUrl.match(/\/api/g) || req.originalUrl.match(/\/api-docs/g)) {
        next();
    } else {
        res.sendFile(path.join(__dirname + '/dist/virtuprofs/index.html'));
    }
});
app.use(compression());

SwaggerExpress.create(appConfig, function (err, swaggerExpress) {
    if (err) {
        throw err;
    }

    app.use((req, res, next) => {
        res._end = (obj, statusCode, link) => {
            if (!obj) {
                obj = {};
            }
            statusCode = statusCode || 200;

            if (obj instanceof Error || obj.statusCode) {

                const ServiceError = require('./config/error.config');
                if (!(obj instanceof ServiceError)) {
                    obj = new ServiceError(obj);
                }

                res.statusCode = obj.statusCode;
                let response = {
                    success: false,
                    message: obj.message,
                    errorCode: obj.errorCode,
                    errorStack: obj.errors
                };
                res.json(response);
                return;
            }

            if (req.user) {
                let token = jwt.sign({id: req.user._id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                res.set('token-refresh', token);
            }

            res.statusCode = statusCode;

            const response = {
                success: statusCode >= 200 && statusCode <= 299,
                code: 1,
                data: obj
            };
            if (link) {
                response.link = link;
            }

            res.json(response);
        };
        next();
    });
    app.use((req, res, next) => {
        if (!req.swagger) {
            next();
            return;
        }

        let params = {};

        for (const param in req.swagger.params) {
            params[param] = req.swagger.params[param].value;
        }

        req.parameters = params;
        next();
    });

    app.use(SwaggerUi(swaggerExpress.runner.swagger));
    swaggerExpress.register(app);

    const port = process.env.PORT || 5100;
    const SERVER = app.listen(port, () => {
        console.log(`Server is working on ${port}`);
        DB.connect();
        require('./config/socket.config.js').sockets(app, SERVER);
        subscriptions.findEnding();
    });
});
