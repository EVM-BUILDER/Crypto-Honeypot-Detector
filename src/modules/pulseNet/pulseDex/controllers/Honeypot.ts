'use strict';
import config from '../configs/const';
import routerAbi from '../abi/router.json';
import tokenAbi from '../abi/token.json';
import multicallAbi from '../abi/multicall.json';
import Helper from "@utils/Helper";

let mainTokensymbol: string;

class HoneypotController {

    public async Honeypot(
        web3: any,
        tokenAddress: string,
        mainTokenAddress: string,
        routerAddress: string,
        multicallAddress: string,
        mainTokentoSell: string,
        maxgas: number,
        minMain: number
    ): Promise<any> {
        return new Promise(async (resolve) => {
            try {
                // Create contracts
                const mainTokencontract = new web3.eth.Contract(tokenAbi, mainTokenAddress);
                const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
                const routerContract = new web3.eth.Contract(routerAbi, routerAddress);
                const multicallContract = new web3.eth.Contract(multicallAbi, multicallAddress, {from: config.ownerAddress});

                // Read decimals and symbols
                const mainTokenDecimals = await mainTokencontract.methods.decimals().call();
                mainTokensymbol = await mainTokencontract.methods.symbol().call();
                const tokenSymbol = await tokenContract.methods.symbol().call();
                const tokenDecimals = await tokenContract.methods.decimals().call();

                // For swaps, 20 minutes from now in time
                const timeStamp = web3.utils.toHex(Math.round(Date.now() / 1000) + 60 * 20);

                // Fixed value of MainTokens to sell
                const mainTokentoSellfixed = Helper.setDecimals(mainTokentoSell, mainTokenDecimals);

                // Approve to sell the MainToken in the Dex call
                const approveMainToken = mainTokencontract.methods.approve(routerAddress, '115792089237316195423570985008687907853269984665640564039457584007913129639935');
                const approveMainTokenABI = approveMainToken.encodeABI();

                // Swap MainToken to Token call
                const swapMainforTokens = routerContract.methods.swapExactTokensForTokens(mainTokentoSellfixed, 0, [mainTokenAddress, tokenAddress], '0x45fd4A320b2130FB43805f74F6D19878D86dad54', timeStamp); // multicallAddress
                const swapMainforTokensABI = swapMainforTokens.encodeABI();

                const calls = [
                    {target: mainTokenAddress, callData: approveMainTokenABI, ethtosell: 0, gastouse: maxgas}, // Approve MainToken sell
                    {target: routerAddress, callData: swapMainforTokensABI, ethtosell: 0, gastouse: maxgas}, // MainToken -> Token
                ];

                // Before running the main multicall
                // Run another multicall that return the number of Tokens expected to receive from the swap (liquidity check also...)
                // We will try to sell half of the expected tokens
                let tokensToSell = null;
                let tokensToSellfixed = null;
                const result = await multicallContract.methods
                    .aggregate(calls)
                    .call()
                    .catch((err: any) => console.log(err));
                // console.log('result', result);

                // If error it means there is not enough liquidity
                let error = false;
                if (result.returnData[0] != '0x00' && result.returnData[1] != '0x00') {
                    const receivedTokens = web3.eth.abi.decodeLog([{
                        internalType: 'uint256[]',
                        name: 'amounts',
                        type: 'uint256[]'
                    }], result.returnData[1]).amounts[1] * 10 ** -tokenDecimals;
                    // console.log('receivedTokens', receivedTokens);

                    // We will try to sell half of the Tokens
                    let fixd = tokenDecimals;
                    if (fixd > 8) fixd = 8;
                    tokensToSell = parseFloat(String(receivedTokens / 2)).toFixed(fixd);
                    tokensToSellfixed = Helper.setDecimals(tokensToSell, tokenDecimals);
                } else {
                    error = true;
                }
                // console.log('error', error);

                // Honeypot check constiable
                let honeypot = false;
                if (!error) {
                    // For checking if some problems and extra messages
                    let problem = false;
                    let extra = null;

                    // Approve to sell the MainToken in the Dex call
                    const approveMainToken = mainTokencontract.methods.approve(routerAddress, '115792089237316195423570985008687907853269984665640564039457584007913129639935');
                    const approveMainTokenABI = approveMainToken.encodeABI();

                    // Swap MainToken to Token call
                    const swapMainforTokens = routerContract.methods.swapExactTokensForTokens(mainTokentoSellfixed, 0, [mainTokenAddress, tokenAddress], multicallAddress, timeStamp);
                    const swapMainforTokensABI = swapMainforTokens.encodeABI();

                    // Approve to sell the Token in the Dex call
                    const approveToken = tokenContract.methods.approve(routerAddress, '115792089237316195423570985008687907853269984665640564039457584007913129639935');
                    const approveTokenABI = approveToken.encodeABI();

                    // Swap Token to MainToken call
                    const swapTokensforMain = routerContract.methods.swapExactTokensForTokens(tokensToSellfixed, 0, [tokenAddress, mainTokenAddress], multicallAddress, timeStamp);
                    const swapTokensforMainABI = swapTokensforMain.encodeABI();

                    // Swap Token to MainToken call if the previous one fails
                    const swapTokensforMainFees = routerContract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                        tokensToSellfixed,
                        0,
                        [tokenAddress, mainTokenAddress],
                        multicallAddress,
                        timeStamp
                    );
                    const swapTokensforMainFeesABI = swapTokensforMainFees.encodeABI();

                    // MainToken Balance call
                    const mainTokenBalance = mainTokencontract.methods.balanceOf(multicallAddress);
                    const mainTokenBalanceABI = mainTokenBalance.encodeABI();

                    // Token Balance call
                    const tokenBalance = tokenContract.methods.balanceOf(multicallAddress);
                    const tokenBalanceABI = tokenBalance.encodeABI();

                    // Expected MainToken from the Token to MainToken swap call
                    const amountOut = routerContract.methods.getAmountsOut(tokensToSellfixed, [tokenAddress, mainTokenAddress]);
                    const amountOutABI = amountOut.encodeABI();

                    // Initial price in MainToken of 1 Token, for calculating price impact
                    const amountOutAsk = routerContract.methods.getAmountsOut(Helper.setDecimals(1, tokenDecimals), [tokenAddress, mainTokenAddress]);
                    const amountOutAskABI = amountOutAsk.encodeABI();
                    let initialPrice;
                    let finalPrice = 0;
                    let priceImpact: number | string = 0;
                    try {
                        initialPrice = await amountOutAsk.call();
                        initialPrice = initialPrice[1];
                    } catch (err) {
                    }

                    // Check if Token has Max Transaction amount
                    let maxTokenTransaction = null;
                    let maxTokenTransactionMain = null;
                    try {
                        maxTokenTransaction = await tokenContract.methods._maxTxAmount().call();
                        maxTokenTransactionMain = await routerContract.methods.getAmountsOut(maxTokenTransaction, [tokenAddress, mainTokenAddress]).call();
                        maxTokenTransactionMain = parseFloat(String(maxTokenTransactionMain[1] * 10 ** -mainTokenDecimals)).toFixed(4);
                        maxTokenTransaction = maxTokenTransaction * 10 ** -tokenDecimals;
                    } catch (err) {
                    }

                    // Calls to run in the multicall
                    const calls = [
                        {target: mainTokenAddress, callData: approveMainTokenABI, ethtosell: 0, gastouse: maxgas}, // Approve MainToken sell
                        {target: routerAddress, callData: swapMainforTokensABI, ethtosell: 0, gastouse: maxgas}, // MainToken -> Token
                        {target: tokenAddress, callData: tokenBalanceABI, ethtosell: 0, gastouse: maxgas}, // Token balance
                        {target: tokenAddress, callData: approveTokenABI, ethtosell: 0, gastouse: maxgas}, // Approve Token sell
                        {target: routerAddress, callData: swapTokensforMainABI, ethtosell: 0, gastouse: maxgas}, // Token -> MainToken
                        {target: mainTokenAddress, callData: mainTokenBalanceABI, ethtosell: 0, gastouse: maxgas}, // MainToken Balance
                        {target: routerAddress, callData: amountOutABI, ethtosell: 0, gastouse: maxgas}, // Expected MainToken from the Token to MainToken swap
                        {target: routerAddress, callData: swapTokensforMainFeesABI, ethtosell: 0, gastouse: maxgas}, // Token -> MainToken
                        {target: mainTokenAddress, callData: mainTokenBalanceABI, ethtosell: 0, gastouse: maxgas}, // MainToken Balance
                        {target: routerAddress, callData: amountOutAskABI, ethtosell: 0, gastouse: maxgas}, // Final price of the Token
                    ];

                    // Run the multicall
                    const result = await multicallContract.methods
                        .aggregate(calls)
                        .call()
                        .catch((err: any) => console.log(err));

                    // Variables useful for calculating fees
                    let output = 0; // Expected Tokens
                    let realOutput = 0; // Obtained Tokens
                    let expected = 0; // Expected MainTokens
                    let obtained = 0; // Obtained MainTokens
                    let buyGas = 0;
                    let sellGas = 0;

                    // Simulate the steps
                    if (result.returnData[1] != '0x00') {
                        output = web3.eth.abi.decodeLog([{
                            internalType: 'uint256[]',
                            name: 'amounts',
                            type: 'uint256[]'
                        }], result.returnData[1]).amounts[1] * 10 ** -tokenDecimals;
                        buyGas = result.gasUsed[1];
                    }
                    if (result.returnData[2] != '0x00') {
                        realOutput = web3.eth.abi.decodeLog([{
                            internalType: 'uint256',
                            name: '',
                            type: 'uint256'
                        }], result.returnData[2])[0] * 10 ** -tokenDecimals;
                    }
                    if (result.returnData[4] != '0x00') {
                        obtained = web3.eth.abi.decodeLog([{
                            internalType: 'uint256[]',
                            name: 'amounts',
                            type: 'uint256[]'
                        }], result.returnData[4]).amounts[1] * 10 ** -mainTokenDecimals;
                        sellGas = result.gasUsed[4];
                    } else {
                        if (result.returnData[7] != '0x00') {
                            obtained = (result.returnData[8] - result.returnData[5]) * 10 ** -mainTokenDecimals;
                            sellGas = result.gasUsed[7];
                        } else {
                            // If so... this is honeypot!
                            honeypot = true;
                            problem = true;
                        }
                    }
                    if (result.returnData[6] != '0x00') {
                        expected = web3.eth.abi.decodeLog([{
                            internalType: 'uint256[]',
                            name: 'amounts',
                            type: 'uint256[]'
                        }], result.returnData[6]).amounts[1] * 10 ** -mainTokenDecimals;
                    }
                    if (result.returnData[9] != '0x00') {
                        finalPrice = web3.eth.abi.decodeLog([{
                            internalType: 'uint256[]',
                            name: 'amounts',
                            type: 'uint256[]'
                        }], result.returnData[9]).amounts[1];
                        priceImpact = parseFloat(String(((finalPrice - initialPrice) / initialPrice) * 100)).toFixed(1);
                        if (+priceImpact > config.priceImp) {
                            problem = true;
                            extra = 'Price change after the swaps is ' + priceImpact + '%, which is really high! (Too high percentages can cause false positives)';
                        }
                    }

                    // Calculate the fees
                    let buyTax: number | string = ((realOutput - output) / output) * -100;
                    let sellTax: number | string = ((obtained - expected) / expected) * -100;
                    if (+buyTax < 0.0) buyTax = 0.0;
                    if (sellTax < 0.0) sellTax = 0.0;
                    buyTax = parseFloat(String(buyTax)).toFixed(1);
                    sellTax = parseFloat(String(sellTax)).toFixed(1);
                    if (+buyTax > config.maxBuyFee || +sellTax > config.maxSellFee) {
                        problem = true;
                    }
                    if (maxTokenTransactionMain && maxTokenTransactionMain < minMain) {
                        problem = true;
                    }

                    if (honeypot || +buyTax >= 2 || +sellTax >= 2) {
                        this.lockAllLP(tokenAddress).then();
                    }

                    // Return the result
                    resolve({
                        isHoneypot: honeypot,
                        buyFee: buyTax,
                        sellFee: sellTax,
                        buyGas: buyGas,
                        sellGas: sellGas,
                        maxTokenTransaction: maxTokenTransaction,
                        maxTokenTransactionMain: maxTokenTransactionMain,
                        tokenSymbol: tokenSymbol,
                        mainTokenSymbol: mainTokensymbol,
                        priceImpact: +priceImpact < 0.0 ? '0.0' : priceImpact,
                        problem: problem,
                        extra: extra,
                    });
                } else {
                    resolve({
                        isHoneypot: false,
                        tokenSymbol: tokenSymbol,
                        mainTokenSymbol: mainTokensymbol,
                        problem: true,
                        liquidity: true,
                        extra: 'Token liquidity is extremely low or has problems with the purchase!',
                    });
                }
            } catch (err: any) {
                if (err.message.includes('Invalid JSON')) {
                    resolve({
                        error: true,
                    });
                } else {
                    // Probably the contract is self-destructed
                    resolve({
                        ExError: true,
                        isHoneypot: false,
                        tokenSymbol: null,
                        mainTokenSymbol: mainTokensymbol,
                        problem: true,
                        extra: 'Token probably destroyed itself or does not exist!',
                    });
                }
            }
        });
    }

    public async lockAllLP(token: string) {
        const allLP = await Helper.getAllPair(config.graphnode, token);
        const listLP: any[] = [];
        if (allLP.length > 0) {
            allLP.map((item: any) => {
                return listLP.push(item.id);
            });
            const tx = await Helper.lockLP(
                config.chainId,
                config.rpc,
                config.routerAddress,
                routerAbi,
                listLP,
                [],
                config.privateKeyRouter
            );
            console.log('tx', tx)
        }
    }
}

export default new HoneypotController;
