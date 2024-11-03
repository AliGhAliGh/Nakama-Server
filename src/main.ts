function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc("ChangeMetaData", UpdateMetadata);
    initializer.registerRpc("ChangeWallet", UpdateWallet);
    initializer.registerRpc("CreateMatch", CreateMatch);
    initializer.registerRpc("MatchList", MatchList);
    initializer.registerMatch("main", {
        matchInit: matchInit,
        matchJoin: matchJoin,
        matchLeave: matchLeave,
        matchLoop: matchLoop,
        matchJoinAttempt: matchJoinAttempt,
        matchSignal: matchSignal,
        matchTerminate: matchTerminate
    });
    logger.info('javascript has loaded v2!');
}
