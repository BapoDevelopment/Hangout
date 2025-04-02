import { Children, New, Value } from "@rbxts/fusion";
import { RessourceDisplay } from "../UIComponents/ComplexComponents/RessourceDisplay";
import { Icon } from "../UIComponents/BaseComponents/Icon";

function story(target: Frame) {

    const component = New("Frame")({
        Parent: target,
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: [
            RessourceDisplay({
                Position: UDim2.fromScale(0.8, 0),
                Number: Value(10),
            }),
            New("ImageLabel")({
                SizeConstraint: Enum.SizeConstraint.RelativeYY,
                Size: UDim2.fromScale(0.1, 0.1),
                Position: UDim2.fromScale(0.1, 0.1),
                Image: "rbxassetid://117582891502895",
                BackgroundTransparency: 1,
            })
        ],
    });

    return () => {
        component.Destroy();
    };
}

export = story;