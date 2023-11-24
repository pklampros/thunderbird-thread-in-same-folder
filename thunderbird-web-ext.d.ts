declare namespace browser.messages {
    function query(queryInfo: {
        headerMessageId?: string;
    }) : Promise<MessageList>;
}

import messenger = browser;