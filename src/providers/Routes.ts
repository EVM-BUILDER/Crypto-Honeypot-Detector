'use strict';
import {Application} from 'express';
import fs from 'fs';

class Routes {
    public static mountRoutes(_express: Application): Application {
        // const apiPrefix = '/api';
        fs.readdirSync(`${process.cwd()}/src/modules`).map((evm: string) => {
            fs.readdirSync(`${process.cwd()}/src/modules/${evm}`).map((chain: string) => {
                const routerApi = require(`@modules/${evm}/${chain}/routes/Api`);
                _express.use(routerApi);
                try {
                    require(`@modules/${evm}/${chain}/routes/Cron`);
                } catch (e) {}
            });
        })
        return _express;
    }
}

export default Routes;
