#!/usr/bin/env node

var http = require("http"),
    fs = require("fs");

// Command Line Arguments
var args = process.argv.slice(2),
    word = args[0];

// 使用API key 时，请求频率限制为每小时1000次，超过限制会被封禁。
var YOUDAO_API = "http://fanyi.youdao.com/openapi.do?" +
                "keyfrom=DictNode" +
                "&key=105527560" +
                "&type=data" +
                "&doctype=json" +
                "&version=1.1"  +
                "&q=" + word;

switch (word) {
    case undefined:
    case "--help":
    case "-h":
        getHelp();
        break;
    case "--version":
    case "-v":
        getVersion();
        break;
    default:
        getResult();
        break;
}


/**
 * 顯示幫助信息
 */
function getHelp() {
    var usage = "Usage: nodedict [options] word\n" +
        "Options:\n" +
        "  -h, --help       display this help and exit\n" +
        "  -v, --version    display version info and exit\n";

    console.log(usage);
    process.exit(0);
}

/**
 * 顯示版本信息
 */
function getVersion(){
    var content = fs.readFileSync(__dirname + "/../package.json", "utf-8");
    var pkg = JSON.parse(content);
    console.log(pkg.version);
    process.exit(0);
}

/**
 * 獲取釋義
 */
function getResult(){
    var req = http.request(YOUDAO_API, function (res) {
        var YOUDAO_API_ERRORCODE = {
            "0" : "正常",
            "20": "搜索文本過長",
            "30": "无法进行有效的翻译",
            "40": "不支持的语言类型",
            "50": "无效的key"
        };

        res.on("data", function (chunk) {
            var result = JSON.parse(chunk);
            var code = result.errorCode;
            switch (code) {
                case 0:     // 正常
                    showResult(result);
                    break;
                case 20:    // 要翻译的文本过长
                case 30:    // 无法进行有效的翻译
                case 40:    // 不支持的语言类型
                case 50:    // 无效的key
                    console.log(YOUDAO_API_ERRORCODE[code]);
                    break;
                default:
                    break;
            }
        });
    });

    req.on("error", function (e) {
        console.log("請求失敗: " + e.message);
    });

    req.end();
}

/**
 * 顯示結果
 */
function showResult(response){
    if (response.basic !== undefined) {
        console.log( response.query + " => [" + response.basic.phonetic + "]\r");
        response.basic.explains.forEach(function (explain) {
            console.log("    " + explain + "\r");
        });
    } else {
        console.log( response.query + " => 未找到該單詞");
    }
}
