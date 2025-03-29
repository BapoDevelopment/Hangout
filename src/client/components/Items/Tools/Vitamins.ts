import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Events } from "client/network";
import { AbstractToolBaseComponent } from "./AbstractToolBaseComponent";
import { TweenService } from "@rbxts/services";
import { SharedSettings } from "shared/SharedSettings";
import { ClientSettings } from "client/ClientSettings";

interface IVitaminsComponent extends Tool {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        Lid: MeshPart;
    };
}

interface IVitaminsAttributes {}

@Component({
    tag: "Vitamins",
})
export class Vitamins extends AbstractToolBaseComponent<IVitaminsAttributes, IVitaminsComponent> implements OnStart {

    constructor(protected logger: Logger) {
        super(logger);
    }
    
    onStart(): void {}

    protected onActivated(): void {
        if(super.isToolEquipped()) {
            Events.items.vitamins.clickedEvent.fire();
        }

        if(!game.Workspace.CurrentCamera) { return; }
        const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const targetProperties = {
            FieldOfView: SharedSettings.ITEMS.VITAMINS.FIELD_OF_VIEW
        }
        const tween = TweenService.Create(game.Workspace.CurrentCamera, tweenInfo, targetProperties);
        tween.Play();

        task.spawn(() => {
            task.wait(SharedSettings.ITEMS.VITAMINS.DURATION); // 0.001 =^ 1 Millisecond
            if(!game.Workspace.CurrentCamera) { return; }
            const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
            const targetProperties = {
                FieldOfView: ClientSettings.DEFAULTS.CAMERA.FIELD_OF_VIEW
            }
            const tween = TweenService.Create(game.Workspace.CurrentCamera, tweenInfo, targetProperties);
            tween.Play();
        });
    }
}