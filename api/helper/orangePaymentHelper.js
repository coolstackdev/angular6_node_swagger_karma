const request = require('request');
const SE = require('../../config/error.config');
const randomstring = require('randomstring');
const Transaction = require('../models/TransactionModel');

const ORANGE_CONSUMER_KEY = process.env.ORANGE_CONSUMER_KEY;
const ORANGE_MERCHANT_KEY = process.env.ORANGE_MERCHANT_KEY;
const ORANGE_CURRENCY = process.env.ORANGE_CURRENCY;
const ORANGE_GET_TOKEN_ENDPOINT = process.env.ORANGE_GET_TOKEN_ENDPOINT;
const ORANGE_GET_REDIRECTION_ENDPOINT = process.env.ORANGE_GET_REDIRECTION_ENDPOINT;

module.exports = {
    getConsumerToken: getConsumerToken,
    orangePaymentMethod: orangePaymentMethod,
};

/**
 * 1. Get orange token - getConsumerToken
 * 2. Get orange redirect link - getRedirectionURL
 * 3.
 */

function orangePaymentMethod(user, amount, points) {
    return new Promise((resolve, reject) => {
        getConsumerToken(user, amount, points)
            .then(data => getRedirectionURL(...data))
            .then(sendOrangeURL)
            .catch(e => {
                reject(new SE(e, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND))
            });

        function sendOrangeURL(data) {
            resolve({paymentUrl: data.payment_url})
        }
    });
}

function getConsumerToken(user, amount, points) {
    let headers = {
        'accept': 'application/json',
        'Authorization': 'Basic ' + ORANGE_CONSUMER_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const options = {
        uri: ORANGE_GET_TOKEN_ENDPOINT,
        method: 'POST',
        headers: headers,
        form: {
            'grant_type': 'client_credentials'
        }
    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) return reject(error);

            if (body.hasOwnProperty('error')) {
                return reject(body.error);
            }
            resolve([user, amount, points, body]);
        });
    })
}

function getRedirectionURL(user, amount, points, tokenData) {
    const token = JSON.parse(tokenData);
    const orderId = randomstring.generate(10);

    const json = {
        'merchant_key': ORANGE_MERCHANT_KEY,
        'currency': ORANGE_CURRENCY,
        'order_id': orderId,
        'amount': amount,
        'return_url': 'https://app.virtuprofs.com/api/orange/callback', // TODO: add to .env
        'cancel_url': 'https://app.virtuprofs.com/api/orange/cancel',  // TODO: add to .env
        'notif_url': 'https://app.virtuprofs.com/api/orange/notification',  // TODO: add to .env
        'lang': 'fr',
        'reference': 'VirtuProf'
    };

    const headers = {
        'Authorization': token.token_type + ' ' + token.access_token,
        'Content-Type': 'application/json',
        'Content-Lenght': JSON.stringify(json).length,
        'Cache-Control': 'no-cache',
        'Accept': 'application/json'
    };

    const options = {
        uri: ORANGE_GET_REDIRECTION_ENDPOINT,
        method: 'POST',
        headers: headers,
        json: json
    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) return reject(error);

            if (body.hasOwnProperty('error')) {
                return reject(body.error);
            }

            let transaction = new Transaction({
                notificationId: body.notif_token,
                type: 0,
                user: user,
                amount: amount,
                points: points,
                orderId: orderId
            });
            transaction.save();

            resolve(body);
        });
    })
}
