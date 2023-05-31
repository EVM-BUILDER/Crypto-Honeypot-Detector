'use strict';
import express from 'express';
import Routes from './Routes';
import http from 'http';
import cors from 'cors';
// import helmet from 'helmet';

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
        const options = {
            origin: ['*'],
            methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
            preflightContinue: true,
            credentials: false,
            maxAge: 300,
            optionsSuccessStatus: 200 // Some legacy browsers choke on 204
        };
        this.express.use(cors(options));

        this.mountRoutes();
        this.express.set('trust proxy', 1);
        
        // this.express.use(helmet.referrerPolicy({policy: 'same-origin'}));
        // this.express.use(helmet.crossOriginOpenerPolicy());
        // this.express.use(helmet.crossOriginResourcePolicy());
        // this.express.use(helmet.dnsPrefetchControl());
        // this.express.use(helmet.expectCt());
        // this.express.use(helmet.frameguard());
        // this.express.use(helmet.hidePoweredBy());
        // this.express.use(helmet.hsts());
        // this.express.use(helmet.ieNoOpen());
        // this.express.use(helmet.noSniff());
        // this.express.use(helmet.originAgentCluster());
        // this.express.use(helmet.permittedCrossDomainPolicies());
        // this.express.use(helmet.xssFilter());
        // this.express.use(express.json({
        //     limit: 500000
        // }));

        // this.express.use(express.urlencoded({
        //     limit: 500000,
        //     extended: true
        // }));

        const port: number = parseInt(process.env.PORT || '80');

        const server = http.createServer(this.express);

        console.log(server);
        

        // Start the server on the specified port
        server.listen(port, () => {
            console.log(`The crypto honeypot detector server is running on port ${port}`);
        });
    }
}

/** Export the express module */
export default new Express();
