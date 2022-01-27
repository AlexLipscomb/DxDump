import $ from 'jquery';
import {ipcRenderer} from 'electron';
import {parse} from 'flatted';

// eslint-disable-next-line no-unused-vars
let midiListener = null;

const midiInputs = $('#midi-inputs');
const midiOutputs = $('#midi-outputs');

$(window).on('load', () => {
    ipcRenderer.send('refresh-midi-io');
});


$('#refresh-midi-io').on('click', () => {
    ipcRenderer.send('refresh-midi-io');
});

$('#import').on('click', () => {
    // TODO
    ipcRenderer.send('import');
});

ipcRenderer.on('refresh-midi-io', (event, devices: string) => {
    getInputDevices((parse(devices) as MidiDeviceList).inputs);
    getOutputDevices((parse(devices)as MidiDeviceList).outputs);
});

$(midiInputs).on('change', (e) => {
    ipcRenderer.send('change-midi-input-device', $(e.target).val());
});

$(midiOutputs).on('change', (e) => {
    ipcRenderer.send('change-midi-output-device', $(e.target).val());
});

$('#request-dump').on('click', () => {
    ipcRenderer.send('request');
});

// eslint-disable-next-line require-jsdoc
function getInputDevices(inputs: string[]) {
    if (inputs.length < 1) {
        $(midiInputs).empty();
        $(midiInputs).append(
            $(document.createElement('option'))
                .text('-- No Input Devices --')
                .val('null'),
        );

        return;
    }

    $(midiInputs).empty();

    $(midiInputs).append(
        $(document.createElement('option'))
            .text('-- No Device --')
            .val('null'),
    );

    inputs.forEach((name: string, index: number) => {
        $(midiInputs).append(
            $(document.createElement('option'))
                .text(name)
                .attr('id', `midi-input-${index + 1}`)
                .val(name),
        );
    });
}

// eslint-disable-next-line require-jsdoc
function getOutputDevices(outputs: string[]) {
    if (outputs.length < 1) {
        $(midiOutputs).empty();
        $(midiOutputs).append(
            $(document.createElement('option'))
                .text('-- No Output Devices --')
                .val('null'),
        );

        return;
    }

    $(midiOutputs).empty();

    $(midiOutputs).append(
        $(document.createElement('option'))
            .text('-- No Device --')
            .val('null'),
    );

    outputs.forEach((name: string, index: number) => {
        $(midiOutputs).append(
            $(document.createElement('option'))
                .text(name)
                .attr('id', `midi-output-${index + 1}`)
                .val(name),
        );
    });
}

$('#export').on('click', () => {
    ipcRenderer.send('export-sysex');
});


$('#dx21-editor').on('click', () => {
    ipcRenderer.send('open-editor', 21);
});
