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
				TopBar({
					Money: Value("1.25M €"),
					Time: Value("17:52"),
				}),
				New("Frame")({
					Name: "Content",
					Size: UDim2.fromScale(0.94, 0.8),
					AnchorPoint: new Vector2(0.5, 0),
					Position: UDim2.fromScale(0.5, 0.1),
					BackgroundColor3: Color3.fromRGB(255, 184, 0),
					BackgroundTransparency: 0,
				}),
			],
		}),
};
