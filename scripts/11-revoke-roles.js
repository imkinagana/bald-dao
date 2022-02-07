import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule("0xBBb911Da2De88D452bbC509B0826fe89feced3da");

(async () => {
    try {
        console.log("👀 Roles that exist right now:", await tokenModule.getAllRoleMembers());

        await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
        console.log("🎉 Roles after revoking ourselves", await tokenModule.getAllRoleMembers());
        console.log("✅ Successfully revoked our superpowers from the ERC-20 contract");

    } catch (error) {
        console.error("Failed to revoke ourselves from the DAO treasury", error);
    }
})();
