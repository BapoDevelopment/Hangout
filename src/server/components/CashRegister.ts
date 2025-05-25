import { Component, BaseComponent, Components } from "@flamework/components";
import { Dependency } from "@flamework/core";
import { ServerSettings } from "server/ServerSettings";
import { AudioService } from "server/services/AudioService";
import { ReplicatedStorage } from "@rbxts/services";
import { Events } from "server/network";
import { Money } from "./Money";

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
    Money: Folder;
}

@Component({
    tag: "CashRegister",
})
export class CashRegister extends BaseComponent<{}, ICashRegisterComponent> {

    private originCFrame: CFrame = this.instance.Drawer.PrimaryPart.CFrame;
    private hits: number = 0;
    private lastHit: DateTime = DateTime.now();
    private robbedBy: Player | undefined;
    private robbed: boolean = false;

    constructor(private audioService: AudioService) {
        super();
    }

    public hit(player: Player) {
        if(this.robbed) { return; }
        if(!(DateTime.now().UnixTimestamp - this.lastHit.UnixTimestamp > ServerSettings.CashRegister.PUNCH_COOLDOWN)) { return; }

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

            this.spawnMoney(player);
            this.alarm();

            // Reset
            task.spawn(() => {
                wait(ServerSettings.CashRegister.ROB_COOLDOWN);
                this.robbedBy = undefined;
                this.robbed = false;
                this.instance.Drawer.PrimaryPart.PivotTo(this.originCFrame);
                this.instance.Alarm.Material = Enum.Material.SmoothPlastic;
                this.instance.Alarm.PointLight.Enabled = false;

                this.instance.Money.GetChildren().forEach(money => {
                    money.Destroy();
                });
            });
        }
    }

    private spawnMoney(player: Player): void {
        // Spawn Money
        for (let i = 0; i < 10; i++) {
            // 1) Clone the part and position it
            const moneyTemplates = ReplicatedStorage.WaitForChild("Money").GetChildren() as Part[];
            const rndIndex = math.random(0, moneyTemplates.size() - 1);
            const proto = moneyTemplates[rndIndex] as Part;
            const rndMoney = proto.Clone() as Part;

            // Set the part's position to the spawner's position (e.g. MoneySpawner)
            const spawner = this.instance.MoneySpawner;
            rndMoney.CFrame = spawner.CFrame;

            // 2) Calculate a random direction vector (unit vector)
            //    We choose a random spherical direction so it can fly in all directions
            const x = math.random(-100, 100) / 100; // Value ∈ [-1, +1]
            const y = math.random(50, 100) / 100;   // Value ∈ [0.5, 1] (thrown a bit upwards to avoid sliding along the floor)
            const z = math.random(-100, 100) / 100; // Value ∈ [-1, +1]
            const direction = new Vector3(x, y, z).Unit; // Normalize to length 1

            // 3) Choose a random speed so the part flies about 3–10 studs
            //    The value depends on gravity, damping, etc. 50–80 is a good starting range.
            //    You can fine-tune it to match the desired distance.
            const minSpeed = 50; // Speed for ~3 studs
            const maxSpeed = 80; // Speed for ~10 studs
            const speed = math.random(minSpeed, maxSpeed);

            // Create money component
            const components = Dependency<Components>();
            components.waitForComponent<Money>(rndMoney).then((moneyComponent) => {
                moneyComponent.setUserId(player.UserId);
            });

            // Add the part to the workspace (or desired parent)
            rndMoney.Parent = this.instance.Money;

            // 4) Apply a one-time impulse
            //    AssemblyLinearVelocity immediately sets the part’s velocity
            rndMoney.AssemblyLinearVelocity = direction.mul(speed);
        }

        // Delay, without delay, the parts aren't replicated
        task.delay(0.1, () => {
            Events.spawnedMoney(player, this.instance.Money.GetChildren() as Part[]);
        });
    }

    private alarm(): void {
        // Light effect
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
    }
}