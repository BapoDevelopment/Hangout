import { Children, New, Value } from "@rbxts/fusion";
import { App } from "./App";
import { TopBar } from "../TopBar";

export const Chat: App = {
	Name: "Chat",
	Element: () =>
		New("Frame")({
			Name: "Chat",
			Size: UDim2.fromScale(1, 1),
			BackgroundColor3: Color3.fromRGB(168, 33, 135),
			BackgroundTransparency: 1,
			[Children]: [
				New("Frame")({
					Name: "Content",
					Size: UDim2.fromScale(1, 1),
					Position: UDim2.fromScale(0, 0),
					BackgroundColor3: Color3.fromRGB(255, 184, 0),
					BackgroundTransparency: 0,
					[Children]: [
						New("UICorner")({ CornerRadius: new UDim(0.12, 0) }),
					],
				}),
			],
		}),
};
