'use strict'

/**
 * @param {string} id
 * @returns {boolean}
 */
function getCheckboxValue(id){
    /** @type {HTMLInputElement} */
    let cbElement = document.querySelector(`#${id}`);
    if(cbElement){
        return cbElement.checked;
    }
    return false;
}

/**
 * @param {string} id
 * @param {boolean} checked
 */
function setCheckboxValue(id, checked){
    /** @type {HTMLInputElement} */
    let cbElement = document.querySelector(`#${id}`);
    if(cbElement){
        cbElement.checked = checked;
    }
}

/** @type {IgnoreFolderTypes} */
let ignoreFolderTypes = {
    inbox: false,
    drafts: false,
    sent: false,
    trash: false,
    templates: false,
    archives: false,
    junk: false,
    outbox: false
}

async function saveOptions(e) {
    e.preventDefault();
    for(let type in ignoreFolderTypes){
        ignoreFolderTypes[type] = getCheckboxValue(`ignore_${type}`);
    }
    await messenger.storage.sync.set({
        ignoreFolderTypes: ignoreFolderTypes
    });
}

async function restoreOptions() {
    let res = await browser.storage.sync.get('ignoreFolderTypes');
    res.ignoreFolderTypes = res.ignoreFolderTypes ?? {};
    for(let type in ignoreFolderTypes){
        let cb = document.querySelector('#folders')
            .appendChild(document.createElement('div'))
            .appendChild(document.createElement('input'))
        cb.type = 'checkbox';
        cb.id = `ignore_${type}`;
        cb.checked = res.ignoreFolderTypes[type];
        cb.after(type);
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);