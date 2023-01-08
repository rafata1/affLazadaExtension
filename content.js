console.log("Waiting for event ...")

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    run(request, sendResponse)
    return true
});

async function run(originUrls, sendResponse) {
    console.log("received origin urls", originUrls)
    const affLinks = []
    setMasterLink()
    for (let i = 0; i < originUrls.length; i++) {
        setURL(originUrls[i])
        clickSubmit()
        await sleep(300)
        affLinks.push(getAffLink())
    }

    sendResponse(affLinks)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setMasterLink() {
    document.getElementById("masterLink").value = "https://c.lazada.vn/t/c.0kjvGX"
}

function setURL(url) {
    document.getElementById("sourceUrl").value = url
}

function clickSubmit() {
    document.getElementById("submitButton").click()
}

function getAffLink() {
    return document.getElementById("affShortLink").innerText
}
