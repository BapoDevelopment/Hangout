import { Value } from "@rbxts/fusion";
import { RadialMenu3D } from "../UIComponents/RadialMenu";
import { Players, UserInputService } from "@rbxts/services";

export = (target: Frame) => {
	const menu = RadialMenu3D({
		visible: Value(true),
	});

	menu.Parent = target;

	return () => {
		menu.Destroy();
	};
};
