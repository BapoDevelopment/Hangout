import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Events } from "client/network";
import { Players } from "@rbxts/services";

interface IMoneyComponent extends Part {}

interface IMoneyAttributes {
    Value: number;
    UserId: number;
}

@Component({
    tag: "Money",
})
export class MoneyComponent extends BaseComponent<IMoneyAttributes, IMoneyComponent> implements OnStart {

    onStart(): void {
        if(this.attributes.UserId !== Players.LocalPlayer.UserId) { return; }
        const prompt = new Instance("ProximityPrompt");
        prompt.ActionText = "Pick Up";
        prompt.ObjectText = "Money";
        prompt.HoldDuration = 2.5;
        prompt.KeyboardKeyCode = Enum.KeyCode.E;
        prompt.MaxActivationDistance = 8;
        prompt.RequiresLineOfSight = true;
        prompt.Parent = this.instance;

        prompt.Triggered.Connect(() => {
            Events.collectMoney(this.instance);
        });
    }
}
