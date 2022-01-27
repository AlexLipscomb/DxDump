import {app, BrowserWindow, ipcMain} from 'electron';
import {MessageEvent, WebMidi} from 'webmidi';
import MainWindow from './Windows/MainWindow';
import {stringify} from 'flatted';
import DX21Editor from './Windows/DX21Editor';


const mainWindow = new MainWindow();
const dx21Editor: DX21Editor | null = new DX21Editor();

let isListening = false;
let inputDeviceName: string = 'null';
let outputDeviceName: string = 'null';


// Main process
app.whenReady().then(() => {
    mainWindow.create();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow.create();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


WebMidi.enable({sysex: true, software: true});


ipcMain.on('refresh-midi-io', (event, args) => {
    const inputs: string[] = WebMidi.inputs.map((obj) => {
        return obj.name;
    });

    const outputs: string[] = WebMidi.outputs.map((obj) => {
        return obj.name;
    });

    const devices: MidiDeviceList = {
        inputs: inputs,
        outputs: outputs,
    };

    event.sender.send('refresh-midi-io', stringify(devices));
});

ipcMain.on('change-midi-input-device', (event, device) => {
    inputDeviceName = device;
});

ipcMain.on('change-midi-output-device', (event, device) => {
    outputDeviceName = device;
});

// eslint-disable-next-line require-jsdoc
function startListening() {
    isListening = true;

    if (inputDeviceName !== 'null') {
        WebMidi.getInputByName(inputDeviceName)
            .addListener('controlchange', listenForSysex);
    }
}

// TODO
/* eslint-disable require-jsdoc */
ipcMain.on('export-sysex', () => {
    if (outputDeviceName !== 'null') {
        WebMidi.getOutputByName(outputDeviceName)
            ?.sendSysex(
                0x43, [0x43, 0x20, 0x4],
            );
    }
});

ipcMain.on('import', () => {
    console.log('import 2');
    startListening();
});

ipcMain.on('request', () => {
    startListening();
    requestSysexDump();
});

function listenForSysex(midimessage: MessageEvent) {
    if (isListening) {
        // TODO
        isListening = false;
    }
}

function requestSysexDump() {
    if (outputDeviceName !== 'null') {
        console.log('Sending out sysex');
        WebMidi.getOutputByName(outputDeviceName)
            ?.sendSysex(
                0x43, [0x43, 0x20, 0x4],
            );
    }
}

/* eslint-enable */

// Editors
ipcMain.on('open-editor', (event, model) => {
    switch (model) {
    case 21:
        dx21Editor?.create();
        break;
    }
});
