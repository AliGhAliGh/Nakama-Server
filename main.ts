function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc("HealthCheck", rpcHealthcheck);
    initializer.registerRtAfter("MatchCreate", MatchCreateBeforeHook);
    logger.info('javascript has loaded!');
}

const MatchCreateBeforeHook: nkruntime.RtAfterHookFunction<nkruntime.Envelope> = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, output: nkruntime.Envelope | null, input: nkruntime.Envelope): void => {
    nk.storageWrite([{
        key: '',
        collection: '',
        userId: '',
        permissionRead: 1,
        permissionWrite: 0,
        value: {
            LastMatch: ctx.
        }
    }])
};
