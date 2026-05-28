import { AppState } from "./types";

export const initialState: AppState = {
    schedule: {},
    selectedWd: new Date().getDay(),
    searchTerm: "",
    now: new Date(),
};

// Simple store pattern
export class Store {
    private state: AppState;
    private listeners: Array<(state: AppState) => void> = [];

    constructor(initial: AppState) {
        this.state = initial;
    }

    getState() {
        return this.state;
    }

    setState(newState: Partial<AppState>) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener: (state: AppState) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach((l) => l(this.state));
    }
}

export const store = new Store(initialState);
