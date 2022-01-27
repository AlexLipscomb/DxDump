import {DX21Voice} from './DX21.types';
import DXBase from './DXBase';


/**
 * The class for working with DX21 synths.
 */
export default class DX21 extends DXBase {
    // eslint-disable-next-line require-jsdoc
    constructor() {
        super();
    }

    /**
     * Parse the loaded sysex.
     * @return {Promise<void>}
     */
    public parse(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.data) reject(new Error('No data loaded'));

            let voiceDataType;
            if (this.data![0] !== 0xF0 ||
                this.data![this.data!.length - 1] !== 0xF7) {
                reject(new Error('Data isn\'t sysex'));
            }

            if (this.data![1] !== 0x43) {
                reject(new Error('Incorrect manufacturer ID'));
            };

            if (this.data![3] === 0x03) {
                voiceDataType = 0; // 1 Voice Bulk Data
            } else if (this.data![3] === 0x04) {
                voiceDataType = 1; // 32 Voice Bulk Data
            } else {
                reject(new Error('Incorrect format number'));
            }

            // TODO doesn't account for if the voice bulk data
            //      and the byte count aren't the same.
            if (!(this.data![4] === 0 && this.data![5] === 93) &&
            !(this.data![4] === 32 && this.data![5] === 0)) {
                reject(new Error('Incorrect byte count'));
            }

            if (voiceDataType === 0) {
                // TODO
            } else {
                this.voices = this._parse32VoiceBulkData();
                resolve();
            }

            reject(new Error('Unknown error'));
        });
    }
    /**
     * Resolve the loaded sysex.
     * @param {DX21Voice[]} voices
     * @return {Promise<void>}
     */
    public resolve(voices: DX21Voice[]): Promise<void> {
        return new Promise((resolve, reject) => {
            // TODO Add 1 voice operations later,
            // or split them into 2 separate methods
            if (!voices || voices.length !== 32) {
                reject(new Error('Incorrect voice size'));
            }
            this.data = [];

            for (let i = 0; i < 32; i++) {
                this.data.push(...this._resolveChunk(voices[i]));
            }

            this._createChecksum();
            this.data.unshift(0xF0, 0x43, 0x00, 0x04);
            this.data.push(this._createChecksum(), 0xF7);
            // console.log(this.data);
            resolve();
        });
    }

    /**
     * Create a checksum.
     * @return {number}
     */
    private _createChecksum() {
        return (this.data!.reduce((a, b) => a + b, 0) & 127);
    }
    // eslint-disable-next-line require-jsdoc
    private _parse1VoiceBulkData(): void {
        // TODO
    }
    /**
     * Parse 32 Voice Bulk Data.
     * @return {object}
     */
    private _parse32VoiceBulkData(): DX21Voice[] {
        const parsedSysex = chunkify(this.data!.slice(6), 32).map((value) => {
            return this._parseChunk(value);
        });

        return parsedSysex;
    }

    /**
     * Resolve a sysex object chunk to sysex data.
     * @param {DX21Voice} chunk
     * @return {number[]}
     */
    private _resolveChunk(chunk: DX21Voice): number[] {
        const res: number[] = [];

        for (const i of [3, 1, 2, 0]) {
            res.push(
                chunk.op[i].attackRate,
                chunk.op[i].decay1Rate,
                chunk.op[i].decay2Rate,
                chunk.op[i].releaseRate,
                chunk.op[i].decay1Level,
                chunk.op[i].keyboardScalingLevel,
                (
                    (chunk.op[i].amplitudeModulationEnable << 6) +
                    (chunk.op[i].egBiasSensitivity << 3) +
                    chunk.op[i].keyVelocity
                ),
                chunk.op[i].outputLevel,
                chunk.op[i].oscillatorFrequency,
                (
                    (chunk.op[i].keyboardScalingRate >> 3) +
                    chunk.op[i].detune
                ),
            );
        }

        res.push(
            (
                (chunk.lfo.lfoSync << 6) +
                (chunk.feedbackLevel << 3) +
                chunk.algorithm
            ),
            chunk.lfo.lfoSpeed,
            chunk.lfo.lfoDelay,
            chunk.lfo.pitchModulationDepth,
            chunk.lfo.amplitudeModulationDepth,
            (
                (chunk.lfo.pitchModulationSensitivity << 7) +
                (chunk.lfo.amplitudeModulationSensitivity << 4) +
                chunk.lfo.lfoWave
            ),
            chunk.transpose,
            chunk.pitchBendRange,
            (
                (chunk.chorusSwitch << 4) +
                (chunk.playMode << 3) +
                (chunk.sustainFootSwitch << 2) +
                (chunk.portamentoFootSwitch << 1) +
                chunk.portamentoMode
            ),
            chunk.portamentoTime,
            chunk.footVolume,
            chunk.performance.modulationWheelPitchModulationRange,
            chunk.performance.modulationWheelAmplitudeModulationRange,
            chunk.performance.breathControlPitchModulationRange,
            chunk.performance.breathControlAmplitudeModulationRange,
            chunk.performance.breathControlPitchBiasRange,
            chunk.performance.breathControlEgBiasRange,
            ...this._formatVoiceName(chunk.voiceName),
            chunk.pitchEnvelopeGenerator.pitchEgRate1,
            chunk.pitchEnvelopeGenerator.pitchEgRate2,
            chunk.pitchEnvelopeGenerator.pitchEgRate3,
            chunk.pitchEnvelopeGenerator.pitchEgLevel1,
            chunk.pitchEnvelopeGenerator.pitchEgLevel2,
            chunk.pitchEnvelopeGenerator.pitchEgLevel3,
        );

        return res;
    }

    /**
     * Format voice name to 10-byte ASCII.
     * @param {string} voiceName
     * @return {number[]}
     */
    private _formatVoiceName(voiceName: string): number[] {
        const res: number[] = Array(10).fill(0);

        for (let i = 0; i < 10; i++) {
            res.push(voiceName.charCodeAt(i));
        }

        return res;
    }
    /**
     * Parse a chunk of sysex data.
     * @param {number[]} chunk
     * @return {object}
     */
    private _parseChunk(chunk: number[]): DX21Voice {
        return {
            op: [
                {
                    // 1
                    attackRate: chunk[30],
                    decay1Rate: chunk[31],
                    decay2Rate: chunk[32],
                    releaseRate: chunk[33],
                    decay1Level: chunk[34],
                    keyboardScalingLevel: chunk[35],
                    amplitudeModulationEnable: chunk[36] & 64,
                    egBiasSensitivity: (chunk[36] >> 3) & 7,
                    keyVelocity: chunk[36] & 7,
                    outputLevel: chunk[37],
                    oscillatorFrequency: chunk[38],
                    keyboardScalingRate: (chunk[39] >> 3) & 7,
                    detune: chunk[39] & 7,
                },
                {
                    // 3
                    attackRate: chunk[10],
                    decay1Rate: chunk[11],
                    decay2Rate: chunk[12],
                    releaseRate: chunk[13],
                    decay1Level: chunk[14],
                    keyboardScalingLevel: chunk[15],
                    amplitudeModulationEnable: chunk[16] & 64,
                    egBiasSensitivity: (chunk[16] >> 3) & 7,
                    keyVelocity: chunk[16] & 7,
                    outputLevel: chunk[17],
                    oscillatorFrequency: chunk[18],
                    keyboardScalingRate: (chunk[19] >> 3) & 7,
                    detune: chunk[19] & 7,
                },
                {
                    // 2
                    attackRate: chunk[20],
                    decay1Rate: chunk[21],
                    decay2Rate: chunk[22],
                    releaseRate: chunk[23],
                    decay1Level: chunk[24],
                    keyboardScalingLevel: chunk[25],
                    amplitudeModulationEnable: chunk[26] & 64,
                    egBiasSensitivity: (chunk[26] >> 3) & 7,
                    keyVelocity: chunk[26] & 7,
                    outputLevel: chunk[27],
                    oscillatorFrequency: chunk[28],
                    keyboardScalingRate: (chunk[29] >> 3) & 7,
                    detune: chunk[29] & 7,
                },
                {
                    // 4
                    attackRate: chunk[0],
                    decay1Rate: chunk[1],
                    decay2Rate: chunk[2],
                    releaseRate: chunk[3],
                    decay1Level: chunk[4],
                    keyboardScalingLevel: chunk[5],
                    amplitudeModulationEnable: chunk[6] & 64,
                    egBiasSensitivity: (chunk[6] >> 3) & 7,
                    keyVelocity: chunk[6] & 7,
                    outputLevel: chunk[7],
                    oscillatorFrequency: chunk[8],
                    keyboardScalingRate: (chunk[9] >> 3) & 7,
                    detune: chunk[9] & 7,
                },
            ],
            lfo: {
                lfoWave: chunk[45] & 3,
                pitchModulationSensitivity: (chunk[45] >> 6) & 7,
                amplitudeModulationSensitivity: (chunk[45] >> 3) & 7,
                lfoSync: chunk[40] & 64,
                lfoSpeed: chunk[41],
                lfoDelay: chunk[42],
                pitchModulationDepth: chunk[43],
                amplitudeModulationDepth: chunk[43],
            },
            feedbackLevel: (chunk[40] >> 3) & 7,
            algorithm: chunk[40] & 7,
            pitchEnvelopeGenerator: {
                pitchEgRate1: chunk[67],
                pitchEgRate2: chunk[68],
                pitchEgRate3: chunk[69],
                pitchEgLevel1: chunk[70],
                pitchEgLevel2: chunk[71],
                pitchEgLevel3: chunk[71],
            },
            transpose: chunk[46],
            pitchBendRange: chunk[47],
            chorusSwitch: chunk[48] & 16,
            playMode: chunk[48] & 8,
            sustainFootSwitch: chunk[48] & 4,
            portamentoFootSwitch: chunk[48] & 2,
            portamentoMode: chunk[48],
            portamentoTime: chunk[49],
            footVolume: chunk[50],
            performance: {
                modulationWheelPitchModulationRange: chunk[51],
                modulationWheelAmplitudeModulationRange: chunk[52],
                breathControlPitchModulationRange: chunk[53],
                breathControlAmplitudeModulationRange: chunk[54],
                breathControlPitchBiasRange: chunk[55],
                breathControlEgBiasRange: chunk[56],
            },
            voiceName: String.fromCharCode(...chunk.slice(57, 67)),
        };
    }
}


/**
 * Chunk arrays into n subarrays.
 * @param {any[]} arr Array to split into chunks.
 * @param {number} n The number of chunks to split the array into.
 * @return {any[]}
 */
function chunkify(arr: any[], n: number): any[] {
    if (n < 1) n = 1;
    const chunks = Math.floor(arr.length / n);
    const len = Math.floor(arr.length / chunks);
    const res = [];

    for (let i = 0; i < len; i++) {
        res.push(arr.slice((i * chunks), (i * chunks) + chunks));
    }

    return res;
}

