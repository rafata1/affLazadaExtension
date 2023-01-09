console.log("injected popup.js")

function loadCache() {
    let subId1 = localStorage.getItem("subId1")
    let subId2 = localStorage.getItem("subId2")
    let subId3 = localStorage.getItem("subId3")
    let userCode = localStorage.getItem("userCode")

    if (subId1) {
        document.getElementById("subId1").value = subId1
    }

    if (subId2) {
        document.getElementById("subId2").value = subId2
    }

    if (subId3) {
        document.getElementById("subId3").value = subId3
    }

    if (userCode) {
        document.getElementById("userCode").value = userCode
    }
}

loadCache()

function setCache(subId1, subId2, subId3, userCode) {
    localStorage.setItem("subId1", subId1)
    localStorage.setItem("subId2", subId2)
    localStorage.setItem("subId3", subId3)
    localStorage.setItem("userCode", userCode)
}


const subBtn = document.getElementById("subBtn")

subBtn.addEventListener("click", process)


async function process() {
    
    subBtn.disabled = true
    subBtn.style.backgroundColor = "yellow"
    subBtn.innerText = "Đang xử lý"

    let content = document.getElementById("inp").value
    subId1 = document.getElementById("subId1").value
    subId2 = document.getElementById("subId2").value
    subId3 = document.getElementById("subId3").value
    userCode = document.getElementById("userCode").value

    setCache(subId1, subId2, subId3, userCode)

    const out = document.getElementById("out")

    let masterLink = await getMasterLink(userCode)
    if (masterLink == '') {
        setOutput(out, "Lỗi lấy master link")
        return
    }

    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g

    if (!content) {
        alert("Dữ liệu không hợp lệ")
        return
    }

    let urls = content.match(urlRegex)


    const originUrls = []

    for (let i = 0; i < urls.length; i++) {
        let url = await openTabAndGetUrl(urls[i])
        if (url == '') {
            setOutput(out, 'Lỗi khi xử  lý link: ' + urls[i] + ' vui lòng kiểm tra kết nối mạng và thử lại')
            return
        }
        originUrls.push(url)
    }

    console.log("originUrls", originUrls)

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(
            activeTab.id,
            {
                originUrls: originUrls,
                subId1: subId1,
                subId2: subId2,
                subId3: subId3,
                masterLink: masterLink
            },
            (response) => {
                console.log("affLinks", response)

                if (!response || response.length != urls.length) {
                    setOutput(out, 'Có lỗi xảy ra, vui lòng thử lại')
                    return
                }

                for (let i = 0; i < urls.length; i++) {
                    content = content.replace(urls[i], response[i])
                }

                setOutput(out, content)
                subBtn.style.backgroundColor = "#80ff00"
                subBtn.innerText = 'Đã xong'
            });
    });
}

async function openTabAndGetUrl(url) {
    let res = ""
    let tabID = 0
    chrome.tabs.create({ url: url, active: false }, function (tab) {
        tabID = tab.id
    });

    // waiting for chrome to open tab
    await sleep(500)
    if (tabID == 0) {
        console.log("error tabID = 0", url)
        return ''
    }

    chrome.tabs.get(tabID, function (tab) {
        res = (tab.pendingUrl || tab.url)
    })

    await sleep(1000)
    chrome.tabs.remove(tabID)
    res = removeURLParameter(res, "trafficFrom")
    res = removeURLParameter(res, "laz_trackid")
    res = removeURLParameter(res, "mkttid")
    return res
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}

function setOutput(output, content) {
    output.value = content
    output.hidden = false
}


async function getMasterLink(userCode) {
    const response = await fetch('https://api.vouchertoday.org/api/getMasterLink?code=' + userCode);
    const res = await response.json()
    console.log(res.link)
    return res.link
}