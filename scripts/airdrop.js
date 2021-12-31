const fs = require('fs')

const SAMPLE_SIZE = 610
const BATCH_SIZE = 50

async function execute(signer) {
    const nftDisperse = await ethers.getContractAt('NFTDisperse', '0xB61caA81b5B254Eee4f7b3a19F1b0C3C5598e27C')
    const genesisVoter = await ethers.getContractAt('IERC721', '0x9acd85fe8a3f17fc5007da75d268e9ea989649ef')

    let tokenIds = Array(SAMPLE_SIZE + 1).fill().map((_, i) => i).slice(1) // there's no token 0
    let recipients = fs.readFileSync('./scripts/hubblevoters5.csv').toString().split('\n').map(a => a.slice(0, 42)).slice(0, SAMPLE_SIZE)

    if (tokenIds.length != recipients.length) throw 'invalid input'
    const tasks = []

    await genesisVoter.connect(signer).setApprovalForAll(nftDisperse.address, true)

    let nonce = await signer.getTransactionCount()
    while (recipients.length) {
        tasks.push(
            nftDisperse.disperse(genesisVoter.address, tokenIds.slice(0, BATCH_SIZE), recipients.slice(0, BATCH_SIZE), { nonce: nonce++ })
        )
        recipients = recipients.slice(BATCH_SIZE)
        tokenIds = tokenIds.slice(BATCH_SIZE)
    }
    await Promise.all(tasks)
}

async function simulate() {
    const DORLANZ = '0x82e6c5fdfb8966fc2cd4427d79caeb5983fd1901'
    await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [DORLANZ],
    })
    return execute(await ethers.provider.getSigner(DORLANZ))
}

async function main() {
    const [ signer ] = await ethers.getSigners()
    return execute(signer)
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
