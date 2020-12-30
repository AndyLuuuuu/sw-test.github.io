const sInput = document.getElementById('sInput')
const mInput = document.getElementById("mInput")
const oneMB = 1048576
const stream: {
    tStream: TransformStream,
    rStream: ReadableStream,
    wStream: WritableStream,
    writer: WritableStreamDefaultWriter
} = {
    tStream: null,
    rStream: null,
    wStream: null,   
    writer: null
}

const makeIframe = (src) => {
if (!src) throw new Error('meh')
    const iframe = document.createElement('iframe')
    iframe.hidden = true
    iframe.src = src
    document.body.appendChild(iframe)
    return iframe
}

const reset = () => {
    Object.keys(stream).forEach(key => {
        stream[key] = null
    })
}

const writeToStream = (chunk: ArrayBuffer | null, next?: Function) => {
    if (!chunk || !chunk.byteLength) {
        stream.writer.close()
        return reset()
    }

    if (!stream.writer) {
        stream.writer = stream.wStream.getWriter()
    }

    stream.writer.write(new Uint8Array(chunk)).then(() => {
        next ? next() : null
    }).catch(err => {
        throw Error(err)
    })
}

const sendMessage = (message: any, transferableObject: Transferable[]) => {
    return navigator.serviceWorker.controller.postMessage(message, transferableObject)
}

const messageChannel = (e) => {
    const type = e.data.type
    const data = e.data.data
    switch (type) {
        case 'URL':
            makeIframe(data)
            break;
    }
}

const createStream = async (callback: Function) => {
    stream.tStream = await new TransformStream()
    stream.rStream = await stream.tStream.readable
    stream.wStream = await stream.tStream.writable
    callback()
}

const start = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service.js').then(registration => {
            if (registration.active) {
                console.log("Service Worker active!")
            }
            navigator.serviceWorker.addEventListener("message", messageChannel)
    
        }).catch(error => {
            console.log("Error registering Service Worker!")
            console.log(error)
        })
    } else {
        console.log("Service Workers are not supported!")
    }
}

start()

sInput.addEventListener('change', async e => {
    const file = await e.target['files'][0] as File
    const fileInformation = {
        name: file.name.replace(/\s/g, "_"),
        size: file.size
    }
    createStream(async () => {
        sendMessage({
            type: 'setup',
            file: fileInformation,
            data: stream.rStream
        }, [stream.rStream] as any)

        let offset = 0;

        const next = () => {
            file.slice(offset, offset + oneMB).arrayBuffer().then(buff => {
                writeToStream(buff, next)
            })
            offset += oneMB
        }

        next()
        
    })
})

mInput.addEventListener('change', async e => {
    let zip = new JSZip();
    console.log(zip)
    const files = await e.target['files']
    console.log(files)
    let totalSize = 0;

    for(let file of files) {
        totalSize += file.size
    }

    const fileInformation = {
        name: 'Archive.zip',
        size: totalSize
    }

    createStream(async () => {
        sendMessage({
            type: 'setup',
            file: fileInformation,
            data: stream.rStream
        }, [stream.rStream] as any)

        for(let file of files) {
            zip.file(file.name)
            // let offset = 0;

            // const next = () => {
            //     file.slice(offset, offset + oneMB).arrayBuffer().then(buff => {
            //         writeToStream(buff, next)
            //     })
            //     offset += oneMB
            // }

            // next()
        }
    })
})