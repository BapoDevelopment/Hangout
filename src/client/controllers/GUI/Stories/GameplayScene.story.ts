import { Children, New } from "@rbxts/fusion";
import { RessourceDisplay } from "../UIComponents/ComplexComponents/RessourceDisplay";

function story(target: Frame) {

    const component = New("Frame")({
        Parent: target,
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: [
            RessourceDisplay({
                Position: UDim2.fromScale(0.8, 0),
                Number: 0,
            }),
        ],
    });

    return () => {
        component.Destroy();
    };
}

export = story;