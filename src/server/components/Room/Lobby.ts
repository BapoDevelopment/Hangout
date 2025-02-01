import { Component } from "@flamework/components";
import { Logger } from "@rbxts/log/out/Logger";
import { IRoomAttributes, IRoomComponent, SuperRoom } from "./SuperRoom";
import { Flamework } from "@flamework/core";

interface ILobbyRoomComponent extends IRoomComponent {
    Build: Model;
    Markers: Instance & {
        Entrance: BasePart,
        Exit: BasePart
        TeleportPosition: BasePart
    };
    Zone: Model;
    Forniture: Folder;
    SpawnLocation: SpawnLocation;
}
const instanceGuard = Flamework.createGuard<ILobbyRoomComponent>();

@Component({
    tag: "Lobby",
    instanceGuard: instanceGuard,
})
export class Lobby extends SuperRoom <IRoomAttributes, ILobbyRoomComponent> {
    constructor(private readonly logger: Logger) {
        super();
    }
}