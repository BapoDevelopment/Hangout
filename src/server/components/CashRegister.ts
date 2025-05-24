import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { ServerSettings } from "server/ServerSettings";
import { AudioService } from "server/services/AudioService";
import { ReplicatedStorage } from "@rbxts/services";

interface ICashRegisterComponent extends Model {
    Drawer: Model & {
        PrimaryPart: Part;
    };
    Hitbox: Part & {
        Hit: Sound;
        Break: Sound;
    };
    GoalPosition: Part;
    Alarm: Part & {
        PointLight: PointLight;
        Alarm: Sound;
    },
    MoneySpawner: Part;
}

@Component({
    tag: "CashRegister",
})
export class CashRegister extends BaseComponent<{}, ICashRegisterComponent> implements OnStart {

    private originCFrame: CFrame = this.instance.Drawer.PrimaryPart.CFrame;
    private hits: number = 0;
    private lastHit: DateTime = DateTime.now();
    private robbedBy: Player | undefined;
    private robbed: boolean = false;

    constructor(private audioService: AudioService) {
        super();
    }

    onStart() {
        print("I'm a cash register");
    }

    public hit(player: Player) {
        if(this.robbed) { return; }
        if(!(DateTime.now().UnixTimestamp - this.lastHit.UnixTimestamp > ServerSettings.CashRegister.PUNCH_COOLDOWN)) { return; }
        print("i was hitted");

        this.hits++;
        this.lastHit = DateTime.now();
        this.audioService.playSound(this.instance.Hitbox.Hit);

        if(this.hits === ServerSettings.CashRegister.HITS_TO_OPEN) {
            this.hits = 0;
            this.robbedBy = player;
            this.robbed = true;
            this.instance.Drawer.PrimaryPart.PivotTo(this.instance.GoalPosition.CFrame);
            this.audioService.playSound(this.instance.Hitbox.Break);
            this.audioService.playSound(this.instance.Alarm.Alarm);
            print("Robbed by " + tostring(player.Name));

            
            for(let i = 0; i < 10; i++) {
                const rnd: number = math.random(0, ReplicatedStorage.Money.GetChildren().size());
                const rndMoney: Part = ReplicatedStorage.Money.GetChildren()[rnd].Clone() as Part;
                rndMoney.Position = this.instance.MoneySpawner.Position;

                const attachment: Attachment = new Instance("Attachment") as Attachment;
                attachment.Parent = rndMoney;
                
                const velocity: LinearVelocity = new Instance("LinearVelocity");
                velocity.Parent = rndMoney;
                velocity.MaxForce = 25;
                velocity.VectorVelocity = new Vector3(math.random(0, 360), math.random(0, 360), math.random(0, 360));
                velocity.Attachment0 = attachment;

                rndMoney.Parent = this.instance.MoneySpawner;
            }

            task.spawn(() => {
                for(let i = 0; i < 44; i++) {
                    wait(0.40);
                    this.instance.Alarm.Material = Enum.Material.Neon;
                    this.instance.Alarm.PointLight.Enabled = true;
                    wait(0.06);
                    this.instance.Alarm.Material = Enum.Material.SmoothPlastic;
                    this.instance.Alarm.PointLight.Enabled = false;
                    wait(0.06);
                    this.instance.Alarm.Material = Enum.Material.Neon;
                    this.instance.Alarm.PointLight.Enabled = true;
                    wait(0.06);
                    this.instance.Alarm.Material = Enum.Material.SmoothPlastic;
                    this.instance.Alarm.PointLight.Enabled = false;
                }
            });
            
            task.spawn(() => {
                wait(ServerSettings.CashRegister.ROB_COOLDOWN);
                this.robbedBy = undefined;
                this.robbed = false;
                this.instance.Drawer.PrimaryPart.PivotTo(this.originCFrame);
                this.instance.Alarm.Material = Enum.Material.SmoothPlastic;
                this.instance.Alarm.PointLight.Enabled = false;
            });
        }
    }
}