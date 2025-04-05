import { ReplicaClient } from "@rbxts/mad-replica";

ReplicaClient.OnNew("GlobalData" as unknown as never, (replica) => {
    
    print(`Replica received client-side! Data:`, replica.Data);

    replica.OnSet(["Score"] as unknown as never, (new_value, old_value) => {
        print(`Score has changed from ${old_value} to ${new_value}`);
    });

});

ReplicaClient.RequestData();