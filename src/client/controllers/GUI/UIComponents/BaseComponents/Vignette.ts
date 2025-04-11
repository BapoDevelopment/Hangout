import { Children, New, Observer, OnEvent, Tween, Value } from "@rbxts/fusion";
import { AudioController } from "client/controllers/AudioController";
import { Lighting, TweenService } from "@rbxts/services";
import { ClientSettings } from "client/ClientSettings";

export interface IVignette {
    Enter: Value<boolean>;
    AudioController?: AudioController;
}

export function Vignette(props: IVignette) {
    const VingetteTransparancy = Value(1);
    const FullscreenBlackTransparancy = Value(1);
    const RedVignetteTransparancy = Value(1);
    const RedVignetteColor = Value(Color3.fromRGB(115, 10, 10));
    const TexturedVignetteSize = Value(UDim2.fromScale(1.5, 1.5));
    const TextWarningTransparancy = Value(1);

    const VingetteTransparancyTween = Tween(VingetteTransparancy, new TweenInfo(0.25, Enum.EasingStyle.Quad));
    const FullscreenBlackTransparancyTween = Tween(FullscreenBlackTransparancy, new TweenInfo(9, Enum.EasingStyle.Quad));
    const RedVignetteTransparancyTween = Tween(RedVignetteTransparancy, new TweenInfo(2, Enum.EasingStyle.Quad));
    const TexturedVignetteSizeTween = Tween(TexturedVignetteSize, new TweenInfo(4, Enum.EasingStyle.Quad));
    const TextWarningTransparancyTween = Tween(TextWarningTransparancy, new TweenInfo(0.5, Enum.EasingStyle.Quad));

    let task1: thread | undefined = undefined;
    let task2: thread | undefined = undefined;
    let task3: thread | undefined = undefined;
    let task4: thread | undefined = undefined;

    let observer = Observer(props.Enter);
    observer.onChange(() => {
        if(props.Enter.get() === false) {
            print("Exit");
            if(task2) { task.cancel(task2); }
            if(task3) { task.cancel(task3); }
            if(task1) { task.cancel(task1); }
            if(task4) { task.cancel(task4); }
            
            VingetteTransparancy.set(1);
            FullscreenBlackTransparancy.set(1);
            RedVignetteTransparancy.set(1);
            RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
            TexturedVignetteSize.set(UDim2.fromScale(1.5, 1.5));
            TextWarningTransparancy.set(1);

            const colorCorrection = Lighting.FindFirstChildOfClass("ColorCorrectionEffect");
            print("Exit 2");
            if (colorCorrection) {
                print("Exit 3");
                colorCorrection.Saturation = 0;
                colorCorrection.Contrast = 0;
                colorCorrection.Brightness = 0;
            }
            print("Exit 4");

            if(props.AudioController) { props.AudioController?.stopWardrobeWarnings(); }

        } else if(props.Enter.get() === true) {
            print("Enter");

            task1 = task.spawn(() => {
                VingetteTransparancy.set(0.12),
                wait(9);
                FullscreenBlackTransparancy.set(0.7);
                wait(3);
                if(props.AudioController) { props.AudioController?.playWardrobeWarnings(); }

                RedVignetteTransparancy.set(0.7);
                TexturedVignetteSize.set(UDim2.fromScale(1, 1));
                task2 = task.spawn(() => {
                    wait(0.5);
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(128, 15, 15));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(207, 61, 61));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(209, 61, 61));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.14);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                    wait(0.27);
                    RedVignetteColor.set(Color3.fromRGB(222, 69, 69));
                    wait(0.04);
                    RedVignetteColor.set(Color3.fromRGB(115, 10, 10));
                });

                task3 = task.spawn(() => {
                    wait(7);
                    TextWarningTransparancy.set(0);
                    wait(0.04);
                    TextWarningTransparancy.set(1);
                    wait(0.07);
                    TextWarningTransparancy.set(0);
                    wait(0.04);
                    TextWarningTransparancy.set(1);
                    wait(0.29);
                    TextWarningTransparancy.set(0);
                    wait(0.04);
                    TextWarningTransparancy.set(1);
                    wait(0.35);
                    TextWarningTransparancy.set(0);
                    wait(0.04);
                    TextWarningTransparancy.set(1);
                    wait(1.39);
                    TextWarningTransparancy.set(0);
                    wait(0.04);
                    TextWarningTransparancy.set(1);
                    wait(0.20);
                    TextWarningTransparancy.set(0);
                    wait(0.04);
                    TextWarningTransparancy.set(1);
                    wait(1.28);
                    TextWarningTransparancy.set(0);
                    wait(0.04);
                    TextWarningTransparancy.set(1);
                });

                task4 = task.spawn(() => {
                    const colorCorrection = Lighting.FindFirstChildOfClass("ColorCorrectionEffect");

                    if (colorCorrection) {
                        const tweenInfo = new TweenInfo(8.29, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
                        const targetProperties = {
                            Saturation: -0.3,
                            Contrast: 0.3,
                        }
                        const tween = TweenService.Create(colorCorrection, tweenInfo, targetProperties);
                        tween.Play();
                    }
                    wait(8.29);
                    if (colorCorrection) {
                        colorCorrection.Saturation = -0.5;
                        colorCorrection.Contrast = 0;
                        colorCorrection.Brightness = 0.4;
                    }
                    if (colorCorrection) {
                        const tweenInfo = new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
                        const targetProperties = {
                            Saturation: -0.3,
                            Contrast: 0.3,
                            Brightness: 0,
                        }
                        const tween = TweenService.Create(colorCorrection, tweenInfo, targetProperties);
                        tween.Play();
                    }
                    wait(0.4);
                    if (colorCorrection) {
                        const tweenInfo = new TweenInfo(14, Enum.EasingStyle.Quad, Enum.EasingDirection.In, 0, false, 0);
                        const targetProperties = {
                            Saturation: ClientSettings.DEFAULTS.LIGHTING.COLORCORRECTION.SATURATION,
                            Contrast: ClientSettings.DEFAULTS.LIGHTING.COLORCORRECTION.CONTRAST,
                            Brightness: ClientSettings.DEFAULTS.LIGHTING.COLORCORRECTION.BRIGHTNESS,
                        }
                        const tween = TweenService.Create(colorCorrection, tweenInfo, targetProperties);
                        tween.Play();
                    }
                });

                wait(17.11);
                VingetteTransparancy.set(1),
                FullscreenBlackTransparancy.set(1);
                RedVignetteTransparancy.set(1);
                TexturedVignetteSize.set(UDim2.fromScale(1.5, 1.5));
                TextWarningTransparancy.set(1);
            });
        }
    });

    return New("Frame")({
        Name: "Wardrobe",
        BackgroundColor3: Color3.fromRGB(255, 255, 255),
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: [
            New("ImageLabel")({
                Name: "Vingette",
                Size: UDim2.fromScale(1, 1),
                Image: "rbxassetid://12175750943",
                BackgroundTransparency: 1,
                ImageTransparency: VingetteTransparancyTween,
            }),
            New("Frame")({
                Name: "FullscreenBlack",
                BackgroundColor3: Color3.fromRGB(0, 0, 0),
                Size: UDim2.fromScale(1, 1),
                Transparency: FullscreenBlackTransparancyTween,
            }),
            New("ImageLabel")({
                Name: "RedVignette",
                Size: UDim2.fromScale(1, 1),
                Image: "rbxassetid://520946063",
                BackgroundTransparency: 1,
                ImageColor3: RedVignetteColor,
                ImageTransparency: RedVignetteTransparancyTween,
            }),
            New("ImageLabel")({
                Name: "TexturedVignette",

                Size: TexturedVignetteSizeTween,
                Image: "rbxassetid://1180721582",
                BackgroundTransparency: 1,
                AnchorPoint: new Vector2(0.5, 0.5),
                Position: UDim2.fromScale(0.5, 0.5),
                ImageColor3: Color3.fromRGB(82, 13, 13),
            }),
            New("ImageLabel")({
                Name: "TextWarning",
                Size: UDim2.fromScale(1, 1),
                Image: "rbxassetid://82759541",
                BackgroundTransparency: 1,
                ImageTransparency: TextWarningTransparancyTween,
            })
        ],
    });
}