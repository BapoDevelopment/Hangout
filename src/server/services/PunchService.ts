import { Dependency, OnStart, Service } from "@flamework/core";
import { Events } from "server/network";
import { Workspace, CollectionService } from "@rbxts/services";
import { ServerSettings } from "server/ServerSettings";
import { Components } from "@flamework/components";
import { CashRegister } from "server/components/CashRegister";

@Service()
export class PunchService implements OnStart{
    private punchConnection: RBXScriptConnection | undefined;

    constructor() {}
    
    onStart(): void {
        this.punchConnection = Events.punch.connect((player) => {
            this.handle(player);
        });
    }

    private handle(player: Player): void {
        const character: Model | undefined = player.Character;
        if(!character) { return; }

        const params = new RaycastParams();
        params.FilterType = Enum.RaycastFilterType.Exclude;
        params.FilterDescendantsInstances = character.GetChildren();

        const humanoidRootPart: Part | undefined = character.FindFirstChild("HumanoidRootPart") as Part;
        if(!humanoidRootPart) { return; }
        const origin: Vector3 = humanoidRootPart.Position;
        const direction: Vector3 = humanoidRootPart.CFrame.LookVector.mul(ServerSettings.Punch.ATTACK_DISTANCE);
        const result: RaycastResult | undefined= Workspace.Raycast(origin, direction, params);

        if(result) {
            if(CollectionService.HasTag(result.Instance, "CashRegisterHitbox")) {
                this.hitCashRegister(result.Instance, player);
            }
        }
    }

    private hitCashRegister(hitbox: BasePart, player: Player) {
        if(!hitbox.Parent) { return; }
        if(!CollectionService.HasTag(hitbox.Parent, "CashRegister")) { return; }

        const components = Dependency<Components>();
        components.waitForComponent<CashRegister>(hitbox.Parent).then((hitboxComponent) => {
            hitboxComponent.hit(player);
        });
    }
}
