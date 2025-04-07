import { OnStart, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { Replica } from "@rbxts/mad-replica";

@Service()
export class ReplicaService implements OnStart{
    private Replicas = new Map<number, Replica>;
    
    constructor(private readonly logger: Logger) {}
    
    onStart(): void {
        this.logger.Debug("ReplicaService initialised.")
    }

    public getReplica(playerUserId: number): any {
        return this.Replicas.get(playerUserId);
    }

    public setReplica(playerUserId: number, replica: Replica): void {
        this.Replicas.set(playerUserId, replica);
    }

    public setCashPartPosition(playerUserId: number, position: Vector3): void {
        const replica = this.Replicas.get(playerUserId);
        if(!replica) { return; }

        replica.Set(["Cash", "PartPosition"], position);
    }
}
