'use strict';
import express from 'express';
import Routes from './Routes';
import http from 'http';
import cors from 'cors';
//import helmet from 'helmet';

class Express {
    /**
     * Create the express object
     */
    public express: any;

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
        this.express.use(cors());
        this.express.set('trust proxy', 1);
        this.express.use(express.json({
            limit: 500000
        }));
        this.mountRoutes();
        this.express.use(express.urlencoded({
            limit: 500000,
            extended: true
        }));

        const port: number = parseInt(process.env.PORT || '80');

        const server = http.createServer(this.express);
        server.listen(port, () => {
            console.log(`The crypto honeypot detector server is running on port ${port}`);
        });
    }
}

/** Export the express module */
export default new Express();
