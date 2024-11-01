function UpdateMetadata(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payLoad: string): string {
    logger.debug("RPC called for updating user metadata.");

    // Parse the incoming payload which contains user ID and metadata
    let metaData: Record<string, any>;
    try {
        metaData = JSON.parse(payLoad);
    } catch (error) {
        logger.error("Failed to parse the request payload.");
        throw Error("Invalid request payload.");
    }

    if (ctx.userId === undefined)
        throw Error("User id is undefined!");

    // Fetch the user account
    let account: nkruntime.Account;
    try {
        account = nk.accountGetId(ctx.userId);
    } catch (error) {
        logger.error(`Failed to get account for user ID: ${ctx.userId}`);
        throw Error(`User with ID ${ctx.userId} not found.`);
    }

    // Merge existing metadata with new metadata
    const updatedMetadata = {
        ...account.user.metadata,
        ...metaData
    };

    // Update the user metadata
    try {
        nk.accountUpdateId(ctx.userId, account.user.username, account.user.displayName, account.user.timezone,
            account.user.location, account.user.langTag, account.user.avatarUrl, updatedMetadata);
    } catch (error) {
        logger.error(`Failed to update metadata for user ID: ${ctx.userId}`);
        throw Error(`Failed to update metadata for user ID: ${ctx.userId}`);
    }

    logger.debug(`Metadata updated successfully for user ID: ${ctx.userId}`);

    // Return a success response
    return JSON.stringify({ success: true });
}