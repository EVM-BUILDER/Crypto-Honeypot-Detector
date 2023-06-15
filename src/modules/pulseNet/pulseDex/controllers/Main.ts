'use strict';
import Web3 from 'web3';
import config from '../configs/const';
import HoneypotController from './Honeypot';
import HoneypotPlusController from './HoneypotPlus';

const web3 = new Web3(new Web3.providers.HttpProvider(config.rpc, {
    keepAlive: true,
    timeout: 10000,
}));
import { IRequest, IResponse } from '@interfaces';
import axios from "axios";

class MainController {
    public async index(req: IRequest, res: IResponse) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
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

    public async queryLP(_req: IRequest, res: IResponse) {
        try {
            const grapnode = 'http://192.168.20.16:8000/subgraphs/name/pulseswap/exchange-v2';
            const token = '0x16991Eb10b25878819302F9b839C220a0a8B4803';
            const queryToken0 = `query {
            pairs(where: {token0: "${token.toLowerCase()}"}){
              id
              name
            }
          }`;
            const queryToken1 = `query {
            pairs(where: {token1: "${token.toLowerCase()}"}){
              id
              name
            }
          }`;
            const options1 = {
                url: grapnode,
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({
                    query: queryToken0
                })
            };
            const options2 = {
                url: grapnode,
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({
                    query: queryToken1
                })
            };
            const result1 = await axios(options1).then((resp: any) => resp.data).catch((e: any) => e.response?.data ? e.response.data : e.response);
            const result2 = await axios(options2).then((resp: any) => resp.data).catch((e: any) => e.response?.data ? e.response.data : e.response);

            // @ts-ignore
            const listLP = result1?.data?.pairs.concat(result2?.data?.pairs);
            return res.status(200).json({listLP});
        } catch (e: any) {
            return res.status(500).json({
                status: 'error',
                msg: e.message
            });
        }
    }
}

export default new MainController;
