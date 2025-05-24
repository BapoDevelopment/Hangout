import { Controller, OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";

@Controller()
export class AudioController implements OnStart {

    constructor(private logger: Logger) {}

    onStart(): void {}

    public playSound(sound: Sound): void {
        try {
            sound.Play();
        } catch (error) {
            this.logger.Warn(`Unable to play Sound ${sound}`);
        }
    }
}