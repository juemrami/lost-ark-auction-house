"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
var helpers_1 = require("./helpers");
var robotjs_1 = require("robotjs");
var sharp_1 = require("sharp");
var tesseract_js_1 = require("tesseract.js");
var clipboardy_1 = require("clipboardy");
var SEARCH_RESULT_BOX = {
    LOC: {
        // pixel
        x: 520,
        y: 304,
        // length
        width: 1633 - 304,
        height: 520 - 360
    },
    // coordinates relative to the search result box canvas
    // (see dimensions above)
    RECENT_PRICE: {
        x: 609,
        y: 18,
        width: 69,
        height: 20
    },
    LOWEST_PRICE: {
        x: 769,
        y: 18,
        width: 69,
        height: 20
    },
    CHEAPEST_REM: {
        x: 1030,
        y: 18,
        width: 69,
        height: 20
    },
    AVG_DAILY_PRICE: {
        x: 452,
        y: 18,
        width: 69,
        height: 20
    },
    BUNDLE_SIZE: {
        x: 90,
        y: 28,
        width: 190,
        height: 20
    },
    ITEM_NAME: {
        x: 90,
        y: 6,
        width: 200,
        height: 20
    }
};
var results = {};
main();
var ocr_worker = (0, tesseract_js_1.createWorker)({
// logger: (m) => console.log(m),
});
function main() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var items, _i, items_1, item_name, item_image, results_1, results_1_1, item, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: 
                //worker required setup
                //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#create-worker
                return [4 /*yield*/, ocr_worker.load()];
                case 1:
                    //worker required setup
                    //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#create-worker
                    _b.sent();
                    return [4 /*yield*/, ocr_worker.loadLanguage("eng+digits_comma+equ")];
                case 2:
                    _b.sent();
                    items = ["Big Rock", "Little Rock", "Sharded Rock"];
                    _i = 0, items_1 = items;
                    _b.label = 3;
                case 3:
                    if (!(_i < items_1.length)) return [3 /*break*/, 7];
                    item_name = items_1[_i];
                    return [4 /*yield*/, searchMarket(item_name)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, captureImage(SEARCH_RESULT_BOX.LOC, String(item_name))];
                case 5:
                    item_image = _b.sent();
                    results[item_name] = extractPrices(item_image);
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    _b.trys.push([7, 12, 13, 18]);
                    results_1 = __asyncValues(results);
                    _b.label = 8;
                case 8: return [4 /*yield*/, results_1.next()];
                case 9:
                    if (!(results_1_1 = _b.sent(), !results_1_1.done)) return [3 /*break*/, 11];
                    item = results_1_1.value;
                    _b.label = 10;
                case 10: return [3 /*break*/, 8];
                case 11: return [3 /*break*/, 18];
                case 12:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 18];
                case 13:
                    _b.trys.push([13, , 16, 17]);
                    if (!(results_1_1 && !results_1_1.done && (_a = results_1["return"]))) return [3 /*break*/, 15];
                    return [4 /*yield*/, _a.call(results_1)];
                case 14:
                    _b.sent();
                    _b.label = 15;
                case 15: return [3 /*break*/, 17];
                case 16:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 17: return [7 /*endfinally*/];
                case 18: return [4 /*yield*/, ocr_worker.terminate()];
                case 19:
                    _b.sent();
                    console.log(results);
                    return [2 /*return*/];
            }
        });
    });
}
//
//needs new arg to support box region
function parseImage(image_buffer, lang) {
    return __awaiter(this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ocr_worker.initialize(lang)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, ocr_worker.recognize(image_buffer)];
                case 2:
                    text = (_a.sent()).data.text;
                    console.log("ocr results: ".concat(text));
                    // console.log(text.replace(/\s/g, ""));
                    // console.log(/\.\d{3,}/.test(text));
                    if (/unit/.test(text)) {
                        return [2 /*return*/, text];
                    }
                    else if (/\.\d{3,}/.test(text)) {
                        text = text.replace(/\./, "");
                        return [2 /*return*/, isNaN(Number(text)) ? "" : text.trim()];
                    }
                    else {
                        text = text.replace(/\s/g, "");
                        return [2 /*return*/, isNaN(Number(text)) ? "" : text];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function extractPrices(image_buffer) {
    return __awaiter(this, void 0, void 0, function () {
        var recent, lowest, _a, time, bundle, unitSize, lowPrice, price, bundle_text, i, word;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    recent = parseImage(image_buffer, "digits_comma");
                    lowest = parseImage(image_buffer, "digits_comma");
                    return [4 /*yield*/, recent];
                case 1:
                    _a = (_b.sent()).length == 0;
                    if (_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, lowest];
                case 2:
                    _a = (_b.sent()).length == 0;
                    _b.label = 3;
                case 3:
                    if (_a) {
                        return [2 /*return*/, {
                                price: false,
                                lowPrice: false,
                                unitSize: 1,
                                time: ""
                            }];
                    }
                    time = Date();
                    return [4 /*yield*/, parseImage(image_buffer, "digits_comma")];
                case 4:
                    bundle = _b.sent();
                    unitSize = 1;
                    lowPrice = Number(lowest);
                    price = Number(recent);
                    if (bundle.length > 0) {
                        bundle_text = bundle.split(" ");
                        for (i = 0; i < bundle_text.length; i++) {
                            word = bundle_text[i];
                            if (word.toLowerCase().includes("units")) {
                                unitSize = Number(bundle_text[i - 1].trim());
                                lowPrice = lowPrice / unitSize;
                                price = price / unitSize;
                            }
                        }
                    }
                    return [2 /*return*/, {
                            price: price,
                            lowPrice: lowPrice,
                            unitSize: unitSize,
                            time: time
                        }];
            }
        });
    });
}
function searchMarket(item_name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, clipboardy_1["default"].write(item_name)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, helpers_1.wait)(250)];
                case 2:
                    _a.sent();
                    // To search bar and search
                    (0, robotjs_1.moveMouse)(this.SEARCH_POS.x, this.SEARCH_POS.y);
                    (0, robotjs_1.mouseClick)();
                    // paste the search term
                    (0, robotjs_1.moveMouse)(this.SEARCH_POS.x - 50, this.SEARCH_POS.y);
                    (0, robotjs_1.mouseClick)();
                    (0, robotjs_1.keyTap)("v", "control");
                    // start searching
                    (0, robotjs_1.keyTap)("enter");
                    // Wait for search results
                    return [4 /*yield*/, (0, helpers_1.wait)(500)];
                case 3:
                    // Wait for search results
                    _a.sent();
                    if ((0, robotjs_1.getPixelColor)(999, 785) == "cccc01") {
                        console.log("yellow");
                        // getPriceData(item_name);
                    }
                    _a.label = 4;
                case 4:
                    if (!((0, robotjs_1.getPixelColor)(this.LOADING_POS.x, this.LOADING_POS.y) ===
                        this.LOADING_COLOR)) return [3 /*break*/, 6];
                    //if not wait an extra .25 sec
                    return [4 /*yield*/, (0, helpers_1.wait)(250)];
                case 5:
                    //if not wait an extra .25 sec
                    _a.sent();
                    return [3 /*break*/, 4];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function captureImage(dim, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var channels, _a, image, cWidth, cHeight, img_buffer;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    channels = 4;
                    _a = robotjs_1.screen.capture(dim.x, dim.y, dim.width, dim.height), image = _a.image, cWidth = _a.width, cHeight = _a.height;
                    img_buffer = (0, sharp_1["default"])(Buffer.from(image), {
                        density: 72,
                        raw: {
                            width: cWidth,
                            height: cHeight,
                            channels: channels
                        }
                    }).recomb([
                        [0, 0, 1],
                        [0, 1, 0],
                        [1, 0, 0],
                    ]).toBuffer();
                    return [4 /*yield*/, img_buffer];
                case 1: 
                // return image before resizing,
                // sharpImg
                //   .flatten()
                //   .negate({ alpha: false })
                //   .toColorspace("b-w")
                //   .withMetadata({ density: 150 })
                //  .png();
                // .toFile(`./src/image_dump/${filename}.png`);
                // .resize(dim.width * 4, dim.height * 4, { kernel: "mitchell" })
                // .threshold(184)
                return [2 /*return*/, _b.sent()];
            }
        });
    });
}
