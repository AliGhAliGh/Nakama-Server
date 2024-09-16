function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc("HealthCheck", rpcHealthcheck);
    initializer.registerRpc("ChangeMetaData", UpdateMetadata);
    // initializer.registerRtAfter("MatchJoin", MatchJoinAH);
    //initializer.registerRtBefore("MatchJoin", MatchJoinBH);

    logger.info('javascript has loaded v2!');
}

const MatchJoinBH: nkruntime.RtBeforeHookFunction<nkruntime.EnvelopeMatchJoin> = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, envelope: nkruntime.EnvelopeMatchJoin): void | nkruntime.EnvelopeMatchJoin => {
    try {
        nk.storageWrite([{
            key: 'LastMatch',
            collection: 'Match',
            userId: ctx.userId,
            permissionRead: 1,
            permissionWrite: 0,
            value: {
                LastMatch: envelope.matchJoin.id
            }
        }]);
        logger.info('match create : ' + envelope.matchJoin.id);
        logger.info('match meta : ' + envelope.matchJoin.metadata['engine']);
        return envelope;
    }
    catch {
        logger.info('failed to save!');
        throw new Error("Fail to add matchid to storage!");
    }
}

const MatchJoinAH: nkruntime.RtAfterHookFunction<nkruntime.EnvelopeMatchJoin> = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, output: nkruntime.EnvelopeMatchJoin | null, input: nkruntime.EnvelopeMatchJoin): void => {
    try {
        nk.storageWrite([{
            key: 'LastMatch',
            collection: 'Match',
            userId: ctx.userId,
            permissionRead: 1,
            permissionWrite: 0,
            value: {
                LastMatch: input.matchJoin.id
            }
        }]);
        logger.info('match create : ' + input.matchJoin.id);
        logger.info('match meta : ' + input.matchJoin.metadata['engine']);
    }
    catch {
        logger.info('failed to save!');
    }
    if (output)
        logger.debug(output.matchJoin.id)
};
