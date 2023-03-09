export interface IGenerateAIResponse {
    original_lang: string;
    summary: string;
    responses: IResponse[];
}

export interface IResponse {
    [key: string]: string;
}

export interface IResponseViewModel {
    stream_language: string;
    user_language: string;
}
