import { Controller, OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { ReplicatedStorage } from "@rbxts/services";

@Controller()
export class AudioController implements OnStart {

    private readonly wardrobeScream: Sound = ReplicatedStorage.Audio.Sounds.Furniture.Wardrobe.Scream;
    private readonly wardrobeHeartbeat: Sound = ReplicatedStorage.Audio.Sounds.Furniture.Wardrobe.Heartbeat;

    constructor(private logger: Logger) {}

    onStart(): void {}

    public playSound(sound: Sound): void {
        try {
            sound.Play();
        } catch (error) {
            this.logger.Warn(`Unable to play Sound ${sound}`);
        }
    }

    public playWardrobeWarnings(): void {
        this.playSound(this.wardrobeScream);
        this.playSound(this.wardrobeHeartbeat);
    }

    public stopWardrobeWarnings(): void {
        if(this.wardrobeScream.IsPlaying === true) {
            this.wardrobeScream.Stop();
            this.wardrobeHeartbeat.Stop();
        }
    }
}