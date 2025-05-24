import { Children, New, Value } from "@rbxts/fusion";
import { HidingSpotBlocked } from "../UIComponents/BaseComponents/HidingSpotBlocked";

function story(target: Frame) {
    const component = New("Frame")({
        Parent: target,
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: [
            HidingSpotBlocked({
                Blocked: Value(true),
            }),
        ]
    });

    return () => {
        component.Destroy();
    };
}

export = story;
