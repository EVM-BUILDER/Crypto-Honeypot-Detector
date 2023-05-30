'use strict';

import 'module-alias/register';
import * as dotenv from 'dotenv';
import App from '@providers/App';

dotenv.config();
const arg = process.argv.slice(2);
if (arg.length > 0 && ['development', 'staging', 'production'].includes(arg[0])) {
	process.env.NODE_ENV = arg[0];
}

if (process.env.BASE_URL === 'http://localhost') {
	process.env.BASE_URL += `:${process.env.PORT}`;
}

App.loadServer();
