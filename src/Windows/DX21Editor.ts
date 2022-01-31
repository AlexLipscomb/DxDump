import BaseWindow from './BaseWindow';
import {BrowserWindow, dialog, ipcMain} from 'electron';
import path from 'path';
import fs from 'fs';
import {DX21Voice, parseSysex, resolveSysex} from 'dxex';


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
                fs.readFile(result.filePaths[0], (err, data) => {
                    const sysexData = [...new Int32Array(data)];

                    const parsedSysexData = parseSysex(sysexData);
                    this.window?.webContents.send('sysex', parsedSysexData);
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
                const resolvedSysex = resolveSysex(voices, {synthType: 'dx21'});
                const buff = new ArrayBuffer(4104);
                const view = new Uint8Array(buff);

                for (let i = 0; i < buff.byteLength; i++) {
                    view[i] = resolvedSysex[i];
                }

                fs.writeFile(
                    result.filePath as string, view, () => {

                    });
            }
        }).catch((reason: Error) => {
            dialog.showErrorBox('Error', reason.message);
        });
    }
}
