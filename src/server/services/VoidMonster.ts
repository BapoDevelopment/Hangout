import { Components } from "@flamework/components";
import { Service, OnStart, Dependency } from "@flamework/core";
import { Room } from "server/components/Room";

@Service()
export class VoidMonster implements OnStart {
    
    onStart(): void {
        print("hi");
    }

    public attack(players: Player[], activeRooms: Model[]) {
        if(!players) { return; }
        const latestRoom: Room | undefined = this.getLatestRoomWithPlayerIn(activeRooms);
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
                            //this.logger.Warn("Character hasn't a PrimaryPart, so player will be killed.")
                            humanoid.Health = humanoid.Health - humanoid.Health;
                        }
                    }
                }
            }
            //this.logger.Debug("Player in last room: " + player.GetFullName());
        });
    }

    private getLatestRoomWithPlayerIn(activeRooms: Model[]): Room | undefined{
        const components = Dependency<Components>();
        for (let i = activeRooms.size() - 1; i >= 0; i--) {
            const room: Room | undefined = components.getComponent<Room>(activeRooms[i]);
            if(room) {
                if(room instanceof Room) {
                    const playersInRoom: Player[] | undefined = room.getPlayers();
                    if(playersInRoom && playersInRoom.size() > 0) {
                        return room;
                    }
                }
            }
        }
        //this.logger.Warn("No room with player found. Returning second oldest room.")
        return components.getComponent(activeRooms[2]);
    }
}