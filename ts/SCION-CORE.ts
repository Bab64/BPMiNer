export namespace SCION {

    export interface Event {
        data?: any;
        name: string;
    }

    export interface Fork extends State {
        $type: 'exclusive' | 'parallel'; // Config. of substates between 'exclusive' and 'parallel' (no field means 'exclusive')...
    }

    export interface Wrapping extends Fork {
        id: string; // Overriding: 'id' attribute must exist...
        states: Array<State>; // Overriding: 'states' attribute must exist...
    }

    export interface State {
        id?: string;
        onEntry?: (event?: Event) => void;
        onExit?: (event?: Event) => void;
        states?: Array<State>;
        transitions?: Array<Transition>;
        $type?: 'exclusive' | 'parallel'; // Config. of substates between 'exclusive' and 'parallel' (no field means 'exclusive')...
    }

    export interface State_machine extends State {
        gen: (event_label: string, data?: string) => void;
        getConfiguration: () => Array<string>;
        getFullConfiguration: () => Array<string>;
        isIn: (state_label: string) => boolean;
        start: () => void;
    }

    export interface Transition {
        cond?: Function;
        event?: string; // scion.js allows transitions without events...
        onTransition?: () => void;
        target: string;
    }
}

