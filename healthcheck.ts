function rpcHealthcheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payLoad: string): string {
    logger.info('healthcheck rpc called!');
    return JSON.stringify({ success: true });
}