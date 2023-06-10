'use strict';
import config from '../configs/const';
import lockLPModel from '../../../../models/LockLP'
import Helper from "../../../../utils/Helper";
import routerAbi from '../abi/router.json'

class UnlockLPController {
    public async index() {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 3);
        const listLP = await lockLPModel.find({chain_id: config.chainId, status: 'locked', modified: {'$lte': currentDate}});

        if (listLP.length === 0) {
            return false;
        }

        for (const list of listLP) {
            await Helper.unlockLP(config.rpc, config.privateKeyRouter, routerAbi, config.routerAddress, list);
        }
        return true
    }
}

export default new UnlockLPController;
