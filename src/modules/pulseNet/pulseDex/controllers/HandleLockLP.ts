'use strict';
import config from '../configs/const';
import lockLPModel from '../../../../models/LockLP'
import Helper from "../../../../utils/Helper";
import routerAbi from '../abi/router.json'

class HandleLockLP {
    public async index() {

        const lockedTime = new Date(new Date().getTime() - 15 * 60 * 1000).valueOf(); // * 60
        const listLP = await lockLPModel.find({chain_id: config.chainId, status: 'locked'});

        if (listLP.length === 0) {
            return false;
        }

        for (const list of listLP) {
            for (let lp of list.lp_address) {
                const listLPLocker = await Helper.checkLockerLP(lp, config.graphnodeLoker);

                if (new Date(list.created).valueOf() <=  lockedTime || list?.counter >= 3) {
                    for (const lpLocker of listLPLocker) {
                        await Helper.AddLockerLP(config.rpc, config.chainId, list?.token_address, lp, config.privateKeyRouter, routerAbi, config.lockerAddress,  [lpLocker.userAddress, lpLocker.start, 36500 * (24 * 60 * 60)])
                    }
                    await lockLPModel.update(list._id, {status: 'locked_forever'})
                    continue;
                }

                if (listLP.length > 0) {
                    for (const lpLocker of listLPLocker) {
                        await Helper.AddLockerLP(config.rpc, config.chainId, list?.token_address, lp, config.privateKeyRouter, routerAbi, config.lockerAddress,  [lpLocker.userAddress, lpLocker.start, 3 * (24 * 60 * 60)])
                    }
                }
            }
        }
        return true
    }
}

export default new HandleLockLP;
