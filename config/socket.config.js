const initEvents = require('../api/events/init.events');

/**
 * Init web socket.io
 * @param app
 * @param server
 */
exports.sockets = function (app, server) {
    const io = require('socket.io')(server);

    //For global using sockets
    global.io = io;
    app.set('socketio', io);

    io.on('connection', function (socket) {
        initEvents.init.join(io, socket);
        initEvents.init.disconnect(io, socket);

        // chat.init(io, socket);
    });
};
