import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./Tools/AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { AudioService } from "server/services/AudioService";
import { CashService } from "server/services/CashService";
import { ReplicaServer } from "@rbxts/mad-replica";

interface ICashComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        Pickup: Sound;
    }
}

interface ICashAttributes extends IToolAttributes {
    Amount: number;
}

@Component({
    tag: "Cash",
    defaults: {
        Amount: 0,
    }
})
export class Cash extends AbstractToolBaseComponent<ICashAttributes, ICashComponent> implements OnStart{

    constructor(protected audioService: AudioService
        , protected toolService: ToolService
        , private cashService: CashService
        , protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });
    }
    
    onStart(): void {
        const replica = ReplicaServer.New({
            Token: ReplicaServer.Token("PlayerData"),
            Data: {
                Cash: profile.Data.Cash,
            },
        });
    }

    protected onProximityPromtActivated(player: Player): boolean {
        this.logger.Info(`Added ${this.attributes.Amount} to ${player.Name}.`);

        let coinsCollected: boolean = this.cashService.collectedCoins(player, this);

        const pickup: Sound = this.instance.Handle.Pickup.Clone();
        pickup.Parent = player.Character;

        this.audioService.playSoundWithCallback(pickup, () => {
            pickup.Destroy();
        });

        this.destroy();
        return coinsCollected;
    }

    public isStackable(): boolean {
        return false;
    }

    protected giveTool(player: Player): boolean {
        return false;
    }

    protected setStackable(stackable: number) {}

    protected onEquip(): void {}

    protected onUnequip(): void {}

    destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}