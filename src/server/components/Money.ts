import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Events } from "server/network";
import { CashService } from "server/services/CashService";

interface IMoneyComponent extends Part {}

interface IMoneyAttributes {
    Value: number;
    UserId: number;
}

@Component({
    tag: "Money",
})
export class Money extends BaseComponent<IMoneyAttributes, IMoneyComponent> implements OnStart {
    
    constructor(private cashService: CashService) {
        super();
    }

    onStart() {
        Events.collectMoney.connect((player, part) => {
            this.collect(player, part);
        });
    }

    public setValue(value: number): void {
        this.attributes.Value = value;
    }

    public setUserId(userId: number): void {
        this.attributes.UserId = userId;
    }

    private collect(player: Player, money: Part): void {
        if(this.instance !== money) { return; }
        if(player.UserId !== money.GetAttribute("UserId")) { return; }

        print("Value: " + tostring(this.attributes.Value));
        this.cashService.addCash(player, this.attributes.Value);

        this.destroy();
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}