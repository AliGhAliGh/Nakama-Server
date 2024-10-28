function rpcHealthcheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payLoad: string): string {
    logger.info(payLoad + 'healthcheck rpc called!');
    return JSON.stringify({ success: true, payLoad: payLoad });
}
