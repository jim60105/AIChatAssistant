export interface IOpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: IChoice[];
    usage: IUsage;
}

export interface IChoice {
    index: number;
    text: string | undefined;
    message: IChatMessage | undefined;
    logprobs: string | undefined;
    finish_reason: string;
}

export interface IUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface IChatMessage {
    role: string;
    content: string;
}

export interface ISpeechToTextResponse {
    task: string;
    language: string;
    duration: number;
    segments: ISegment[];
    text: string;
}

export interface ISegment {
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
    transient: boolean;
}
