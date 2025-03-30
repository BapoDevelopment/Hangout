export {};
declare global {
    interface Workspace extends Instance {
        Rooms: Folder;
    }

    interface ReplicatedStorage extends Instance {
        Monsters: Folder & {
            Rush: Model;
        }
    }

    interface ServerStorage extends Instance {
        Doors: Folder & {
            Regular: Model;
            Locked: Model;
            Blocked: Model;
        };
        Rooms: Folder & {
            Necessary: Folder & {
                Lobby: Model;
                Room100: Model;
            };
            Regular: Folder & {
                Room1: Model;
            }
        };
        Furniture: Folder & {
            Drawer: Model;
            Wardrobe: Model;
            Bed: Model;
            AccentLamp: Model;
        };
        Tools: Folder & {
            Key: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                };
            };
            Flashlight: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                    SpotLight: SpotLight;
                };
            };
            Battery: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                    WeldConstraint: WeldConstraint;
                }
            };
            Lighter: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                    WeldConstraint: WeldConstraint;
                    Switch: Instance & {
                        Sound: Sound;
                        On: BasePart;
                        Off: BasePart;
                    };
                    Fire: BasePart & {
                        PointLight: PointLight;
                    };
                };
            };
            Vitamins: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                    WeldConstraint: WeldConstraint;
                    Lid: MeshPart;
                    Use: Sound;
                };
            };
            Lockpick: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                    WeldConstraint: WeldConstraint;
                }
            };
        };
        Unpickables: Folder & {
            Papers: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                    WeldConstraint: WeldConstraint;
                }
            };
        };
    }
}