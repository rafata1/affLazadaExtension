console.log("Waiting for event ...")

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    run(request.originUrls, request.subId1, request.subId2, request.subId3, request.masterLink, sendResponse)
    return true
});

async function run(originUrls, subId1, subId2, subId3, masterLink, sendResponse) {
    console.log("received origin urls", originUrls)
    const affLinks = []

    for (let i = 0; i < originUrls.length; i++) {
        setMasterLink(masterLink)
        setSubIds(subId1, subId2, subId3)
        setURL(originUrls[i])
        clickSubmit()
        await sleep(500)
        affLinks.push(getAffLink())
    }

    await sleep(500)
    sendResponse(affLinks)
    return true
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setMasterLink(link) {
    document.getElementById("masterLink").value = link
}

function setURL(url) {
    document.getElementById("sourceUrl").value = url
}

function setSubIds(subId1, subId2, subId3) {
    document.getElementById("subId1").value = subId1
    document.getElementById("subId2").value = subId2
    document.getElementById("subId3").value = subId3
}

function clickSubmit() {
    document.getElementById("submitButton").click()
}

function getAffLink() {
    return document.getElementById("affShortLink").innerText
}
