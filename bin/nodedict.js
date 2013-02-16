#!/usr/bin/env node

"use strict";

var http = require("http"),
    fs = require("fs"),
    ls = require("../lib/localStorage.js").localStorage,
    logger = require("../lib/logger.js").logger,
    u = require("util");

var OPTIONS = [
    "--help", "-h",
    "--version", "-v",
    "--debug", "-d"
];

var isDebug = false;

// Command Line Arguments
var args = process.argv.slice(2),
    input = getUserInput();

/**
 * 获取用户输入
 * 若用户输入了help或者version参数，将直接显示帮助或者版本信息
 * 否则 取用户输入的第一个词作为查询
 * @return {String}
 */
function getUserInput () {
    var length = args.length;
    if (length > 0) {
        // 判断是否输入了help和versio两个options
        if (has(args, "--version") || has(args, "-v")) {
            return "--version";
        }
        if (has(args, "--help") || has(args, "-h")) {
            return "--help";
        }

        // 調試模式判斷
        if ((has(args, "--debug") || has(args, "-d")) && length > 1) {
            isDebug = true;
            var index = has(args, "--debug") ?
                args.indexOf("--debug") :
                    args.indexOf("-d");
            return index === 0 ? args[1] : args[0];
        }

        return args[0];
    } else {
        return "--help";
    }
}

/**
 * 判斷數組arr是否包含value
 * @param {Array} arr
 * @param {String} value
 * @return {Boolean}
 */
function has(arr, value) {
    return arr.indexOf(value) > -1;
}


// 使用API key 时，请求频率限制为每小时1000次，超过限制会被封禁。
var YOUDAO_API = "http://fanyi.youdao.com/openapi.do?" +
    "keyfrom=DictNode" +
    "&key=105527560" +
    "&type=data" +
    "&doctype=json" +
    "&version=1.1"  +
    "&q=" + input;

// 路由
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

    if (isDebug) {
        logger.log("\n調試信息===================================\n");
        logger.log("用戶輸入：" + u.inspect(args));
        logger.log("遠程返回：" + u.inspect(response));
        logger.log("\n調試信息===================================\n");
    }

    // 单词信息
    if (basic !== undefined) {
        ps = basic.phonetic;
        ex = basic.explains;
        logger.log("\r");
        logger.log(q, ["underline"]);
        if (ps !== undefined) {
            logger.pass( "    * [ " + ps + "]:\r");
        }
        if (ex !== undefined) {
            ex.forEach(function (explain) {
                logger.log("    - " + explain + "\r");
            });
        }
        logger.log("\r");

        ls.setItem(input);
    } else {
        logger.error( q + " => 未找到該單詞\n");
    }
}