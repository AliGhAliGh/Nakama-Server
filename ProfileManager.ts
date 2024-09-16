// initializer.RegisterRpc("UpdateMetadata", func(ctx context.Context, logger runtime.Logger, db * sql.DB, nk runtime.NakamaModule, payload string)(string, error) {
//     userId, ok:= ctx.Value(runtime.RUNTIME_CTX_USER_ID).(string)
//     if !ok {
//     return "", errors.New("could not get user ID from context")
// }

//     if err := nk.AccountUpdateId(ctx, userId, "", map[string]interface{}{
//     "title": "Definitely Not The Imposter",
//     "hat": "space_helmet"
//         "skin": "alien"
// },
//     }, "", "", "", "", ""); err != nil {
//     return "", errors.New("could not update account")
// }

// return "{}", nil
// })

function UpdateMetadata(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payLoad: string): string {
    logger.info("RPC called for updating user metadata.");

    // Parse the incoming payload which contains user ID and metadata
    let metaData: Record<string, any>;
    try {
        metaData = JSON.parse(payLoad);
    } catch (error) {
        logger.error("Failed to parse the request payload.");
        throw Error("Invalid request payload.");
    }

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

    logger.info(`Metadata updated successfully for user ID: ${ctx.userId}`);

    // Return a success response
    return JSON.stringify({ success: true });
}