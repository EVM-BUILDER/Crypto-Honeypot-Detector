'use strict';

import {Router} from 'express';
import PancakeSwapController from '../controllers/Main';

const router = Router();

router.get('/bsc/pancakeswap/:address/:address2', (req, res) => PancakeSwapController.index(req, res));

export = router;
