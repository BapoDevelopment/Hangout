import { New, Observer, OnEvent, Tween, Value } from "@rbxts/fusion";

export interface IHidingSpotBlocked {
    Blocked: Value<boolean>;
}

export function HidingSpotBlocked(props: IHidingSpotBlocked) {
    const TextTransparancy = Value(1);
    const tweenInfo: TweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad);
    let TextTransparancyTween = Tween(TextTransparancy, tweenInfo);

    if(props.Blocked.get() === true) { TextTransparancy.set(0); }

    let task1: thread | undefined = undefined;
    let observer = Observer(props.Blocked);
    observer.onChange(() => {
        if(props.Blocked.get() === false) {
            if(task1) { task.cancel(task1); }
            TextTransparancy.set(1);
        }
        if(props.Blocked.get() === true) {
            TextTransparancy.set(0);
            task1 = task.spawn(() => {
                wait(5);
                const tweenInfo: TweenInfo = new TweenInfo(3, Enum.EasingStyle.Quad);
                TextTransparancyTween = Tween(TextTransparancy, tweenInfo);
                TextTransparancy.set(1);
            });
        }
    });

    return New("TextButton")({
        BackgroundTransparency: 1,
        Size: UDim2.fromScale(0.7,0.1),
        Position: UDim2.fromScale(0.5,0.75),
        AnchorPoint: new Vector2(0.5, 0.5),
        Text: "Something is stopping you from hiding...",
        TextColor3: Color3.fromRGB(251, 231, 222),
        Font: Enum.Font.Oswald,
        TextTransparency: TextTransparancyTween,
        TextScaled: true,
    })
}