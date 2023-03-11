import ISO6391 from 'iso-639-1';
import { from, map, Observable, switchMap } from 'rxjs';
import { IGenerateAIResponse } from '../Models/GenerateAIResponse';
import { ISpeechToTextResponse, IOpenAIResponse } from '../Models/OpenAIResponse';

export class OpenAIService {
    private static apiKey = '';
    private static readonly OpenAIEndpoint = 'https://api.openai.com/v1/';

    public static async checkApiKey() {
        OpenAIService.apiKey = (await chrome.storage.sync.get('apiKey')).apiKey;
        if (!this.apiKey) {
            throw new Error('API Key is not set');
        }
    }

    public static speechToText$(file: File): Observable<ISpeechToTextResponse> {
        const formData = new FormData();
        formData.set('file', file, file.name);
        formData.set('model', 'whisper-1');
        formData.set('response_format', 'verbose_json');
        formData.set('temperature', '0.4');
        formData.set('prompt', 'This audio is a cut from a live stream. Please remove duplicate words. It may not be in English, please try to identify it.');

        return from(
            fetch(OpenAIService.OpenAIEndpoint + 'audio/transcriptions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: formData,
            })
        ).pipe(
            switchMap((response) => response.json()),
            map((response: ISpeechToTextResponse) => {
                console.debug(
                    'Get %o transcription: %o',
                    response.language,
                    response.text,
                    response
                );
                return response;
            })
        );
    }

    public static generateAIResponse$(
        audioResponse: ISpeechToTextResponse
    ): Observable<IGenerateAIResponse> {
        const browser_language = navigator.language;
        /**
         * Models available for this api:
         * text-davinci-003
         * text-davinci-002: Performance is very bad, give it up.
         * text-curie-001
         * text-babbage-001
         * text-ada-001
         * davinci
         * curie
         * babbage
         * ada
         *
         * NOTE: Any model with less than 3000 tokens is not suitable for our situation
         * https://platform.openai.com/docs/models/model-endpoint-compatability
         */
        const raw = JSON.stringify({
            model: 'text-davinci-003',
            prompt: `This passage is a raw speech-to-text input from a live stream. There may be inaccuracies, so please make your own guesses about the possible near-sounding words. Please remove duplicate words. Please use ${browser_language} to summarize the main idea of the passage. And then Generate 5 responses in one set in ${browser_language} and ${audioResponse.language}. The tone should be casual and use popular internet slang as much as possible. Each response should not exceed 30 tokens. The \`stream_language\` field is the language of the speech to text input. Responses are strictly required in the following valid json format!! \`\`\` { "stream_language": "${audioResponse.language}",  "summary": "這篇文章的總結",   "responses": [     {       "${audioResponse.language}": "これが最初の可能な返信です",       "${browser_language}": "這是第一個可能的回覆"     },     {       "${audioResponse.language}": "問題ない",       "${browser_language}": "沒問題"     },     {       "${audioResponse.language}": "草",       "${browser_language}": "草"     }   ] } \`\`\`  Please read this passage and answer: """${audioResponse.text}"""`,
            temperature: 1,
            max_tokens: 2500,
        });

        return from(
            fetch(OpenAIService.OpenAIEndpoint + 'completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: raw,
                redirect: 'follow',
            })
        ).pipe(
            switchMap((response) => response.json()),
            map((response: IOpenAIResponse) => {
                console.debug('Get response: %o', response);
                return JSON.parse(
                    response.choices[0].text?.replaceAll('\n', '').replaceAll('`', '') ?? ''
                );
            }),
            map((response: IGenerateAIResponse) => {
                console.debug('Parse response: %o', response);
                response.stream_language = response.stream_language.toLowerCase();
                const browser_languageCode = browser_language.substring(0, 2);
                response.same_language =
                    ISO6391.getName(browser_languageCode)?.toLowerCase() ===
                    response.stream_language;
                return response;
            })
        );
    }
}
