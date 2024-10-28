function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc("HealthCheck", rpcHealthcheck);
    initializer.registerRpc("ChangeMetaData", UpdateMetadata);
    initializer.registerRpc("ChangeWallet", UpdateWallet);
    initializer.registerRpc("CreateMatch", CreateMatch);
    initializer.registerRpc("MatchList", MatchList);
    initializer.registerMatch("main", {
        matchInit,
        matchJoin,
        matchLeave,
        matchLoop,
        matchJoinAttempt,
        matchSignal,
        matchTerminate
    })
    logger.info('javascript has loaded v2!');
}
