import { Controller, OnRender } from "@flamework/core";

@Controller()
export class MyController implements OnRender {
	onRender(dt: number): void {
		//print("My controller is rendering", dt);
	}
}
