import { ReplicaServer } from "@rbxts/mad-replica";
import { Players } from "@rbxts/services";

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
            replica.Set(["Score"] as unknown as never, tempVar as never);
            tempVar += 100;
            task.wait(1);
        }
    });

    //replica.Set("Nested" as never, true as never);
});