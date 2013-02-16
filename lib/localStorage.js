"use strict";

var fs = require("fs");

module.exports.localStorage = function () {
    /*  数据结构
        o = {
            "consult" : {
                count: 2,
                created_at: 1360135267158,
                updated_at: [1360135267158, 1360135267158]
            },
            "update" : {
                count: 1,
                created_at: 1360135267158,
                updated_at: 1360135267158
            }
     */

    var localStorage = {
        /**
         * 初始化
         * @param {String} [file="../data/data.json"] 数据文件地址
         */
        init: function(file){
            this.setDefaultDataFile(file);
        },

        /**
         * 获取指定key的数据
         * @param {String} key
         * @return {*}
         */
        getItem: function(key) {
            if (this.data.hasOwnProperty(key)) {
                return this.data[key];
            } else {
                return null;
            }
        },

        /**
         * 设置指定key的值
         * @param {String} key
         */
        setItem: function (key) {
            var date = +new Date(),
                item = this.data[key];

            if (typeof item !== "undefined") { // 已查询过
                item.count += 1;
                item.updated_at.push(date);
            } else {
                this.data[key] = {};
                item = this.data[key];
                item.count = 1;
                item.created_at = date;
                item.updated_at = [date];
            }
            this.save();
        },

        /**
         * 删除
         * @param key
         */
        removeItem : function (key) {
            if (this.getItem(key) !== null) {
                delete this.data[key];
                this.save();
            }
        },

        /**
         * 更新本地文件
         */
        save: function() {
            var content = JSON.stringify(this.data);
            fs.writeFileSync(this.file, content, "utf-8");
        },

        /**
         * 设置默认数据存储地址
         * @param {String} file 默认文件路径
         */
        setDefaultDataFile: function (file){
            var defaultDataFile = __dirname + "/../data/data.json",
                fileContent = "",
                fileContentJSON = null;
            if (fs.existsSync(file)) { // 读取指定文件
                fileContent = fs.readFileSync(file);
                try {
                    fileContentJSON = JSON.parse(fileContent);
                    this.file = file;
                } catch(e) {}
            } else if(fs.existsSync(defaultDataFile)) { // 读取默认文件
                fileContent = fs.readFileSync(defaultDataFile);
                try {
                    fileContentJSON = JSON.parse(fileContent);
                    this.file = defaultDataFile;
                } catch(e) {}
            } else { // 若指定以及默认文件都不存在，则创建默认文件
                console.log("数据存储的文件不存在，正在创建文件...");
                fs.writeFileSync(defaultDataFile, "", "utf-8");
                this.file = defaultDataFile;
            }
            this.data = fileContentJSON || {};
        }
    };
    localStorage.init();

    return localStorage;
}();