import sdk from "./1-initialize-sdk.js";
import {readFileSync} from "fs";

const bundleDrop = sdk.getBundleDropModule("0xfd9aD6C5f7b4c63Fca1F258159d2F3C656E9203F",);

(async () => {
    try {
        await bundleDrop.createBatch([{
            name: "Egg",
            description: "This NFT will give you access to BaldDAO 🥚",
            image: readFileSync("scripts/assets/egg.png"),
        },]);
        console.log("✅ Successfully created a new NFT in the drop!");
    } catch (error) {
        console.error("failed to create the new NFT", error);
    }
})()
