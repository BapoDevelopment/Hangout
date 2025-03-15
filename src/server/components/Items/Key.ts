import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { ServerSettings } from "server/ServerSettings";

interface IKeyComponent extends IToolComponent {}

interface IKeyAttributes extends IToolAttributes {
    Door: number;
}

@Component({
    tag: "Key",
})
export class Key extends AbstractToolBaseComponent<IKeyAttributes, IKeyComponent> implements OnStart{

    constructor(protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });

        this.setStackable(ServerSettings.ITEMS.KEY.STACKABLE);
    }
    
    onStart(): void {}

    public setNumber(number: number): void {
        this.attributes.Door = number;
        this.instance.SetAttribute("Door", number);
        this.logger.Debug(`Set key number to ${number}`);
    }
}