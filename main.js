var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var sInput = document.getElementById('sInput');
var mInput = document.getElementById("mInput");
var oneMB = 1048576;
var stream = {
    tStream: null,
    rStream: null,
    wStream: null,
    writer: null
};
var makeIframe = function (src) {
    if (!src)
        throw new Error('meh');
    var iframe = document.createElement('iframe');
    iframe.hidden = true;
    iframe.src = src;
    document.body.appendChild(iframe);
    return iframe;
};
var reset = function () {
    Object.keys(stream).forEach(function (key) {
        stream[key] = null;
    });
};
var writeToStream = function (chunk, next) {
    if (!chunk || !chunk.byteLength) {
        stream.writer.close();
        return reset();
    }
    if (!stream.writer) {
        stream.writer = stream.wStream.getWriter();
    }
    stream.writer.write(new Uint8Array(chunk)).then(function () {
        next ? next() : null;
    })["catch"](function (err) {
        throw Error(err);
    });
};
var sendMessage = function (message, transferableObject) {
    return navigator.serviceWorker.controller.postMessage(message, transferableObject);
};
var messageChannel = function (e) {
    var type = e.data.type;
    var data = e.data.data;
    switch (type) {
        case 'URL':
            makeIframe(data);
            break;
    }
};
var createStream = function (callback) { return __awaiter(_this, void 0, void 0, function () {
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = stream;
                return [4 /*yield*/, new TransformStream()];
            case 1:
                _a.tStream = _d.sent();
                _b = stream;
                return [4 /*yield*/, stream.tStream.readable];
            case 2:
                _b.rStream = _d.sent();
                _c = stream;
                return [4 /*yield*/, stream.tStream.writable];
            case 3:
                _c.wStream = _d.sent();
                callback();
                return [2 /*return*/];
        }
    });
}); };
var start = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service.js').then(function (registration) {
            if (registration.active) {
                console.log("Service Worker active!");
            }
            navigator.serviceWorker.addEventListener("message", messageChannel);
        })["catch"](function (error) {
            console.log("Error registering Service Worker!");
            console.log(error);
        });
    }
    else {
        console.log("Service Workers are not supported!");
    }
};
start();
sInput.addEventListener('change', function (e) { return __awaiter(_this, void 0, void 0, function () {
    var file, fileInformation;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, e.target['files'][0]];
            case 1:
                file = _a.sent();
                fileInformation = {
                    name: file.name.replace(/\s/g, "_"),
                    size: file.size
                };
                createStream(function () { return __awaiter(_this, void 0, void 0, function () {
                    var offset, next;
                    return __generator(this, function (_a) {
                        sendMessage({
                            type: 'setup',
                            file: fileInformation,
                            data: stream.rStream
                        }, [stream.rStream]);
                        offset = 0;
                        next = function () {
                            file.slice(offset, offset + oneMB).arrayBuffer().then(function (buff) {
                                writeToStream(buff, next);
                            });
                            offset += oneMB;
                        };
                        next();
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
mInput.addEventListener('change', function (e) { return __awaiter(_this, void 0, void 0, function () {
    var zip, files, totalSize, _i, files_1, file, fileInformation;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                zip = new JSZip();
                console.log(zip);
                return [4 /*yield*/, e.target['files']];
            case 1:
                files = _a.sent();
                console.log(files);
                totalSize = 0;
                for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                    file = files_1[_i];
                    totalSize += file.size;
                }
                fileInformation = {
                    name: 'Archive.zip',
                    size: totalSize
                };
                createStream(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _i, files_2, file;
                    return __generator(this, function (_a) {
                        sendMessage({
                            type: 'setup',
                            file: fileInformation,
                            data: stream.rStream
                        }, [stream.rStream]);
                        for (_i = 0, files_2 = files; _i < files_2.length; _i++) {
                            file = files_2[_i];
                            zip.file(file.name);
                            // let offset = 0;
                            // const next = () => {
                            //     file.slice(offset, offset + oneMB).arrayBuffer().then(buff => {
                            //         writeToStream(buff, next)
                            //     })
                            //     offset += oneMB
                            // }
                            // next()
                        }
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
