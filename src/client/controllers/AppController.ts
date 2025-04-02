import { Controller, OnStart } from "@flamework/core";
import { Children, New } from "@rbxts/fusion";
import {  Players } from "@rbxts/services";
import { MyButton } from "./GUI/UIComponents/BaseComponents/MyButton";
import { RessourceDisplay } from "./GUI/UIComponents/ComplexComponents/RessourceDisplay";

@Controller()
export class AppController implements OnStart {
    onStart(): void {
        const playerGUI = Players.LocalPlayer.FindFirstChild("PlayerGui");
        if (playerGUI) {
            const app = New("ScreenGui")({
                Name: "App",
                Parent: playerGUI,
                [Children]: [
                    RessourceDisplay({
                        Position: UDim2.fromScale(0.7,0.0),
                        Number: 999999,
                    }),
                ]
            })
        }
    }
}