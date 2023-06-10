'use strict';
import BaseModel from './BaseModel';

export interface LockedLPInterface {
    _id?: string;
    chain_id: number,
    tx_hash_locked: string,
    tx_hash_unlock: string,
    lp_address: any,
    router_address: string,
    status: string
    create_user?: string;
    modifier_user?: string;
    created?: EpochTimeStamp;
    modified?: EpochTimeStamp;
}

class LockedLPModel extends BaseModel {
    constructor() {
        const schema = {
            chain_id: Number,
            tx_hash_locked: String,
            tx_hash_unlock: String,
            lp_address: Array,
            router_address: String,
            status: {type: String, default: 'locked'} // locked, unlock
        };
        super(schema, 'locked_lp');
    }
}

export default new LockedLPModel;
