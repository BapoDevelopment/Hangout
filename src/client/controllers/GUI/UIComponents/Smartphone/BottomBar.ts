import { Children, New, OnEvent } from "@rbxts/fusion";
import { currentApp } from "../../Stories/Smartphone/State";
import { Home } from "./Apps/Home";

export function BottomBar() {
	return New("Frame")({
		Name: "BottomBar",
		AnchorPoint: new Vector2(0.5, 1),
		Position: UDim2.fromScale(0.5, 0.985),
		Size: UDim2.fromScale(0.96, 0.08),
		BackgroundColor3: Color3.fromRGB(0, 0, 0),
		BackgroundTransparency: 0.5,

		[Children]: [
            New("TextButton")({
                Name: "BottomBar",
                AnchorPoint: new Vector2(0.5, 0),
                Position: UDim2.fromScale(0.5, 0),
                Size: UDim2.fromScale(0.325, 1),
                BackgroundColor3: Color3.fromRGB(0, 0, 0),
                BackgroundTransparency: 0.5,
                [Children]: [
                    New("ImageLabel")({
                        Name: "HomeButton",
                        Image: "rbxassetid://10928806245",
                        AnchorPoint: new Vector2(0.5, 0.5),
                        Position: UDim2.fromScale(0.5, 0.5),
                        Size: UDim2.fromScale(1, 1),
                        SizeConstraint: Enum.SizeConstraint.RelativeYY,
                        BackgroundTransparency: 1,
                    }),
                ],
                [OnEvent("Activated")]: () => {
                    currentApp.set(Home);
                },
            }),
		],
	});
}
