import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule("0x156Ac4f9BaE10aC897d233B479BDe142dBf399B7",);

(async () => {
    try {
        const voteModule = await appModule.deployVoteModule({
            name: "BaldDAO's Epic Proposals",
            votingTokenAddress: "0xBBb911Da2De88D452bbC509B0826fe89feced3da",
            proposalStartWaitTimeInSeconds: 0,
            proposalVotingTimeInSeconds: 24 * 60 * 60,
            votingQuorumFraction: 0,
            minimumNumberOfTokensNeededToPropose: "0",
        });

        console.log("✅ Successfully deployed vote module, address:", voteModule.address,);
    } catch (err) {
        console.error("Failed to deploy vote module", err);
    }
})();
