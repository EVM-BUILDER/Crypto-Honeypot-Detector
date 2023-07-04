'use strict';
import config from '../configs/const';
import lockLPModel from '../../../../models/LockLP'
import Helper from "../../../../utils/Helper";
// import routerAbi from '../abi/router.json'

class HandleLockLP {
    public async index() {

        const lockedTime = new Date(new Date().getTime() - 6 * 60 * 60 * 1000).valueOf();
        const listLP = await lockLPModel.find({chain_id: config.chainId, status: 'locked'});

        if (listLP.length === 0) {
            return false;
        }

        for (const list of listLP) {
            if (new Date(list.created).valueOf() <=  lockedTime || list?.counter >= 3) {
                // continue;
            }

            for (let lp of list.lp_address) {
                lp = '0xdcecf1bf78c9dff67cd41fcf5626a22a3ec035e6';
                const listLP = await Helper.checkLockerLP(lp, config.graphnodeLoker);
                console.log('listLP', listLP)
                // await Helper.unlockLP(config.rpc, config.privateKeyRouter, routerAbi, config.routerAddress, list);
            }
        }
        return true
    }
}

export default new HandleLockLP;
