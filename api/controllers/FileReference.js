'use strict';

const FileReference = require('../models/FileReference');
const AWS = require('aws-sdk');
const bucket = process.env.S3_BUCKET;
const ServiceError = require('../../config/error.config');

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});

const s3 = new AWS.S3();
const Busboy = require('busboy');

exports.createFileReference = createFileReference;

function createFileReference(req, res) {
    var busboy = new Busboy({headers: req.headers});
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        let stream = [];
        file.on('data', function (data) {
            console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            stream.push(data);
        });
        file.on('end', function () {
            let filenameExtention = '.' + filename.split('.')[filename.split('.').length - 1];
            filename = req.user._id + '_' + new Date().getTime() + filenameExtention;

            const createItemObject = (callback) => {
                const params = {
                    Bucket: bucket,
                    Key: `${filename}`,
                    ACL: `public-read`,
                    Body: Buffer.concat(stream)
                };
                s3.putObject(params, function (err, data) {
                    callback(err, data)
                })
            };

            createItemObject((err, data) => {
                if (err) {
                    return res._end(new ServiceError('Invalid S3 function', ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_S3_PUTOBJECT));
                }

                let fileReference = {
                    name: filename,
                    contentType: mimetype,
                    size: 0,
                    url: `https://s3.eu-central-1.amazonaws.com/${bucket}/${filename}`
                };

                const fileReferenceDocument = new FileReference(fileReference);
                fileReferenceDocument.save()
                    .then((data) => {
                        res._end(data, null, data.url);
                    })
                    .catch((err) => {
                        return res._end(new ServiceError(err.message, ServiceError.STATUS.INTERNAL_SERVER_ERROR, ServiceError.CODE.ERROR_MONGODB_SAVING));
                    });
            });
        });
    });
    busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    req.pipe(busboy);
}
