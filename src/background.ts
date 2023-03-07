import { switchMap, tap } from 'rxjs';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { from } from 'rxjs';
import { IMessage } from './Models/Message';
import { ffmpeg } from './transcode';

addListeners();

function addListeners() {
    function _addListener<T>(
        _name: string,
        callback: (
            message: IMessage<T>,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response?: unknown) => void
        ) => void
    ) {
        chrome.runtime.onMessage.addListener(function (message: IMessage<T>, sender, sendResponse) {
            if (!message || message.Name !== _name) return;
            console.debug('Message received from Content Script: %o', message);

            callback(message, sender, sendResponse);
            return true;
        });
    }

    //     _addListener<string>('click', async (message, sender, sendResponse) => {
    //         const scriptUrl = chrome.extension.getURL('assets/ffmpeg/ffmpeg.min.js');

    // fetch(scriptUrl)
    //   .then(response => response.text())
    //   .then(script => eval(script));

    //         from(fetch(scriptUrl))
    //             .pipe(
    //                 switchMap((response) => response.text()),
    //                 tap((response) => {
    //                     eval(response);
    //                 }),
    //                 switchMap(() => from(new ffmpeg().downloadLastMinuteFromM3u8(message.Data)))
    //             ).subscribe();
    //             // .pipe(
    //             //     switchMap((response) => response.text()),
    //             //     map((response) => {
    //             //         console.log('Get video page');
    //             //         videoPageHtml = response;
    //             //         const m3u8Url = /([^"]+?\.m3u8)"/.exec(videoPageHtml)?.[1] ?? '';
    //             //         console.log(m3u8Url);
    //             //         return m3u8Url;
    //             //     }),
    //             //     switchMap((m3u8Url: string) => from(downloadLastMinuteFromM3u8(m3u8Url)))
    //             // )

    //         sendResponse();
    //     });

    // _addListener<{ index: number; UIClick: boolean }>(
    //     'NextSongToBackground',
    //     (message, sender, sendResponse) => {
    //         let tabId: number = chrome.tabs.TAB_ID_NONE;
    //         if (sender.tab && sender.tab.url) {
    //             if (sender.tab.url.indexOf('/embed/') > 0) {
    //                 tabId = sender.tab.openerTabId ?? tabId;
    //             } else {
    //                 tabId = sender.tab.id ?? tabId;
    //             }
    //         }

    //         NextSong(tabId, message.Data.index, message.Data.UIClick);
    //         sendResponse();
    //     }
    // );
    // _addListener<string>('CheckList', async (message, sender, sendResponse) => {
    //     sendResponse(await PlaylistHelper.CheckList(message.Data));
    // });
    // _addListener<string>('GetNowPlaying', async (message, sender, sendResponse) => {
    //     const myPlaylist: ISong[] = (await chrome.storage.local.get('myPlaylist')).myPlaylist;
    //     sendResponse(myPlaylist[await PlaylistHelper.CheckList(message.Data)]);
    // });
    // _addListener<boolean>('FetchPlaylists', async (message, sender, sendResponse) => {
    //     sendResponse(await PlaylistHelper.fetchPlaylists());
    // });
    // _addListener<boolean>('ReloadLastSong', async (message, sender, sendResponse) => {
    //     const url = `https://www.youtube.com/watch?${await UrlHelper.GetFromStorage('')}`;
    //     console.log('Redirect to last song: %s', url);

    //     let tabId: number = chrome.tabs.TAB_ID_NONE;
    //     if (sender.tab && sender.tab.url) {
    //         if (sender.tab.url.indexOf('/embed/') > 0) {
    //             tabId = sender.tab.openerTabId ?? tabId;
    //         } else {
    //             tabId = sender.tab.id ?? tabId;
    //         }
    //     }
    //     if (tabId < 0) {
    //         console.warn('TabId not defined!');
    //         tabId = (await chrome.tabs.create({})).id ?? -1;

    //         if (tabId < 0) return;
    //     }
    //     chrome.tabs.update(tabId, { url: url });
    //     sendResponse();
    // });
}
