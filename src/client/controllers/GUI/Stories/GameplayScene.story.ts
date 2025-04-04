import { Children, New, Value, Tween, Computed } from "@rbxts/fusion";
import { RessourceDisplay } from "../UIComponents/ComplexComponents/RessourceDisplay";
import { RessourceContainer } from "../UIComponents/ComplexComponents/RessourceContainer";

function story(target: Frame) {
    const cashAmount = Value(0);
    const animatedCash = Tween(cashAmount, new TweenInfo(0.5, Enum.EasingStyle.Sine));
    const displayedCash = Computed(() => {
        return math.floor(animatedCash.get());
    });

    const spawnCash = Value(0);
    const displaySize = Value(UDim2.fromScale(0.15, 0.05));
    const targetDisplaySize = UDim2.fromScale(0.2, 0.1);

    const component = New("Frame")({
        Parent: target,
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: [
            RessourceDisplay({
                Position: UDim2.fromScale(0.7, 0.075),
                Number: displayedCash,
                Icon: Value("rbxassetid://117582891502895"),
                Size: displaySize,
            }),
            RessourceContainer({
                Icon: Value("rbxassetid://117582891502895"),
                amount: spawnCash,
                spawnPosition: Value(UDim2.fromScale(0.1, 0.8)),
                targetPosition: Value(UDim2.fromScale(0.7, 0)),
                radius: 50,
                DisplaySize: displaySize,
                DefaultDisplaySize: displaySize.get(),
                TargetDisplaySize: targetDisplaySize,
            }),
        ],
    });

    spawnCash.set(15);
    task.delay(0.5, () => {
        cashAmount.set(math.random(0, 50));
    })

    return () => {
        component.Destroy();
    };
}

export = story;
