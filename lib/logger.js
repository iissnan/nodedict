var fs = require("fs");

// 终端颜色支持 ANSI Colors
var colorsFileContent = "",
    colors = {};
try {
    colorsFileContent = fs.readFileSync(__dirname + "/colors.json");
    colors = JSON.parse(colorsFileContent);
} catch(e) {
    console.log("颜色文件读取失败");
    colors = {
        pass_prefix: "",
        pass_suffix: "",
        error_prefix: "",
        error_suffix: "",
        warn_prefix: "",
        warn_suffix: "",
        info_prefix: "",
        info_suffix: "",
        underline_prefix: "",
        underline_suffix: "",
        bold_prefix: "",
        bold_suffix: "",
        ignore_prefix: "",
        ignore_suffix: ""
    };
}

module.exports.logger = {
    pass: function (message, styles) {
        this.message = colors.pass_prefix + message + colors.pass_suffix;
        this.styleWrap(styles);
        console.log(this.message);
    },
    error: function (message, styles) {
        this.message = colors.error_prefix + message + colors.error_suffix;
        this.styleWrap(styles);
        console.log(this.message);
    },
    warn: function (message, styles) {
        this.message = colors.warn_prefix + message + colors.warn_suffix;
        this.styleWrap(styles);
        console.log(this.message);
    },
    info: function (message, styles) {
        this.message = colors.info_prefix + message + colors.info_suffix;
        this.styleWrap(styles);
        console.log(this.message)
    },
    log: function (message, styles) {
        this.message = message;
        this.styleWrap(styles);
        console.log(this.message);
    },
    styleWrap: function(styles) {
        var message = this.message;
        if (styles !== undefined && styles.constructor === Array) {
            styles.forEach(function(style) {
                if (style === "underline") {
                    message = colors.underline_prefix + message + colors.underline_suffix;
                }
                if (style === "bold") {
                    message = colors.bold_prefix + message + colors.bold_suffix;
                }
            });
            this.message = message;
        }
    }
};
