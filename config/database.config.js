const mongoose = require('mongoose');
mongoose.Promise = Promise;

exports.connect = function () {
    const c = {
        MongoDB: {
            url: process.env.MONGODB_URI
        }
    };
    const url = c.MongoDB.url;

    const options = {
        useCreateIndex: true,
        useNewUrlParser: true,
        keepAlive: 10
    };

    let db = mongoose.connection;

    db.on('error', function (err) {
        console.error('Error occurred while establishing new MongoDB connection. ' + err);
    });

    db.on('connected', function () {
        console.log(`Connected to MongoDB`);
    });

    function connect() {
        mongoose.connect(url, options);
    }

    connect();
};
