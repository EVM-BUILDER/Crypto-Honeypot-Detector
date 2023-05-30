'use strict';

import {Router} from 'express';
import TestApiController from '../controllers/Create';

const router = Router();

// router.get('/', (req, res, next) => TestApiController.default.index(req, res, next));
// router.get('/setmev', (req, res, next) => TestApiController.default.setMev(req, res, next));
router.get('/check', (req, res, next) => TestApiController.index(req, res, next));

// export = router;
export = router;
