#!/usr/bin/env node

var http = require("http"),
    fs = require("fs"),
    os = require("os"),
    ls = require("../lib/localStorage.js").localStorage;

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

// 终端颜色支持 ANSI Colors
var COLORS_CONTENT = fs.readFileSync(__dirname + "/colors.json", "utf-8");
var COLORS = JSON.parse(COLORS_CONTENT);




// 判断用户输入
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
        console.log(COLORS.error_prefix + "請求失敗: " + e.message + COLORS.error_suffix);
    });

    req.end();
}

/**
 * 顯示結果
 */
function showResult(response){
    if (response.basic !== undefined) {
        console.log( COLORS.success_prefix + response.query + " => [" + response.basic.phonetic + "]\r" + COLORS.success_suffix);
        response.basic.explains.forEach(function (explain) {
            console.log("    " + explain + "\r");
        });
        ls.setItem(word);
    } else {
        console.log( COLORS.error_prefix + response.query + " => 未找到該單詞" + COLORS.error_suffix);
    }
}