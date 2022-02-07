import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule("0xfd9aD6C5f7b4c63Fca1F258159d2F3C656E9203F",);

(async () => {
    try {
        const claimConditionFactory = bundleDrop.getClaimConditionFactory();
        claimConditionFactory.newClaimPhase({
            startTime: new Date(), maxQuantity: 10000, maxQuantityPerTransaction: 1,
        });

        await bundleDrop.setClaimCondition(0, claimConditionFactory);
        console.log("✅ Successfully set claim condition on bundle drop:", bundleDrop.address);
    } catch (error) {
        console.error("Failed to set claim condition", error);
    }
})()
