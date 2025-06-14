import { Children, Computed, New, StateObject } from "@rbxts/fusion";
import { App } from "./Apps/App";
import { currentApp } from "../../Stories/Smartphone/State";
import { Home } from "./Apps/Home";
import { BottomBar } from "./BottomBar";

export interface IPhone {
	BackgroundImage: StateObject<string>;
}

export function Phone(props: IPhone) {
	return New("ImageLabel")({
		Name: "Display",
		Image: props.BackgroundImage,
		Position: UDim2.fromScale(0.015, 0.43),
		Size: UDim2.fromScale(0.381, 0.547),
		SizeConstraint: Enum.SizeConstraint.RelativeYY,
		BackgroundColor3: Color3.fromRGB(255, 0, 0),
		[Children]: [
			New("UICorner")({ CornerRadius: new UDim(0.12, 0) }),
			New("ImageLabel")({
				Image: "rbxassetid://101068688204041",
				Name: "Smartphone",
				Size: UDim2.fromScale(1, 1),
				BackgroundTransparency: 1,
				ClipsDescendants: true,
			}),
			Computed(() => currentApp.get()?.Element()),
			BottomBar(),
		],
	});
}
