import { Children, New, Value, Computed } from "@rbxts/fusion";
import { RessourceDisplay } from "../UIComponents/ComplexComponents/RessourceDisplay";
import { RessourceContainer } from "../UIComponents/ComplexComponents/RessourceContainer";
import { Workspace } from "@rbxts/services";

const screenSize = Value(Workspace.CurrentCamera!.ViewportSize);

// Update screenSize, wenn sich die Fenstergröße ändert
Workspace.CurrentCamera!.GetPropertyChangedSignal("ViewportSize").Connect(() => {
    screenSize.set(Workspace.CurrentCamera!.ViewportSize);
});

function story(target: Frame) {
    const cashAmount = Value(0);
    const spawnCash = Value(5);

    const screenSize = Value(UDim2.fromScale(1, 1));

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
            }),
        ],
    });

    return () => {
        component.Destroy();
    };
}

export = story;
