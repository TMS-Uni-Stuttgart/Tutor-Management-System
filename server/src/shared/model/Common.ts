export interface HasId {
    readonly id: string;
}

export interface NamedElement extends HasId {
    readonly firstname: string;
    readonly lastname: string;
}

export interface ITutorialInEntity extends HasId {
    readonly slot: string;
    readonly weekday: number;

    /** Start and endtime in the form of a luxon interval. */
    readonly time: string;
}
