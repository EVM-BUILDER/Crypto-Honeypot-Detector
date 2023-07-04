'use strict';

import {Router} from 'express';
import PulseDexSwapController from '../controllers/Main';

const router = Router();

router.get('/pulseNet/PulseDex/:address/:address2', (req, res) => PulseDexSwapController.index(req, res));

router.get('/pulseNet/query', (req, res) => PulseDexSwapController.queryLP(req, res));
router.get('/pulseNet/query-locker', (req, res) => PulseDexSwapController.queryLocker(req, res));
export = router;
