import {Input, Output} from 'webmidi';

declare global {
    export interface MidiDeviceList {
        inputs: string[],
        outputs: string[],
    }
}

