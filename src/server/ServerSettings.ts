export const ServerSettings = {
    GAME: {
        START_ROOMS: 5,
        TOTAL_ROOMS: 100,
        MAX_ACTIVE_ROOMS: 10,
        LAST_ROOM: 100,
    },
    ROOMS: {
        DOOR_LOCKED_PROBABILITY: 0,
    },
    ENTITIES: {
        VOID: {
            DMG: 50,
        },
        RUSH: {
            SPAWN_RATES_IN_PERCENT: {
                BEFORE_ROOM_50: 25,
                AFTER_ROOM_50: 10,
            },
            MOVE_THROUGHT_N_ROOMS_FROM: 2,
            SPAWN_N_ROOMS_BEFORE: 2,
            SPEED: 35,
            MAX_DISTANCE: 500000,
        },
    },
};