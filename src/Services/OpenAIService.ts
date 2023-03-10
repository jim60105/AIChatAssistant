import { getLangNameFromCode } from 'language-name-map';
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
        const raw = JSON.stringify({
            model: 'text-davinci-003',
            prompt: `This passage is a speech-to-text input, there may be inaccuracies, so please make your own guesses about the possible near-sounding words. Please use ${browser_language} to summarize the main idea of the passage. And then Generate 5 responses in ${browser_language} and ${audioResponse.language}. The tone should be casual and use popular internet slang as much as possible. Each response should not exceed 30 tokens. The \`stream_language\` field is the language of the speech to text input. Responses are strictly required in the following json format! \`\`\` { "stream_language": "${audioResponse.language}",  "summary": "這篇文章的總結",   "responses": [     {       "${audioResponse.language}": "これが最初の可能な返信です",       "${browser_language}": "這是第一個可能的回覆"     },     {       "${audioResponse.language}": "問題ない",       "${browser_language}": "沒問題"     },     {       "${audioResponse.language}": "草",       "${browser_language}": "草"     }   ] } \`\`\`  Please read this passage and answer: """${audioResponse.text}"""`,
            temperature: 0.4,
            max_tokens: 2000,
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
                const browser_languageCode = browser_language.substring(0, 2);
                response.same_language =
                    getLangNameFromCode(browser_languageCode)?.name.toLowerCase() ===
                    response.stream_language;
                console.debug('Parse responses to ViewModel: %o', response);
                return response;
            })
        );
    }
}
