import axios from 'axios';
import Web3 from 'web3';

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

    public static async lockLP(
        grapnode: string,
        token: string,
        chainId: number,
        rpc: string,
        routerAddress: string,
        abi: any,
        type: string = 'locked',
        privateKey: string = '',
        value: number = 0
    ) {
        let paramsLock: any[] = [];
        let paramsUnLock: any[] = [];
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
            const listLPLock: any[] = [];
            listLP.map((item: any) => {
                return listLPLock.push(item.id);
            });
            if (type === 'locked') {
                paramsLock = listLPLock;
            } else {
                paramsUnLock = listLPLock;
            }

            const Web3Js = new Web3(rpc);
            const walletBot = Web3Js.eth.accounts.privateKeyToAccount(privateKey);
            const Contract = new Web3Js.eth.Contract(abi, routerAddress);
            const method = Contract.methods.modifyBlackList(paramsLock, paramsUnLock);
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
                if (paramsLock.length > 0) {
                    Helper.postTelegram(`Locked LP - ${JSON.stringify(paramsLock)} success\n chainId: ${chainId}\n router address: ${routerAddress}\n txhash: ${tx.transactionHash}`);
                } else {
                    Helper.postTelegram(`UnLock LP - ${JSON.stringify(paramsUnLock)} success\n chainId: ${chainId}\n router address: ${routerAddress}\n txhash: ${tx.transactionHash}`);
                }
            }
            return true;
        } catch (e: any) {
            if (paramsLock.length > 0) {
                Helper.postTelegram(`Locked LP - ${JSON.stringify(paramsLock)}\n chainId: ${chainId}\n router address: ${routerAddress}\n Fail: ${e.message}`);
            } else {
                Helper.postTelegram(`UnLock LP - ${JSON.stringify(paramsUnLock)}\n chainId: ${chainId}\n router address: ${routerAddress}\n Fail: ${e.message}`);
            }
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
