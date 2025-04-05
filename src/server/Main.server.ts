import { ReplicaServer } from "@rbxts/mad-replica";
import { Players } from "@rbxts/services";

interface PlayerData {
    Score: number,
    Nested: {
        Value: boolean,
    }
}

Players.PlayerAdded.Connect((player: Player) => {

    let replica = ReplicaServer.New({
        Token: ReplicaServer.Token("GlobalData" as unknown as never),
        Data: {
            Score: 50,
            Nested: {
                Value: false,
            },
        } as unknown as undefined,
    });

    replica.Replicate();

    task.spawn(() => {
        let tempVar: number = 100;
        while(true) {
            replica.Set(["Score"] as unknown as never, ((replica.Data as PlayerData).Score + 100) as never);
            tempVar += 100;
            task.wait(1);
        }
    });

    replica.Set(["Value"] as unknown as never, true as never);
});