import { Service, OnStart, OnInit } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import ProfileStore, { Profile } from "@rbxts/profile-store";
import { Players, RunService } from "@rbxts/services";

interface IProfileTemplate {
	Cash: number,
}
type ProfileStoreType = Profile<IProfileTemplate>;
export type ProfileField = keyof IProfileTemplate;

@Service()
export class ProfileStoreService implements OnInit {
	readonly DEFAULT_PLAYER_DATA: IProfileTemplate = {
		Cash: 0,
	}

	private DataStoreName = RunService.IsStudio() ? "DevelopmentPlayerStore" : "ProductionPlayerStore";
	private PlayerStore = ProfileStore.New(this.DataStoreName, this.DEFAULT_PLAYER_DATA);
	private Profiles = new Map<number, ProfileStoreType>;

	constructor(private readonly logger: Logger) {}

	onInit(): void {
		this.logger.Debug("Initialise ProfileStoreService");
		
		Players.GetPlayers().forEach((player) => {
			task.spawn(() => {
				this.onPlayerAdded(player);
			})
		})

		Players.PlayerAdded.Connect((player) => {
			this.onPlayerAdded(player);
		});
		Players.PlayerRemoving.Connect((player) => {
			let profile = this.Profiles.get(player.UserId);
			if(profile) {
				profile.EndSession();
			}
		});	
		this.logger.Debug("Initialised ProfileStoreService");
	}

	private onPlayerAdded(player: Player): void {
		let profile = this.PlayerStore.StartSessionAsync(`${player.UserId}`, {Cancel: () => {
			return player.Parent !== Players;
		}});

		if(profile) {
			profile.AddUserId(player.UserId);
			profile.Reconcile();

			profile.OnSessionEnd.Connect(() => {
				this.Profiles.delete(player.UserId);
				player.Kick("Profile session end - Please rejoin");
			})

			if(player.Parent === Players) {
				this.Profiles.set(player.UserId, profile);
				this.logger.Info(`Profile loaded for ${player.DisplayName}`);
			} else {
				profile.EndSession();
			}
		} else {
			player.Kick("Profile load fial - Please rejoin");
		}
	}

	public getProfileField<T extends keyof IProfileTemplate>(player: Player, field: T): IProfileTemplate[T] | undefined {
		const profile = this.Profiles.get(player.UserId);
		if (!profile) {
			this.logger.Warn(`Profile not found for ${player.DisplayName}`);
			return undefined;
		}
	
		if (!(field in profile.Data)) {
			this.logger.Warn(`Field "${field}" does not exist in profile for ${player.DisplayName}`);
			return undefined;
		}
	
		return profile.Data[field];
	}

	public updateProfileField<T extends keyof IProfileTemplate>(player: Player, field: T, newValue: unknown): boolean {
		const profile = this.Profiles.get(player.UserId);
		if (!profile) {
			this.logger.Warn(`Profile not found for ${player.DisplayName}`);
			return false;
		}

		if (!(field in profile.Data)) {
			this.logger.Warn(`Field "${field}" does not exist in profile for ${player.DisplayName}`);
			return false;
		}

		const currentType = typeOf(profile.Data[field]);
		if (typeOf(newValue) !== currentType) {
			this.logger.Warn(
				`Type mismatch for field "${field}" in profile of ${player.DisplayName}: expected ${currentType}, got ${typeOf(newValue)}`
			);
			return false;
		}

		profile.Data[field] = newValue as IProfileTemplate[T];
		this.logger.Info(`Profile field "${field}" updated for ${player.DisplayName}`);
		return true;
	}

	public increaseProfileField<T extends keyof IProfileTemplate>(
		player: Player,
		field: T,
		increaseValue: unknown
	): boolean {
		const currentValue = this.getProfileField(player, field);
		if (currentValue === undefined) {
			this.logger.Warn(`Value "${field}" does not exist for ${player.DisplayName}`);
			return false;
		}
	
		const currentType = typeOf(currentValue);
		const increaseType = typeOf(increaseValue);
	
		if (increaseType !== currentType) {
			this.logger.Warn(
				`Type mismatch for field "${field}" in profile of ${player.DisplayName}: expected ${currentType}, got ${increaseType}`
			);
			return false;
		}
	
		if (typeOf(currentValue) === "number" && typeOf(increaseValue) === "number") {
			const newValue = currentValue + (increaseValue as number);
			return this.updateProfileField(player, field, newValue as IProfileTemplate[T]);
		} else {
			this.logger.Warn(`Cannot add values of type ${currentType}`);
		}
		return false;
	}
	
	public decreaseProfileField<T extends keyof IProfileTemplate>(
		player: Player,
		field: T,
		increaseValue: unknown
	): boolean {
		const currentValue = this.getProfileField(player, field);
		if (currentValue === undefined) {
			this.logger.Warn(`Value "${field}" does not exist for ${player.DisplayName}`);
			return false;
		}
	
		const currentType = typeOf(currentValue);
		const increaseType = typeOf(increaseValue);
	
		if (increaseType !== currentType) {
			this.logger.Warn(
				`Type mismatch for field "${field}" in profile of ${player.DisplayName}: expected ${currentType}, got ${increaseType}`
			);
			return false;
		}
	
		if (typeOf(currentValue) === "number" && typeOf(increaseValue) === "number") {
			const newValue = currentValue - (increaseValue as number);
			return this.updateProfileField(player, field, newValue as IProfileTemplate[T]);
		} else {
			this.logger.Warn(`Cannot subtract values of type ${currentType}`);
		}
		return false;
	}
}