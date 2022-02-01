// eslint-disable-next-line max-len
import {DX21LFO, DX21Op, DX21Performance, DX21PitchEnvelopeGenerator, DX21Voice} from 'dxex';
import {ipcRenderer} from 'electron';
import $ from 'jquery';


let selectedVoice: number = 0;
let selectedOperator: number = 0;
const numVoices: number = 16;
const numOperators: number = 4;

let voices: DX21Voice[];

$('.sysexparam').on('change', (e) => {
    const target = $(e.target);
    const id = target.attr('id') as string;
    let value: string | number;
    if (target.attr('id') === 'voice-name') {
        value = target.val() as string;
    } else {
        value = parseInt(target.val() as string);
    }

    const prefix = /^(op|perf\|peg|lfo)\-/;
    const results = prefix.exec(id);
    let match = '';
    let key;
    if (results) match = results[1];
    key = convertToCamelCase(
        id.slice(
            match.length + 1),
        '-') as keyof DX21Performance;

    switch (match) {
    case 'op':
        key = convertToCamelCase(
            id.slice(
                match.length + 1),
            '-') as keyof DX21Op;

        // @ts-ignore
        voices[selectedVoice].op[selectedOperator][key] = value as number;
        break;
    case 'perf':
        key = convertToCamelCase(
            id.slice(
                match.length + 1),
            '-') as keyof DX21Performance;

        voices[selectedVoice].performance[key] = value as number;
        break;
    case 'peg':
        key = convertToCamelCase(
            id.slice(
                match.length + 1),
            '-') as keyof DX21PitchEnvelopeGenerator;

        voices[selectedVoice].pitchEnvelopeGenerator[key] = value as number;
        break;
    case 'lfo':
        key = convertToCamelCase(
            id.slice(
                match.length + 1),
            '-') as keyof DX21LFO;

        voices[selectedVoice].lfo[key] = value as number;
        break;
    default:
        key = convertToCamelCase(id, '-') as keyof DX21Voice;
        if (key.startsWith('algo')) key = key.slice(0, -1) as keyof DX21Voice;

        switch (key) {
        case 'algorithm':
            voices[selectedVoice].algorithm = value as number;
            break;
        case 'feedbackLevel':
            voices[selectedVoice].feedbackLevel = value as number;
            break;
        case 'transpose':
            voices[selectedVoice].transpose = value as number;
            break;
        case 'voiceName':
            voices[selectedVoice].voiceName = value as string;
            break;
        }
    }
});

$(window).on('load', () => {
    createVoiceOptions(numVoices);
    createOperatorOptions(numOperators);
    requestInitPatch();
});

/**
 * Create the options for the voice-select element.
 * @param {number} n The number of voices to create.
 */
function createVoiceOptions(n: number): void {
    $('#voice-select').append(
        ...new Array(n).fill(null).map((value, index) => {
            return $(document.createElement('option'))
                .attr('id', `voice-${index}-option`)
                .val(index)
                .text(`Voice ${index + 1}`);
        }),
    );
}

/**
 * Create the options for the operator-select element.
 * @param {number} n The number of operators to create.
 */
function createOperatorOptions(n: number): void {
    $('#operator-select').append(
        ...new Array(n).fill(null).map((value, index) => {
            return $(document.createElement('option'))
                .attr('id', `operator-${index}-option`)
                .val(index)
                .text(`OP ${index + 1}`);
        }),
    );
}


// Display the selected voice
$('#voice-select').on('change', (e) => {
    selectedVoice = $('#voice-select').find(':selected').val() as number;
    setVoiceParams(selectedVoice, voices);
    setOpParams(selectedOperator, voices[selectedVoice]);
});

// Display the selected operator
$('#operator-select').on('change', (e) => {
    selectedOperator = $('#operator-select').find(':selected').val() as number;
    setOpParams(selectedOperator, voices[selectedVoice]);
});


ipcRenderer.on('sysex', (event, args) => {
    loadVoices(args);
});

// eslint-disable-next-line require-jsdoc
function loadVoices(sysex: DX21Voice[]) {
    voices = sysex;
    setVoiceNames(voices);
    setVoiceParams(selectedVoice, voices);
    setOpParams(selectedOperator, voices[selectedVoice]);
}

/**
 * Set the UI values from a patch.
 * @param {number} voice
 * @param {DX21Voice} sysex
 */
function setVoiceParams(voice: number, sysex: DX21Voice[]) {
    const selectedSysexVoice: DX21Voice = sysex[voice];

    $('#voice-name').val(`${selectedSysexVoice.voiceName}`);
    $('#transpode').val(`${selectedSysexVoice.transpose}`);
    $('#feedback-level').val(`${selectedSysexVoice.feedbackLevel}`);
    $(`#algorithm-${selectedSysexVoice.algorithm}`)
        .prop('checked', true);
    setLfoParams(selectedSysexVoice);
    setPEGParams(selectedSysexVoice);
    setPerformanceParams(selectedSysexVoice);
}

/**
 * Set the names of the patches.
 * @param {DX21Voice[]}sysex
 */
function setVoiceNames(sysex: DX21Voice[]): void {
    for (let i = 0; i < numVoices; i++) {
        $(`#voice-${i}-option`).text(`Voice ${i + 1}: ${sysex[i].voiceName}`);
    }
}
// eslint-disable-next-line require-jsdoc
function setOpParams(op: number, sysex: DX21Voice): void {
    $('#op-attack-rate').val(sysex.op[op].envelopeGenerator.attackRate);
    $('#op-decay-1-rate').val(sysex.op[op].envelopeGenerator.decay1Rate);
    $('#op-decay-2-rate').val(sysex.op[op].envelopeGenerator.decay2Rate);
    $('#op-decay-1-level').val(sysex.op[op].envelopeGenerator.decay1Level);
    $('#op-release-rate').val(sysex.op[op].envelopeGenerator.releaseRate);
    $('#op-output-level').val(sysex.op[op].outputLevel);
    $('#op-oscillator-frequency').val(sysex.op[op].oscillatorFrequency);
    $('#op-detune').val(sysex.op[op].detune);
}

// eslint-disable-next-line require-jsdoc
function setLfoParams(sysex: DX21Voice): void {
    $('#lfo-wave').val(sysex.lfo.lfoWave);
    $('#lfo-speed').val(sysex.lfo.lfoSpeed);
    $('#lfo-delay').val(sysex.lfo.lfoDelay);
    $('#lfo-sync').val(sysex.lfo.lfoSync);
    $('#pitch-modulation-depth')
        .val(sysex.lfo.pitchModulationDepth);
    $('#amplitude-modulation-depth')
        .val(sysex.lfo.amplitudeModulationDepth);
    $('#pitch-modulation-sensitivity')
        .val(sysex.lfo.pitchModulationSensitivity);
    $('#amplitude-modulation-sensitivity')
        .val(sysex.lfo.amplitudeModulationSensitivity);
}

// eslint-disable-next-line require-jsdoc
function setPerformanceParams(sysex: DX21Voice): void {
    setModWheelParams(sysex);
    setBreathControlParams(sysex);
}

// eslint-disable-next-line require-jsdoc
function setModWheelParams(sysex: DX21Voice): void {
    $('#modulation-wheel-pitch-modulation-range')
        .val(sysex.performance.modulationWheelPitchModulationRange);
    $('#modulation-wheel-amplitude-modulation-range')
        .val(sysex.performance.modulationWheelAmplitudeModulationRange);
}

// eslint-disable-next-line require-jsdoc
function setBreathControlParams(sysex: DX21Voice): void {
    $('#breath-control-pitch-modulation-range')
        .val(sysex.performance.breathControlPitchModulationRange);
    $('#breath-control-amplitude-modulation-range')
        .val(sysex.performance.breathControlAmplitudeModulationRange);
    $('#breath-control-pitch-bias-range')
        .val(sysex.performance.breathControlPitchBiasRange);
    $('#breath-control-eg-bias-range')
        .val(sysex.performance.breathControlEgBiasRange);
}

// eslint-disable-next-line require-jsdoc
function setPEGParams(sysex: DX21Voice): void {
    $('#pitch-eg-rate-1').val(sysex.pitchEnvelopeGenerator.pitchEgRate1);
    $('#pitch-eg-rate-2').val(sysex.pitchEnvelopeGenerator.pitchEgRate2);
    $('#pitch-eg-rate-3').val(sysex.pitchEnvelopeGenerator.pitchEgRate3);
    $('#pitch-eg-level-1').val(sysex.pitchEnvelopeGenerator.pitchEgLevel1);
    $('#pitch-eg-level-2').val(sysex.pitchEnvelopeGenerator.pitchEgLevel2);
    $('#pitch-eg-level-3').val(sysex.pitchEnvelopeGenerator.pitchEgLevel3);
}

// ? Experimental
// eslint-disable-next-line require-jsdoc
function convertToCamelCase(str: string, separator: string) {
    return str.split(separator).map((value, index) => {
        if (index !== 0) {
            return value[0].toUpperCase() + value.slice(1);
        }
        return value;
    }).join('');
}

/**
 * Convert a string to title case.
 * @param {string} str
 * @return {string}
 */
function toTitleCase(str: string): string {
    if (str.length > 1) {
        return str[0].toUpperCase() + str.slice(1);
    } else {
        return str[0].toUpperCase();
    }
}

/**
 * Split characters by uppercase.
 * @param {string} str
 * @return {string}
 */
function splitUppercase(str: string): string {
    // TODO exclude consecutive substrings of capital letters
    let res = str[0];
    for (let i = 1; i < str.length; i++) {
        if (str[i] === str[i].toUpperCase()) {
            res += ' ';
        }
        res += str[i];
    }
    return res;
}


// Save/load

$('#load').on('click', () => {
    ipcRenderer.send('load-sysex', {type: 'dx21'});
});

$('#save').on('click', () => {
    ipcRenderer.send('save-sysex', {
        type: 'dx21',
        data: voices,
    });
});

$('#reset-all').on('click', () => {
    requestInitPatch();
});

// eslint-disable-next-line require-jsdoc
function requestInitPatch() {
    ipcRenderer.send('request-init-patch');
}

ipcRenderer.on('request-init-patch', (event, args) => {
    loadVoices(args as DX21Voice[]);
});
