function UpdateWallet(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payLoad: string): string {
    logger.debug("RPC called for updating wallet.");

    // Parse the incoming payload which contains user ID and metadata
    let changeSet: Record<string, number>;
    try {
        changeSet = JSON.parse(payLoad);
    } catch (error) {
        logger.error("Failed to parse the request payload.");
        throw Error("Invalid request payload.");
    }

    if (ctx.userId === undefined)
        throw Error("User id is undefined!");

    // Update the user metadata
    try {
        nk.walletUpdate(ctx.userId, changeSet)
    } catch (error) {
        logger.error(`Failed to update wallet for user ID: ${ctx.userId}`);
        throw Error(`Failed to update wallet for user ID: ${ctx.userId}`);
    }

    logger.debug(`Wallet updated successfully for user ID: ${ctx.userId}`);

    // Return a success response
    return JSON.stringify({ success: true });
}