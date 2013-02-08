#!/usr/bin/env node

var http = require("http"),
    fs = require("fs"),
    os = require("os"),
    ls = require("../lib/localStorage.js").localStorage,
    logger = require("../lib/logger.js").logger;

// Command Line Arguments
var args = process.argv.slice(2),
    input = args[0];

var isDebug = false;

// 使用API key 时，请求频率限制为每小时1000次，超过限制会被封禁。
var YOUDAO_API = "http://fanyi.youdao.com/openapi.do?" +
    "keyfrom=DictNode" +
    "&key=105527560" +
    "&type=data" +
    "&doctype=json" +
    "&version=1.1"  +
    "&q=" + input;

// 判断用户输入
switch (input) {
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

    logger.log(usage);
    process.exit(0);
}

/**
 * 顯示版本信息
 */
function getVersion(){
    var content = fs.readFileSync(__dirname + "/../package.json", "utf-8");
    var pkg = JSON.parse(content);
    logger.log(pkg.version);
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

        var chunks = [];

        res
            .on("data", function (chunk) {
                chunks.push(chunk.toString());
            })
            .on("end", function () {
                if (isDebug) {
                    console.log("接收的内容：" + chunks.join(""));
                }
                var result = null;
                try {
                    result = JSON.parse(chunks.join(""));
                    var code = result.errorCode;
                    switch (code) {
                        case 0:     // 正常
                            showResult(result);
                            break;
                        case 20:    // 要翻译的文本过长
                        case 30:    // 无法进行有效的翻译
                        case 40:    // 不支持的语言类型
                        case 50:    // 无效的key
                            logger.error(YOUDAO_API_ERRORCODE[code]);
                            break;
                        default:
                            break;
                    }
                } catch(e) {
                    logger.error("数据解析错误：" + e.message);
                }
            })
            .on("error", function (e) {
                logger.error("請求失敗: " + e.message);
            });

    });

    req.end();
}

/**
 * 顯示結果
 */
function showResult(response){

    var basic = response.basic,
        q  = response.query,
        ps,
        ex;

    // 单词信息
    if (basic !== undefined) {
        ps = basic.phonetic;
        ex = basic.explains;
        logger.log("\r");
        logger.log(q, ["underline"]);
        if (ps !== undefined) {
            logger.pass( "    - [ " + ps + "]:\r");
        }
        if (ex !== undefined) {
            ex.forEach(function (explain) {
                logger.log("    - " + explain + "\r");
            });
        }
        logger.log("\r");

        ls.setItem(input);
    } else {
        logger.error( q + " => 未找到該單詞");
    }
}