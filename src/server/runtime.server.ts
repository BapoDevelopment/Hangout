import { Flamework, Modding } from "@flamework/core";
import Log, { Logger } from "@rbxts/log";

// Setting up the logger.
Log.SetLogger(
    Logger.configure().WriteTo(Log.RobloxOutput()).Create(),
);
Modding.registerDependency<Logger>((ctor) => Log.ForContext(ctor));

Flamework.addPaths("src/server/components");
Flamework.addPaths("src/server/services");
Flamework.addPaths("src/shared/components");

Flamework.ignite();