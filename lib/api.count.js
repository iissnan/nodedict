"use strict";

var fs = require("fs");

module.exports.apiCount = function () {

    /**
     * data/api.count.json 格式：
     * {
     *      total : 10,
     *      start : 1360995768411,
     *      count : 1
     * }
     */
    var apiCount = {
        init: function (){
            var countFile = "data/api.count.json";
            var apiCount = {};
            this.data = {};
            if (fs.existsSync(countFile)) {
                apiCount = fs.readFileSync("data/api.count.json");
                try {
                    apiCount = JSON.parse(apiCount);
                } catch (e) {
                    apiCount.total = 0;
                    apiCount.count = 0;
                    apiCount.start = +new Date();
                }
            } else {
                apiCount.total = 0;
                apiCount.count = 0;
                apiCount.start = +new Date();
                fs.writeFileSync(countFile, JSON.stringify(apiCount), "utf-8");
            }

            this.data.total = apiCount.total;
            this.data.start = apiCount.start;
            this.data.count = apiCount.count;
        },

        /**
         * API调用統計++
         * API調用限制：请求频率限制为每小时1000次
         * API調用統計間隔： 一小時
         */
        setCount: function (){
            var end = +new Date();
            if (end - this.data.start < 3600 * 1000) {
                this.data.count++;
            } else {
                this.data.count = 1;
                this.data.start = +new Date();
            }

            this.save();
        },

        /**
         * 獲取某個時間週期內的調用統計
         * @return {Number}
         */
        getCount: function (){
            return this.data.count;
        },
        setTotal: function (){
            this.data.total++;
            this.save();
        },
        getTotal: function (){
            return this.data.total;
        },
        save: function (){
            fs.writeFileSync("data/api.count.json", JSON.stringify(this.data), "utf-8");
        }
    };

    apiCount.init();
    return apiCount;
}();

