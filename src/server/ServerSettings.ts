import { SharedSettings } from "shared/SharedSettings";

export const ServerSettings = {
    GAME: {
        START_ROOMS: 5,
        TOTAL_ROOMS: 100,
        MAX_ACTIVE_ROOMS: 10,
        LAST_ROOM: 100,
        DEFAULT_WALKSPEED: 16,
    },
    ROOMS: {
        DOOR_LOCKED_PROBABILITY: 0,
    },
    FURNITURE: {
        DRAWER: {
            ITEM_SPAWN_PROBABILITY: 50,
        },
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
    ITEMS: {
        KEY: {
            STACKABLE: 0,
        },
        FLASHLIGHT: {
            SPAWN_RATE_IN_PERCENT: 20,
            STACKABLE: 0,
            BATTERY_DRAIN_PER_MILLISECOND: 0.01,
            MAX_BATTERY: 10,
        },
        BATTERY: {
            SPAWN_RATE_IN_PERCENT: 20,
            STACKABLE: 0,
        },
        LIGHTER: {
            SPAWN_RATE_IN_PERCENT: 20,
            STACKABLE: 0,
            GAS_DRAIN_PER_MILLISECOND: 0.01,
        },
        VITAMINS: {
            SPAWN_RATE_IN_PERCENT: 20,
            STACKABLE: 3,
            ADDED_WALKSPEED: 60,
            DURATION: SharedSettings.ITEMS.VITAMINS.DURATION,
            PAUSE: 3,
        },
        LOCKPICK: {
            SPAWN_RATE_IN_PERCENT: 20,
            STACKABLE: 3,
        }
    },
    RATE_LIMITS: {
        FLASHLIGHT: {
            UN_EQUIP: 0.3,
        },
    },
};