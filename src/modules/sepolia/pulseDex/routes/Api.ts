'use strict';

import {Router} from 'express';
import PulseDexSwapController from '../controllers/Main';

const router = Router();

router.get('/sepolia/pulsedex/:address/:address2', (req, res) => PulseDexSwapController.index(req, res));

export = router;