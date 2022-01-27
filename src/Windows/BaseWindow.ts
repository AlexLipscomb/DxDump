import {BrowserWindow} from 'electron';

/**
 * The Base class for windows
 */
export default abstract class BaseWindow {
    public window: BrowserWindow | null = null;
    protected canOpenWindow: boolean = true;
    // @ts-ignore
    public width: number;
    // @ts-ignore
    public height: number;
    // @ts-ignore
    public title: string;

    /**
     * Get the current window.
     * @return {BrowserWindow | null}
     */
    public getWindow(): BrowserWindow | null {
        return this.window;
    }

    /**
     * Set the window.
     * @param {BrowserWindow} window
     */
    public setWindow(window: BrowserWindow): void {
        this.window = window;
    }

    /**
     * Close the window.
     */
    public close(): void {
        this.canOpenWindow = true;
        this.window?.close();
        this.window = null;
    }
}
