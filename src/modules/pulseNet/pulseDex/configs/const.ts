let config = {
    priceImp: 2,
    maxBuyFee: 10,
    maxSellFee: 10,
    ownerAddress: '0x45fd4A320b2130FB43805f74F6D19878D86dad54',
    rpc: 'https://testnet-rpc-dataseed1.pulsenet.io/',
    mainTokenAddress: '0x584D0eB0463a3Ac82D2A03fe1fE8F7bF6Ee066d5', // WBNB
    routerAddress: '0xaF2deb4F2Eda4ABcE3B98Ef62fF62137CA1034AB',
    multicallAddress: '0x0D9784937484e888546B8199672f58a6FB1449eE',
    lockerAddress: '0x2219e1239a3B69fe78AF2a0De7d594F12442F9Be',
    mainTokentoSell: '0.001',
    maxgas: 2000000,
    minMain: 4,
    graphnode: 'http://192.168.20.14:8000/subgraphs/name/pulseswap/exchange-v2',
    graphnodeLoker: 'http://192.168.20.14:8000/subgraphs/name/pulseswap/lookup',
    privateKeyRouter: '014217b518c917e871445950e8ebf3d0e54e7c4f1d6f1511e55d67cfe06bb80b',
    chainId: 30393,
    percentLockLP: 20
};
export default config
