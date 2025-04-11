import { Controller, OnStart } from "@flamework/core";
import { Children, Computed, New, Tween, Value } from "@rbxts/fusion";
import { GuiService, Players, Workspace } from "@rbxts/services";
import { RessourceDisplay } from "./GUI/UIComponents/ComplexComponents/RessourceDisplay";
import { RessourceContainer } from "./GUI/UIComponents/ComplexComponents/RessourceContainer";
import { ReplicaClient } from "@rbxts/mad-replica";
import { Vignette } from "./GUI/UIComponents/BaseComponents/Vignette";
import { AudioController } from "./AudioController";

declare global {
    interface Replicas {
        PlayerData: {
            Data: {
				Cash: {
					Amount: number;
					PartPosition: Vector3;
				},
                Furniture: {
                    Wardrobe: {
                        Vignette: boolean;
                    },
                },
            };
            Tags: {};
        };
    }
}

@Controller()
export class AppController implements OnStart {

    constructor(private audioController: AudioController) {}

    onStart(): void {
        const cashAmount = Value(0);
        const animatedCash = Tween(cashAmount, new TweenInfo(0.1, Enum.EasingStyle.Sine));
        const displayedCash = Computed(() => {
            return math.floor(animatedCash.get());
        });

        // Ressources
        const spawnCash = Value(0);
        const displaySize = Value(UDim2.fromScale(0.15, 0.05));
        const targetDisplaySize = UDim2.fromScale(0.2, 0.1);
        const ressourceSpawnPosition = Value(UDim2.fromScale(0.5, 0.5));

        // Furniture
        const wardrobeVignette = Value(false);
        
        const playerGUI = Players.LocalPlayer.FindFirstChild("PlayerGui");
        if (playerGUI) {
            New("ScreenGui")({
                IgnoreGuiInset: true,
                Name: "App",
                Parent: playerGUI,
                [Children]: [
                    RessourceDisplay({
                        Position: UDim2.fromScale(0.90, 0.05),
                        Number: displayedCash,
                        Icon: Value("rbxassetid://117582891502895"),
                        Size: displaySize,
                    }),
                    RessourceContainer({
                        Icon: Value("rbxassetid://117582891502895"),
                        amount: spawnCash,
                        spawnPosition: ressourceSpawnPosition,
                        targetPosition: Value(UDim2.fromScale(0.90, 0.05)),
                        timeToPos: 0.25,
                        transparencyTime: 0.1,
                        transperentAtThreshold: new Vector2(1, 8),
                        radius: 50,
                        DisplaySize: displaySize,
                        DefaultDisplaySize: displaySize.get(),
                        TargetDisplaySize: targetDisplaySize,
                    }),
                    Vignette({
                        Enter: wardrobeVignette,
                        AudioController: this.audioController,
                    }),
                ],
            });
        }

        ReplicaClient.OnNew("PlayerData", (replica) => {
            cashAmount.set(replica.Data.Cash.Amount);

            replica.OnSet(["Cash", "Amount"], (new_value, old_value) => {
                cashAmount.set(new_value);
                const deltaCash: number = new_value - old_value;
                if (deltaCash > 0) {

                    const camera = Workspace.CurrentCamera;
                    if (!camera) return;
                    const [screenPos, onScreen] = camera.WorldToScreenPoint(replica.Data.Cash.PartPosition);
                    if (!onScreen) return;
                    let inset = GuiService.GetGuiInset()[0].Y;
                    inset = inset ? inset : 0;
                    const screenPosition = UDim2.fromOffset(screenPos.X, screenPos.Y + inset);
        
                    ressourceSpawnPosition.set(screenPosition);
                    spawnCash.set(deltaCash);
                }
            });

            replica.OnSet(["Furniture", "Wardrobe", "Vignette"], (new_value, old_value) => {
                if(new_value === true) {
                    wardrobeVignette.set(true);
                } else {
                    wardrobeVignette.set(false);
                }
            });

        });
        ReplicaClient.RequestData();
    }
}
