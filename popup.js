console.log("injected popup.js")

const subBtn = document.getElementById("subBtn")

subBtn.addEventListener("click", process)


async function process() {

    subBtn.disabled = true
    subBtn.innerText = "Đang xử lý"


    let content = document.getElementById("inp").value

    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g

    if (!content) {
        alert("Dữ liệu không hợp lệ")
        return
    }

    let urls = content.match(urlRegex)

    const originUrls = []
    for (let i = 0; i < urls.length; i++) {
        let url = await openTabAndGetUrl(urls[i])
        originUrls.push(url)
    }

    console.log("originUrls", originUrls)

    const out = document.getElementById("out")

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, originUrls, (response) => {
            console.log("affLinks", response)

            for (let i = 0; i < urls.length; i++) {
                content = content.replace(urls[i], response[i])
            }

            out.value = content
            out.hidden = false
        });
    });
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
    chrome.tabs.remove(tabID)
    return res
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
