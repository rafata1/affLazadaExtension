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

async function run() {
    let content = prompt("Nhập bài viết")

    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g

    if (!content) {
        alert("Dữ liệu không hợp lệ")
        return
    }

    let urls = content.match(urlRegex)
    console.log("urlify", urls)


    let originUrls = []
    chrome.runtime.sendMessage(urls, function (response) {
        console.log("resp", response)
        originUrls = response
    })

    await sleep(urls.length * 1300)
    console.log("origin urls", originUrls)


    const affLinks = []
    setMasterLink()
    for (let i = 0; i < originUrls.length; i++) {
        setURL(originUrls[i])
        clickSubmit()
        await sleep(300)
        affLinks.push(getAffLink())
    }

    console.log(affLinks)

    for (let i = 0; i < urls.length; i++) {
        content = content.replace(urls[i], affLinks[i])
    }

    alert(content)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

run()