# NFT Disperse

- Airdrop
```
export PRIVATE_KEY=
npx hardhat run scripts/airdrop.js --network c_chain
```

- Fork and test
```
export PRIVATE_KEY=
npx hardhat node --fork https://api.avax.network/ext/bc/C/rpc --fork-block-number 8946051
npx hardhat run scripts/airdrop.js --network local
```
