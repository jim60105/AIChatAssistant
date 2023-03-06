import { Message } from './Models/Message';
import './contentScript.scss';

(async function () {
    if (
        ['/live_chat', '/live_chat_replay', '/mwebanimation.php'].includes(window.location.pathname)
    ) {
        return;
    }
})();
