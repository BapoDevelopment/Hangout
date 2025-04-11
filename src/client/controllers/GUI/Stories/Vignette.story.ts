import { Children, New, Value } from "@rbxts/fusion";
import { Vignette } from "../UIComponents/BaseComponents/Vignette";

function story(target: Frame) {
    const component = New("Frame")({
        Parent: target,
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: [
            Vignette({
                Enter: Value(false),
            }),
        ],
    });

    return () => {
        component.Destroy();
    };
}

export = story;
