export interface IGenerateAIResponse {
    stream_language: string;
    summary: string;
    responses: IResponse[];
    same_language: boolean;
}

export interface IResponse {
    [key: string]: string;
}
