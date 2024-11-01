const LobbySize = 2;

function CreateMatch(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payLoad: string): string {
    let matchName: string;
    try {
        const jsonPayload = JSON.parse(payLoad);
        matchName = jsonPayload.matchName; // Extract match name from client payload
    } catch (error) {
        logger.error("Invalid payload: " + error);
        throw Error("Invalid payload format.");
    }

    const label = JSON.stringify({
        name: matchName,
        ownerId: ctx.userId
    });

    let matchId: string;
    try {
        matchId = nk.matchCreate("main", { label: label });
    } catch (error) {
        logger.error("Failed to create match: " + error);
        throw Error("Match creation failed.");
    }

    return JSON.stringify({ matchId: matchId });
}

function MatchList(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payLoad: string): string {
    const limit = 10
    const isAuthoritative = true;
    const minSize = 1;
    const maxSize = LobbySize - 1;
    const matches = nk.matchList(limit, isAuthoritative, null, minSize, maxSize, null);
    return matches.map(c => JSON.stringify(c)).join("|");
}

const matchInit = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: { [key: string]: string }): { state: nkruntime.MatchState, tickRate: number, label: string } {
    return {
        state: {
            presences: {},
            emptyTicks: 0,
            playerIds: [],
            messages: []
        },
        tickRate: 1,
        label: params.label
    };
};

const matchJoin = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): { state: nkruntime.MatchState } | null {
    presences.forEach(function (p) {
        state.presences[p.sessionId] = p;
    });

    if (state.playerIds.length != 0 || lobbySize(state) == LobbySize) {
        if (state.playerIds.length == 0) {
            state.playerIds = (<nkruntime.Presence[]>Object.values(state.presences)).map(c => c.userId);
            dispatcher.broadcastMessageDeferred(1, state.playerIds.join("|"), null, undefined, true);
        }
        else {
            dispatcher.broadcastMessageDeferred(1, state.playerIds.join("|"), presences, undefined, true);
            let syncMessages = splitArrayIntoChunks(<nkruntime.MatchMessage[]>state.messages);
            syncMessages.forEach(s => {
                dispatcher.broadcastMessageDeferred(2, s.map(c => messageToJson(c, nk)).join("|"), presences, undefined, true);
            });
        }
    }
    return {
        state
    };
}

const matchJoinAttempt = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: { [key: string]: any }): { state: nkruntime.MatchState, accept: boolean, rejectMessage?: string } | null {
    return {
        state,
        accept: lobbySize(state) < LobbySize && (state.playerIds.length == 0 || state.playerIds.includes(presence.userId))
    };
}

const matchLeave = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): { state: nkruntime.MatchState } | null {
    presences.forEach(function (p) {
        delete (state.presences[p.sessionId]);
    });

    return {
        state
    };
}

const matchSignal = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, data: string): { state: nkruntime.MatchState, data?: string } | null {
    return {
        state
    };
}

const matchTerminate = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number): { state: nkruntime.MatchState } | null {
    return {
        state
    };
}

const matchLoop = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]): { state: nkruntime.MatchState } | null {
    if (lobbySize(state) === 0)
        state.emptyTicks++;
    else state.emptyTicks = 0;

    state.messages = (<nkruntime.MatchMessage[]>state.messages).concat(messages);
    messages.forEach(message => {
        dispatcher.broadcastMessageDeferred(message.opCode, message.data, null, message.sender, true);
    });

    if (state.emptyTicks > 10)
        return null;

    return {
        state
    };
}

function lobbySize(state: nkruntime.MatchState): number {
    return Object.keys(state.presences).length;
}

function splitArrayIntoChunks<T>(arr: T[], chunkSize: number = 5): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}

function messageToJson(message: nkruntime.MatchMessage, nk: nkruntime.Nakama): string {
    let obj = {
        opCode: message.opCode,
        data: message.data == null ? "" : nk.base64Encode(message.data),
        sender: message.sender.userId
    }
    return JSON.stringify(obj);
}