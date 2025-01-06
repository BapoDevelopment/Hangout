interface RoomInfos {
    name: string;
    weight: number;
    readonly direction: "LEFT" | "RIGHT" | "UP" | "DOWN" | "STRAIGHT" | "BACKWARDS";
    stairs: boolean;
    [key: string]: any;
}

// Beispiel für die Daten
export const roomInfos: RoomInfos[] = [
    {name: "Lobby", weight: 1, direction: "STRAIGHT", stairs: false},
    {name: "Room1", weight: 2, direction: "STRAIGHT", stairs: false},
    {name: "Room2", weight: 2, direction: "STRAIGHT", stairs: false},
    {name: "Room3", weight: 2, direction: "RIGHT", stairs: false},
    {name: "Room4", weight: 2, direction: "LEFT", stairs: false},
    {name: "Room5", weight: 2, direction: "LEFT", stairs: false},
    {name: "Room6", weight: 2, direction: "RIGHT", stairs: false},
    {name: "Room7", weight: 2, direction: "LEFT", stairs: false},
    {name: "Room8", weight: 2, direction: "STRAIGHT", stairs: false}
];