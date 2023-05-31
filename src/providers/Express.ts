'use strict';
import express from 'express';
import Routes from './Routes';
import http from 'http';
import cors from 'cors';

class Express {
    /**
     * Create the express object
     */
    public express: express.Application;

    /**
     * Initializes the express server
     */
    constructor() {
        this.express = express();
    }

    /**
     * Mounts all the defined routes
     */
    private mountRoutes(): void {
        this.express = Routes.mountRoutes(this.express);
    }

    /**
     * Starts the express server
     */
    public async init() {
        this.mountRoutes();

        const options = {
            origin: ['*', 'https://pulsedexv4-dev.netlify.app'],
            methods: ['POST', 'GET', 'PUT', 'DELETE'],
            preflightContinue: false,
            optionsSuccessStatus: 200 // Some legacy browsers choke on 204
        };
        this.express.use(cors(options));

        this.express.use(express.json({
            limit: 500000
        }));

        this.express.use(express.urlencoded({
            limit: 500000,
            extended: true
        }));

        const port: number = parseInt(process.env.PORT || '80');

        const server = http.createServer(this.express);

        // Start the server on the specified port
        server.listen(port, () => {
            console.log(`The crypto honeypot detector server is running on port ${port}`);
        });
    }
}

/** Export the express module */
export default new Express();
