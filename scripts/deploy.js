async function main() {
    const NFTDisperse = await ethers.getContractFactory('NFTDisperse')
    const disperse = await NFTDisperse.deploy()
    console.log(disperse.address) // 0xB61caA81b5B254Eee4f7b3a19F1b0C3C5598e27C
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
