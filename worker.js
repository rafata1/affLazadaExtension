chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    getOriginUrls(request, sendResponse)
    return true
}
);

async function getOriginUrls(urls, sendResponse) {
    const originUrls = []
    for (let i = 0; i < urls.length; i++) {
        let url = await openTabAndGetUrl(urls[i])
        originUrls.push(url)
    }

    console.log(originUrls)
    sendResponse(originUrls)
}

async function openTabAndGetUrl(url) {
    let res = ""
    let tabID = 0
    chrome.tabs.create({ url: url, active: false }, function (tab) {
        tabID = tab.id
    });

    await sleep(600)

    chrome.tabs.get(tabID, function (tab) {
        res = (tab.pendingUrl || tab.url)
    })

    await sleep(600)
    console.log("url", res)
    chrome.tabs.remove(tabID)
    return res
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
