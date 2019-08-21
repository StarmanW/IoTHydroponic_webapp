'use strict';

const CONFIG = require('../config.json'),
    express = require('express');

class Server {
    constructor() {
        // Set port
        this._port = CONFIG.server.port || 8000;
    }

    initServer() {
        // Create express app
        const app = express();

        // Set static folder
        app.use(express.static('public'));
        
        // Create express server
        this._serv = app.listen(this._port, () => {
            // Create chat socket
            console.log(`Server started on port ${this._port}`);
        });
    }
}

module.exports = Server;
