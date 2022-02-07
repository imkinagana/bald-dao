import {ethers} from "ethers";
import sdk from "./1-initialize-sdk.js";
import {readFileSync} from "fs";

const app = sdk.getAppModule("0x156Ac4f9BaE10aC897d233B479BDe142dBf399B7");

(async () => {
    try {
        const bundleDropModule = await app.deployBundleDropModule({
            name: "BaldDAO Membership",
            description: "A DAO for people who are bald 👨🏻‍🦲",
            image: readFileSync("scripts/assets/bald.png"),
            primarySaleRecipientAddress: ethers.constants.AddressZero,
        });

        console.log("✅ Successfully deployed bundleDrop module, address:", bundleDropModule.address,);
        console.log("✅ bundleDrop metadata:", await bundleDropModule.getMetadata(),);
    } catch (error) {
        console.log("failed to deploy bundleDrop module", error);
    }
})()
