'use strict';
import Web3 from 'web3';
import config from '../configs/const';
import HoneypotController from './Honeypot';
import HoneypotPlusController from './HoneypotPlus';

const web3 = new Web3(new Web3.providers.HttpProvider(config.rpc, {
    keepAlive: true,
    timeout: 10000,
}));
import {IRequest, IResponse} from '@interfaces';

class MainController {
    public async index(req: IRequest, res: IResponse) {
        try {
            const tokenAddress = req.params.address;
            if (`${req.params.address2}`.toLowerCase() == config.mainTokenAddress.toLowerCase() || `${req.params.address2}`.toLowerCase() == 'default') {
                const honeypot = await HoneypotController.Honeypot(
                    web3,
                    tokenAddress,
                    config.mainTokenAddress,
                    config.routerAddress,
                    config.multicallAddress,
                    config.mainTokentoSell,
                    config.maxgas,
                    config.minMain
                );

                if (honeypot.error)
                    return res.status(403).json({
                        error: true,
                        msg: 'Error testing the honeypot, retry!',
                    });
                if (honeypot.ExError) {
                    return res.status(404).json({
                        error: true,
                        data: honeypot,
                    });
                }
                return res.json({
                    data: honeypot,
                });
            }
            const honeypotPlus = await HoneypotPlusController.HoneypotPlus(
                web3,
                tokenAddress,
                req.params.address2,
                config.routerAddress,
                config.multicallAddress,
                config.mainTokentoSell,
                config.maxgas,
                config.minMain,
                config.mainTokenAddress
            );
            if (honeypotPlus.error)
                return res.status(403).json({
                    error: true,
                    msg: 'Error testing the honeypot, retry!',
                });
            if (honeypotPlus.ExError) {
                return res.status(404).json({
                    error: true,
                    data: honeypotPlus,
                });
            }
            return res.json({
                data: honeypotPlus,
            });
        } catch (e: any) {
            return res.status(500).json({
                status: 'error',
                msg: e.message
            });
        }
    }
}

export default new MainController;
