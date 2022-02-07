import {ethers} from "ethers";
import sdk from "./1-initialize-sdk.js";

const bundleDropModule = sdk.getBundleDropModule("0xfd9aD6C5f7b4c63Fca1F258159d2F3C656E9203F",);
const tokenModule = sdk.getTokenModule("0xBBb911Da2De88D452bbC509B0826fe89feced3da",);

(async () => {
    try {
        const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

        if (walletAddresses.length === 0) {
            console.log("No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!",);
            process.exit(0);
        }

        const airdropTargets = walletAddresses.map((address) => {
            const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
            console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

            return {
                address, amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
            };
        });

        console.log("🌈 Starting airdrop...")
        await tokenModule.transferBatch(airdropTargets);
        console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
    } catch (err) {
        console.error("Failed to airdrop tokens", err);
    }
})();
