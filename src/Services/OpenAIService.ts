import ISO6391 from 'iso-639-1';
import { from, map, Observable, switchMap, tap } from 'rxjs';
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
        formData.set('temperature', '0.3');
        formData.set(
            'prompt',
            'This audio clip was extracted from a live broadcast. Please identify and remove any repeated words.'
        );

        return from(
            fetch(OpenAIService.OpenAIEndpoint + 'audio/transcriptions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: formData,
            })
        ).pipe(
            switchMap((response) => {
                if (response.ok) return response.json();

                if (response.status === 401)
                    throw new Error(
                        'The API key you provided is invalid and OpenAI has rejected it. Please generate a new API key.'
                    );
                else response.text().then(text => {throw new Error(`${response.status}: ${text}`)})

                return from([]);
            }),
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
        speechToText: ISpeechToTextResponse
    ): Observable<IGenerateAIResponse> {
        const browserLanguage = navigator.language;
        const streamLanguage = speechToText.language;
        const responseCount = 10;

        /**
         * Models available for this api:
         *
         * NOTE: Any model with less than 3000 tokens is not suitable for our situation
         * https://platform.openai.com/docs/guides/text-generation
         */
        const raw = JSON.stringify({
            model: 'gpt-3.5-turbo-1106',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `This is a transcription of a live stream that has been converted from speech to text. Please note that some words may be incorrect due to the conversion process, so use your own judgment to figure out what the speaker meant. Ignore any parts of the passage that are repeated, and guess what's missing if necessary. Using ${browserLanguage} to summarize the main idea of the passage. Then, generate ${responseCount} casual and slangy responses in both ${browserLanguage} and ${streamLanguage}, each no longer than 30 tokens. Responses are STRICTLY required in the following valid json format. Please note that even though the JSON template below is in zh and ja, you should use the ${browserLanguage} and ${streamLanguage} as mentioned above. Be careful not to misplace the language in the responses. \`\`\` { "summary": "這篇文章的總結",   "responses": [     {       "${streamLanguage}": "これが可能な返信です",       "${browserLanguage}": "這是可能的回覆"     },     {       "${streamLanguage}": "問題ない",       "${browserLanguage}": "沒問題"     },     {       "${streamLanguage}": "草",       "${browserLanguage}": "草"     }   ] } \`\`\``,
                },
                { role: 'user', content: speechToText.text },
            ],
            temperature: 1,
            max_tokens: 2000,
        });

        return from(
            fetch(OpenAIService.OpenAIEndpoint + 'chat/completions', {
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
                const responseText =
                    /(\{.+\})/.exec(
                        response.choices[0].message?.content
                            ?.replaceAll('\n', '')
                            .replaceAll('`', '') ?? ''
                    )?.[1] ?? '';

                return JSON.parse(responseText);
            }),
            map((response: IGenerateAIResponse) => {
                console.debug('Parse response: %o', response);
                response.stream_language = speechToText.language.toLowerCase();
                const browser_languageCode = browserLanguage.substring(0, 2);
                response.same_language =
                    ISO6391.getName(browser_languageCode)?.toLowerCase() ===
                    response.stream_language;
                return response;
            })
        );
    }
}
