import BaseWindow from './BaseWindow';
import {BrowserWindow} from 'electron';
import path from 'path';

/**
 * The Main window.
 */
export default class MainWindow extends BaseWindow {
    // eslint-disable-next-line require-jsdoc
    constructor() {
        super();
        this.width = 800;
        this.height = 600;
        this.title = 'DX Dump';
    }

    /**
     * Create the Main window.
     */
    public create(): void {
        if (!this.canOpenWindow) return;

        this.window = new BrowserWindow({
            width: this.width,
            height: this.height,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });

        this.window.loadFile(
            path.join(__dirname, '../html/index.html'),
        );

        this.canOpenWindow = false;
    }
}
