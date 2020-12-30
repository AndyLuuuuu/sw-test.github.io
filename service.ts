let download: {
    readableStream: ReadableStream,
    file: {}
    downloadUrl: string
} = {
    readableStream: null,
    file: null,
    downloadUrl: null
}



self.addEventListener("message", async (e) => {
    const type = e.data.type
    const data = e.data.data
    console.log(data.file)
    switch (type) {
        case 'setup':
            download.readableStream = data
            download.file = e.data.file
            download.downloadUrl = `${e.origin}/abcdef/${e.data.file.name}`
            self['clients'].get(e['source']['id']).then(client => {
                client.postMessage({type: 'URL', data: download.downloadUrl})
            })
            break;
    }
    // download.readableStream = e.data
    // console.log(e)
})

self.addEventListener('fetch', async (e) => {
    if (e['request']['url'].split("/").slice(-2)[0] === 'abcdef') {
        e['respondWith'](self['clients'].get(e['clientId']).then(client => {
            console.log(e['request']['url'].split("/").slice(-2)[0])
                // createStream()
                const responseHeaders = new Headers({
                    // 'Content-Type': 'application/nothing; charset=utf-8',
                    // 'Content-Length': `${download.file['size']}`,
                    'Content-Disposition': `attachment; filename=${download.file['name']}`,
                    // To be on the safe side, The link can be opened in a iframe.
                    // but octet-stream should stop it.
                    'Content-Security-Policy': "default-src 'none'",
                    'X-Content-Security-Policy': "default-src 'none'",
                    'X-WebKit-CSP': "default-src 'none'",
                    'X-XSS-Protection': '1; mode=block'
                  })
                const response = new Response(download.readableStream, {
                    headers: responseHeaders})
                return response
        }))
    }
})