import { OnStart, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";

@Service()
export class AudioService implements OnStart{
    constructor(private readonly logger: Logger) {}
    
    onStart(): void {
        this.logger.Debug("AudioService initialised.")
    }

    public playSound(sound: Sound) {
        try {
            sound.Play();
        } catch (error) {
            this.logger.Warn("Unable to play Sound: " + tostring(sound));
        }
    }

    public playSoundWithCallback(sound: Sound, callback: () => void) {
        this.playSound(sound);
        const connection = sound.Ended.Connect(() => {
            connection.Disconnect();
            callback();
        });
    }
}
