/* eslint-disable @typescript-eslint/no-unused-vars */
(async () => {
    const apiKey = await chrome.storage.sync.get('apiKey');
    const inputElement = document.getElementById('apiKey') as HTMLInputElement;
    inputElement.value = apiKey.apiKey;

    document.getElementById('saveBtn')?.addEventListener('click', ButtonClickEvent);

    async function ButtonClickEvent(event: MouseEvent) {
        await chrome.storage.sync.set({ apiKey: inputElement.value });
        console.log('ApiKey saved');
    }
})();
