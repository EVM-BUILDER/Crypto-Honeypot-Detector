'use strict';
import Web3 from 'web3';
import config from '../configs/const';
import routerAbi from '../abi/router.json';
import tokenAbi from '../abi/token.json';
import multicallAbi from '../abi/multicall.json';

console.log(config)
const web3 = new Web3(new Web3.providers.HttpProvider(config.rpc, {
	keepAlive: true,
	timeout: 10000,
}));
import {IRequest, IResponse, INext} from '@interfaces';

class CreateApiController {
	public async index(_req: IRequest, res: IResponse, next: INext) {
		try {
			console.log('vao day')
			return res.status(200).json({status: true});
		} catch (e) {
			return next(e);
		}
	}
}

export default new CreateApiController;
