import { Controller, OnStart } from "@flamework/core";
import { Children, New, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { RadialMenu3D } from "./GUI/UIComponents/RadialMenu";

@Controller()
export class AppController implements OnStart {

    private radialMenu3DVisible = Value(false);

    onStart(): void {        
        const playerGUI = Players.LocalPlayer.FindFirstChild("PlayerGui");
        if (playerGUI) {
            New("ScreenGui")({
                IgnoreGuiInset: true,
                Name: "App",
                Parent: playerGUI,
                [Children]: [
                    RadialMenu3D({
                        visible: this.radialMenu3DVisible,
                    }),
                ],
            });
        }
    }

    public showRadialMenu3D(): void {
        this.radialMenu3DVisible.set(true);
    }

    public hideRadialMenu3D(): void {
        this.radialMenu3DVisible.set(false);
    }
}