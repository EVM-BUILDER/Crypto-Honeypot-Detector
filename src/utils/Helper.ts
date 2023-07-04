import axios from 'axios';
import Web3 from 'web3';
import LockLP from "../models/LockLP";

class Helper {
    public static setDecimals(number: string | number, decimals: number) {
        number = number.toString();
        const numberAbs = number.split('.')[0];
        let numberDecimals = number.split('.')[1] ? number.split('.')[1] : '';
        while (numberDecimals.length < decimals) {
            numberDecimals += '0';
        }
        return numberAbs + numberDecimals;
    }

    // check and add time Locker LP
    public static async checkLockerLP(lp: string, grapnode: string) {
        try {
            const query = `{
                lockLPs(where: {lpAddress: "${lp.toLowerCase()}"}) {
                  lpAddress
                  start
                  txHash
                  userAddress
                }
            }`;
            const options = {
                url: grapnode,
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({query})
            };
            const result = await axios(options).then((resp: any) => {
                return resp.data
            }).catch((_e: any) => {
                return {data: {lockLPs: []}};
                // return e.response?.data ? e.response.data : e.response
            });
            return result?.data?.lockLPs;
        } catch (e) {
            throw e;
        }
    }

    public static async AddLockerLP(rpc: string, chainId: number, tokenAddress: string, lpAddress: string,  privateKey: string, abi: any, LockerAddress: string,  data: any = []) {
        try {
            const Web3Js = new Web3(rpc);
            const walletBot = Web3Js.eth.accounts.privateKeyToAccount(privateKey);
            const Contract = new Web3Js.eth.Contract(abi, LockerAddress);
            const method = Contract.methods.changeLock(...data);
            const dataAbi = await method.encodeABI();
            const price = await method.estimateGas({from: walletBot.address});
            const nonceCount = await Web3Js.eth.getTransactionCount(walletBot.address);
            const options: any = {
                chainId: chainId,
                from: walletBot.address,
                to: LockerAddress,
                nonce: Web3.utils.toHex(nonceCount),
                data: dataAbi,
                gas: Web3.utils.toHex(price),
                // gasPrice: Web3.utils.toHex(Web3.utils.toWei(GasPrice[chainId].toString(), 'gwei')),
                value: Web3.utils.toHex(Web3.utils.toWei('0', 'ether')),
                common: {
                    customChain: {
                        networkId: chainId,
                        chainId: chainId
                    },
                    baseChain: 'mainnet',
                    hardfork: 'petersburg'
                }
            };
            const raw = await Web3Js.eth.accounts.signTransaction(options, privateKey);
            const tx = await Web3Js.eth.sendSignedTransaction(<string>raw.rawTransaction);
            if (tx.status) {
                await LockLP.update(data._id, {
                    tx_hash_add_locker: tx.transactionHash
                });
                Helper.postTelegram(`LP address - ${lpAddress}\n ChainId: ${chainId}\n Token address: ${tokenAddress}\n Add locker success - txhash: ${tx.transactionHash}`);
            }
            return true;
        } catch (e: any) {
            Helper.postTelegram(`LP address - ${lpAddress}\n ChainId: ${chainId}\n Token address: ${tokenAddress}\n Add locker Fail: ${e.message}`);
            throw e;
        }
    }

    // lock and unlock LP swap transfer
    public static async unlockLP(rpc: string, chainId: number, privateKey: string, abi: any, routerAddress: string, tokenAddress: string) {
        const checkLock = await LockLP.findOne({chain_id: chainId, token_address: tokenAddress});
        try {
            if (typeof checkLock === 'undefined' || !checkLock?._id || checkLock.status === 'locked_forever' || checkLock.status === 'unlock') {
                return false;
            }

            const Web3Js = new Web3(rpc);
            const walletBot = Web3Js.eth.accounts.privateKeyToAccount(privateKey);
            const Contract = new Web3Js.eth.Contract(abi, routerAddress);
            const method = Contract.methods.modifyBlackList([], checkLock.lp_address);
            const dataAbi = await method.encodeABI();
            const price = await method.estimateGas({from: walletBot.address});
            const nonceCount = await Web3Js.eth.getTransactionCount(walletBot.address);
            const options: any = {
                chainId: chainId,
                from: walletBot.address,
                to: routerAddress,
                nonce: Web3.utils.toHex(nonceCount),
                data: dataAbi,
                gas: Web3.utils.toHex(price),
                // gasPrice: Web3.utils.toHex(Web3.utils.toWei(GasPrice[chainId].toString(), 'gwei')),
                value: Web3.utils.toHex(Web3.utils.toWei('0', 'ether')),
                common: {
                    customChain: {
                        networkId: chainId,
                        chainId: chainId
                    },
                    baseChain: 'mainnet',
                    hardfork: 'petersburg'
                }
            };
            const raw = await Web3Js.eth.accounts.signTransaction(options, privateKey);
            const tx = await Web3Js.eth.sendSignedTransaction(<string>raw.rawTransaction);
            if (tx.status) {
                await LockLP.update(checkLock._id, {
                    tx_hash_unlock: tx.transactionHash,
                    status: 'unlock'
                });
                Helper.postTelegram(`UnLock LP - ${JSON.stringify(checkLock.lp_address)} success\n chainId: ${chainId}\n router address: ${routerAddress}\n txhash: ${tx.transactionHash}`);
            }
            return true;
        } catch (e: any) {
            Helper.postTelegram(`Unlock LP - ${JSON.stringify(checkLock.lp_address)}\n chainId: ${chainId}\n router address: ${routerAddress}\n Fail: ${e.message}`);
            throw e;
        }
    }

    public static async lockLP(
        grapnode: string,
        token: string,
        chainId: number,
        rpc: string,
        routerAddress: string,
        abi: any,
        privateKey: string = '',
        value: number = 0
    ) {
        let paramsLock: any[] = [];
        try {
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

            if (typeof listLP === 'undefined' || listLP?.length === 0) {
                Helper.postTelegram(`Locked LP chainId: ${chainId}\n router address: ${routerAddress}\n Fail: list LP empty`);
                return false;
            }
            listLP.map((item: any) => {
                return paramsLock.push(item.id);
            });

            const checkLocked = await LockLP.findOne({lp_address: paramsLock, status: 'locked'});
            if (checkLocked?._id) {
                return true;
            }

            const Web3Js = new Web3(rpc);
            const walletBot = Web3Js.eth.accounts.privateKeyToAccount(privateKey);
            const Contract = new Web3Js.eth.Contract(abi, routerAddress);
            const method = Contract.methods.modifyBlackList(paramsLock, []);
            const dataAbi = await method.encodeABI();
            const price = await method.estimateGas({from: walletBot.address});
            const nonceCount = await Web3Js.eth.getTransactionCount(walletBot.address);
            const options: any = {
                chainId,
                from: walletBot.address,
                to: routerAddress,
                nonce: Web3.utils.toHex(nonceCount),
                data: dataAbi,
                gas: Web3.utils.toHex(price),
                // gasPrice: Web3.utils.toHex(Web3.utils.toWei(GasPrice[chainId].toString(), 'gwei')),
                value: Web3.utils.toHex(Web3.utils.toWei(value.toString(), 'ether')),
                common: {
                    customChain: {
                        networkId: chainId,
                        chainId
                    },
                    baseChain: 'mainnet',
                    hardfork: 'petersburg'
                }
            };
            const raw = await Web3Js.eth.accounts.signTransaction(options, privateKey);
            const tx = await Web3Js.eth.sendSignedTransaction(<string>raw.rawTransaction);
            if (tx.status) {
                const lock = await LockLP.findOne({chain_id: chainId, lp_address: {'$in': paramsLock}});
                if (lock?._id) {
                    await LockLP.update(lock?._id, {status: 'locked', lp_address: paramsLock, tx_hash_locked: tx.transactionHash, counter: +lock.counter + 1});
                } else {
                    await LockLP.insert({
                        chain_id: chainId,
                        tx_hash_locked: tx.transactionHash,
                        lp_address: paramsLock,
                        token_address: token,
                        router_address: routerAddress,
                        counter: 1,
                        status: 'locked'
                    });
                }
                Helper.postTelegram(`Token ${token}\n LP - ${JSON.stringify(paramsLock)}\n chainId: ${chainId}\n Router address: ${routerAddress}\n Lock LP success - txhash: ${tx.transactionHash}`);
            }
            return true;
        } catch (e: any) {
            Helper.postTelegram(`Token ${token}\n LP - ${JSON.stringify(paramsLock)}\n chainId: ${chainId}\n Router address: ${routerAddress}\n Lock LP Fail: ${e.message}`);
            throw e;
        }
    }

    public static postTelegram(msg: string) {
        const axiosConfig = {
            method: 'post',
            url: `https://api.telegram.org/bot5775677421:AAGIMkb507W8mPP-BEAXkn0Bgki9fDbvlFc/sendMessage`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                chat_id: '-1001667185622',
                text: msg
            }
        };
        axios(axiosConfig).then().catch((e: any) => {
            const msg = e.response?.data ? e.response.data : e.response;
            console.log(`Post telegram fail`, msg.description);
        });
    }
}

export default Helper;
