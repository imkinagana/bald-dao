import {ethers} from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getVoteModule("0x1907d08f4fbA42a663B801D65082d06ebC5709AF");
const tokenModule = sdk.getTokenModule("0xBBb911Da2De88D452bbC509B0826fe89feced3da");

(async () => {
    try {
        await tokenModule.grantRole("minter", voteModule.address);

        console.log("Successfully gave vote module permissions to act on token module");
    } catch (error) {
        console.error("failed to grant vote module permissions on token module", error);
        process.exit(1);
    }

    try {
        const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);
        const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
        const percent90 = ownedAmount.div(100).mul(90);
        await tokenModule.transfer(voteModule.address, percent90);

        console.log("✅ Successfully transferred tokens to vote module");
    } catch (err) {
        console.error("failed to transfer tokens to vote module", err);
    }
})();
