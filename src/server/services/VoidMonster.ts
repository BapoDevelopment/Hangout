import { Service, OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { IRoomAttributes, IRoomComponent, SuperRoom } from "server/components/Room/SuperRoom";

@Service()
export class VoidMonster implements OnStart {
    
    onStart(): void {}

    constructor(private readonly logger: Logger) {}

    public attack(players: Player[], activeRooms: SuperRoom<IRoomAttributes, IRoomComponent>[]) {
        if(!players) { return; }
        const latestRoom: SuperRoom<IRoomAttributes, IRoomComponent> | undefined = this.getLatestRoomWithPlayerIn(activeRooms);
        assert(latestRoom, "Void was unable to teleport player to the second last room.");

        players.forEach(player => {
            if(player.Character) {
                const humanoid: Humanoid |undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
                if(humanoid) {
                    humanoid.TakeDamage(50);
                    if(humanoid.Health > 0) {
                        if(player.Character.PrimaryPart) {
                            player.Character.PrimaryPart.PivotTo(latestRoom.instance.Markers.TeleportPosition.CFrame);
                        } else {
                            this.logger.Warn("Character hasn't a PrimaryPart, so player will be killed.")
                            humanoid.Health = humanoid.Health - humanoid.Health;
                        }
                    }
                }
            }
            this.logger.Debug("Player in last room: " + player.GetFullName());
        });
    }

    private getLatestRoomWithPlayerIn(activeRooms: SuperRoom<IRoomAttributes, IRoomComponent>[]): SuperRoom<IRoomAttributes, IRoomComponent> | undefined{
        let latestRoomWithPlayerIn: SuperRoom<IRoomAttributes, IRoomComponent> | undefined;
        for (let i = activeRooms.size() - 1; i >= 0; i--) {
            if(activeRooms[i]) {
                const playersInRoom: Player[] | undefined = activeRooms[i].getPlayers();
                this.logger.Info("A i:" + tostring(i) + " - " + tostring(playersInRoom?.size()));
                if(playersInRoom && playersInRoom.size() > 0) {
                    this.logger.Info("B");
                    latestRoomWithPlayerIn = activeRooms[i];
                    this.logger.Info("C");
                    break;
                }
                this.logger.Info("H");
            }
        }
        this.logger.Warn("No room with player found. Returning second oldest room.");
        return activeRooms[2];
    }
}