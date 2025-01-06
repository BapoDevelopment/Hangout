import { OtherService } from "./OtherService";
import { Service } from "@flamework/core";

@Service()
export class MyService {
	constructor(private otherService: OtherService) {}

	method() {
		print(this.otherService.getName());
	}

	printHelloWorld() {
		print("Hello World!");
	}
}
