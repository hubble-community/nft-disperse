const { expect, assert } = require('chai')
const crypto = require('crypto')
const Bluebird = require('bluebird')

const BATCH_SIZE = 50
const SAMPLE_SIZE = 69
const DORLANZ = '0x82e6c5fdfb8966fc2cd4427d79caeb5983fd1901'

describe('NFTDisperse Tests', function() {
    before('factories', async function() {
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    jsonRpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
                    blockNumber: 8820500 // having a consistent block number speeds up the tests across runs
                }
            }]
        })
        await impersonateAccount(DORLANZ)
        signers = await ethers.getSigners()
        alice = signers[0].address

        NFTDisperse = await ethers.getContractFactory('NFTDisperse')
        nftDisperse = await NFTDisperse.deploy()

        genesisVoter = await ethers.getContractAt('IERC721', '0x9acd85fe8a3f17fc5007da75d268e9ea989649ef')

        // give dorlanz some avax
        await web3.eth.sendTransaction({ from: alice, to: DORLANZ, value: ethers.constants.WeiPerEther.mul(10) })
        dorlanz = ethers.provider.getSigner(DORLANZ)
    })

    it('disperse', async function() {
        await genesisVoter.connect(dorlanz).setApprovalForAll(nftDisperse.address, true)
        const tokenIds = Array(SAMPLE_SIZE + 1).fill().map((_, i) => i).slice(1) // there's no token 0
        const recipients = Array(SAMPLE_SIZE)
        await Bluebird.map(recipients, async (_, i) => {
            recipients[i] = ethers.utils.getAddress('0x' + (await crypto.randomBytes(20)).toString('hex'))
        })
        await airdrop(nftDisperse, dorlanz, genesisVoter.address, tokenIds, recipients)
        for (let i = 1; i <= SAMPLE_SIZE; i++) {
            expect(await genesisVoter.ownerOf(i)).to.eq(recipients[i-1])
            expect(await genesisVoter.balanceOf(recipients[i-1])).to.eq(1)
        }
        expect(await genesisVoter.balanceOf(DORLANZ)).to.eq(610 - SAMPLE_SIZE)
    })
})

async function airdrop(nftDisperse, signer, nftContract, tokenIds, recipients) {
    let nonce = await signer.getTransactionCount()
    const tasks = []
    while (recipients.length) {
        tasks.push(
            nftDisperse.connect(signer).disperse(nftContract, tokenIds.slice(0, BATCH_SIZE), recipients.slice(0, BATCH_SIZE), { nonce: nonce++ })
        )
        recipients = recipients.slice(BATCH_SIZE)
        tokenIds = tokenIds.slice(BATCH_SIZE)
    }
    await Promise.all(tasks)
}

async function impersonateAccount(account) {
    await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [account],
    })
}
