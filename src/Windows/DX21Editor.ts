import BaseWindow from './BaseWindow';
import {BrowserWindow, dialog, ipcMain} from 'electron';
import path from 'path';
import DX21 from '../DX/DX21';
import {DX21Voice} from '../DX/DX21.types';


/**
 * The editor window for the DX21
 */
export default class DX21EditorWindow extends BaseWindow {
    // eslint-disable-next-line require-jsdoc
    constructor() {
        super();
        this.width = 900;
        this.height = 900;
        this.title = 'DX21 Editor';

        ipcMain.on('load-sysex', (event, args) => {
            if (args.type === 'dx21') {
                this.loadSysex();
            }
        });

        ipcMain.on('save-sysex', (event, args) => {
            if (args.type === 'dx21') {
                this.saveSysex(args.data);
            }
        });
    }

    /**
     * Create the editor window.
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
            path.join(__dirname, '../html/dx21editor.html'),
        );

        this.canOpenWindow = false;

        this.window?.on('close', () => {
            this.canOpenWindow = true;
        });
    }

    /**
     * Load sysex from a file and send to the window.
     */
    public loadSysex() {
        dialog.showOpenDialog({
            title: 'Open sysex',
            properties: ['openFile'],
            filters: [{
                name: 'Formats',
                extensions: ['syx'],
            }],
        }).then((result) => {
            if (!result.canceled) {
                const dx21 = new DX21();

                dx21.read(result.filePaths[0]).then(() => {
                    dx21.parse().catch((reason: Error) => {
                        dialog.showErrorBox('Parse Error', reason.message);
                    });
                }).then(() => {
                    this.window?.webContents.send('sysex', dx21.voices);
                }).catch((reason: Error) => {
                    dialog.showErrorBox('Error', reason.message);
                });
            }
        });
    }

    /**
     * Load sysex from the window and save to disk.
     * @param {DX21Voice[]} voices
     */
    public saveSysex(voices: DX21Voice[]) {
        dialog.showSaveDialog({
            title: 'Save sysex',
            filters: [{
                name: 'Formats',
                extensions: ['syx'],
            }],
        }).then((result) => {
            if (!result.canceled) {
                const dx21 = new DX21();
                dx21.resolve(voices).then(() => {
                    dx21.write(result.filePath as string).then(() => {
                        console.log('done writing');
                    });
                }).catch((reason) => {
                    dialog.showErrorBox('Error', reason.message);
                });
            }
        }).catch((reason: Error) => {
            dialog.showErrorBox('Error', reason.message);
        });
    }
}
