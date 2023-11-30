'use strict'

/** 
 * @param {messenger.messages.MessageList} page 
 * @async
 * @yields {messenger.messages.MessageHeader}
*/
async function* iterateMessagePages(page) {
    for (let message of page.messages) {
        yield message;
    }

    while (page.id) {
        page = await messenger.messages.continueList(page.id);
        for (let message of page.messages) {
            yield message;
        }
    }
}

/**
 * @param {string} messageId 
 */
function normalizeMessageId(messageId){
    if (messageId.startsWith("<") && messageId.endsWith(">")) {
        messageId = messageId.substring(1, messageId.length - 1);
    }
    return messageId;
}


async function load() {
    await messenger.messages.onNewMailReceived.addListener(async (folder, messages) => {
        let res = await browser.storage.sync.get('ignoreFolderTypes');
        /** @type {IgnoreFolderTypes} */
        let ignoreFolderTypes = res.ignoreFolderTypes ?? {};
        
        for await (let message of iterateMessagePages(messages)) {
            let full = await messenger.messages.getFull(message.id);
            /** @type {string[]} */
            let references = [ 
                full.headers["references"] ?? [],
                full.headers["in-reply-to"] ?? []
            ].flat().flatMap(r => r.split(' '));
            referencesLoop: for (let messageId of references) {
                messageId = normalizeMessageId(messageId);
                let queryResult = await messenger.messages.query({"headerMessageId" : messageId})
                for (let referenceMessage of queryResult.messages) {
                    if(ignoreFolderTypes[referenceMessage.folder.type]===false && referenceMessage.folder != message.folder){
                        messenger.messages.move([message.id], referenceMessage.folder)
                        break referencesLoop;
                    }
                }
            }
        }
    })
}

document.addEventListener("DOMContentLoaded", load);
