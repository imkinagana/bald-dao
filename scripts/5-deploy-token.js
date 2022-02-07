import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x156Ac4f9BaE10aC897d233B479BDe142dBf399B7");

(async () => {
    try {
        const tokenModule = await app.deployTokenModule({
            name: "BaldDAO Governance Token", symbol: "EGG",
        });
        console.log("✅ Successfully deployed token module, address:", tokenModule.address,);
    } catch (error) {
        console.error("failed to deploy token module", error);
    }
})();
