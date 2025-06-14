// src/state/SmartphoneState.ts
import { Value } from "@rbxts/fusion";
import type { App } from "client/controllers/GUI/UIComponents/Smartphone/Apps/App";

// Globaler State – initial z. B. mit Home
export const currentApp = Value<App | undefined>(undefined);
