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

    public static async getAllPair(grapnode: string, token: string) {
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
        return result1.data.pairs.concat(result2.data.pairs);
    }

    public static async lockLP(
        chainId: number,
        rpc: string,
        routerAddress: string,
        abi: any,
        paramsLock: any[] = [],
        paramsUnLock: any[] = [],
        privateKey: string = '',
        value: number = 0
    ) {
        try {
            const Web3Js = new Web3(rpc);
            const walletBot = Web3Js.eth.accounts.privateKeyToAccount(privateKey);
            console.log('walletBot', walletBot)
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
            return await Web3Js.eth.sendSignedTransaction(<string>raw.rawTransaction);
        } catch (e: any) {
            throw e;
        }
    }
}

export default Helper;
