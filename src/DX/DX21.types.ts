export interface DX21Voice {
    voiceName: string,
    transpose: number,
    feedbackLevel: number,
    algorithm: number,
    op: DX21Op[],
    lfo: DX21LFO,
    performance: DX21Performance,
    pitchBendRange: number,
    chorusSwitch: number,
    playMode: number,
    sustainFootSwitch: number,
    portamentoFootSwitch: number,
    portamentoMode: number,
    portamentoTime: number,
    footVolume: number,
    pitchEnvelopeGenerator: DX21PitchEnvelopeGenerator;
};

export interface DX21Op {
    attackRate: number,
    decay1Rate: number,
    decay2Rate: number,
    releaseRate: number,
    decay1Level: number,
    keyboardScalingLevel: number,
    amplitudeModulationEnable: number,
    egBiasSensitivity: number,
    keyVelocity: number,
    outputLevel: number,
    oscillatorFrequency: number,
    keyboardScalingRate: number,
    detune: number,
};

export interface DX21LFO {
    lfoWave: number,
    pitchModulationSensitivity: number,
    amplitudeModulationSensitivity: number,
    lfoSpeed: number,
    lfoDelay: number,
    lfoSync: number,
    pitchModulationDepth: number,
    amplitudeModulationDepth: number,
};

export interface DX21Performance {
    modulationWheelPitchModulationRange: number,
    modulationWheelAmplitudeModulationRange: number,
    breathControlPitchModulationRange: number,
    breathControlAmplitudeModulationRange: number,
    breathControlPitchBiasRange: number,
    breathControlEgBiasRange: number,
};

export interface DX21PitchEnvelopeGenerator {
    pitchEgRate1: number,
    pitchEgRate2: number,
    pitchEgRate3: number,
    pitchEgLevel1: number,
    pitchEgLevel2: number,
    pitchEgLevel3: number,
};
