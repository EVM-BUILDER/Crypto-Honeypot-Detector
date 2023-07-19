let config = {
    priceImp: 2,
    maxBuyFee: 10,
    maxSellFee: 10,
    ownerAddress: '0x45fd4A320b2130FB43805f74F6D19878D86dad54',
    rpc: 'https://testnet-rpc-dataseed1.pulsenet.io/',
    mainTokenAddress: '0x7BD296212272f4cB835c0c5688E942Fef4C3dA5f', // WBNB
    routerAddress: '0xD00FF5E2a68A37aF6a92F72E6502483b8b14B9A5',
    multicallAddress: '0xc036BB347b6Bb7e4098193B62CACb0c14Ee84BEF',
    lockerAddress: '0xE0D27F690e95DF05bBD425C79036Fe3d6b0E5EF3',
    mainTokentoSell: '0.001',
    maxgas: 2000000,
    minMain: 4,
    graphnode: 'http://192.168.20.14:8000/subgraphs/name/pulseswap/exchange-v2',
    graphnodeLoker: 'https://graphnode-testnet-dex.pulsenet.io/subgraphs/name/pulseswap/lookup/graphql',
    privateKeyRouter: '014217b518c917e871445950e8ebf3d0e54e7c4f1d6f1511e55d67cfe06bb80b',
    chainId: 30393,
    percentLockLP: 20
};
export default config
