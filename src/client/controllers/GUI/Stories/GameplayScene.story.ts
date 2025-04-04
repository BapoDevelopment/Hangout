import { Children, New, Value, Computed } from "@rbxts/fusion";
import { RessourceDisplay } from "../UIComponents/ComplexComponents/RessourceDisplay";
import { RessourceContainer } from "../UIComponents/ComplexComponents/RessourceContainer";
import { Workspace } from "@rbxts/services";

function story(target: Frame) {
    const cashAmount = Value(0);
    const spawnCash = Value(0);

    const component = New("Frame")({
        Parent: target,
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: [
            RessourceDisplay({
                Position: UDim2.fromScale(0.7, 0.0),
                Number: cashAmount,
                Icon: Value("rbxassetid://117582891502895"),
            }),
            RessourceContainer({
                Icon: Value("rbxassetid://117582891502895"),
                amount: spawnCash,
                spawnPosition: UDim2.fromScale(0.5, 0.5),
                targetPosition: UDim2.fromScale(0.7, 0),
                radius: 50,
            }),
        ],
    });

    spawnCash.set(5);
    cashAmount.set(math.random(0, 999999));

    return () => {
        component.Destroy();
    };
}

export = story;
