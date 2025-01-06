import { Service, OnTick } from "@flamework/core";

@Service()
export class OtherService implements OnTick {
	onTick(dt: number): void {
		//print("OtherService is ticking", dt);
	}

	getName(): string {
		return "idk mydd name :)";
	}
}
