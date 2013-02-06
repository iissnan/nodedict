describe "LocalStorage Test", ->
  ls = null
  fs = require "fs"

  beforeEach ->
    ls = require("../lib/localStorage.js").localStorage

  describe "设置数据存储的文件", ->

    it "读取指定文件", ->
      ls.init __dirname + "/data/data.json"
      expect(ls.data).not.toBeNull()

    it "若指定文件不存在，读取默认文件", ->
      ls.init __dirname + "/data/nonexist.json"
      expect(ls.data).not.toBeNull()

    it "若指定文件与默认文件皆不存在，创建默认文件", ->
      # 删除默认文件
      testDefaultFile = __dirname + "/data/default.js"
      fs.unlinkSync testDefaultFile if fs.existsSync testDefaultFile
      ls.init __dirname + "/data/nonexist.json"
      expect(ls.data).not.toBeNull()

  describe "getItem", ->
    beforeEach ->
      ls.setDefaultDataFile __dirname + "/data/data.json"

    it "若无对应key的数值返回null", ->
      key = "nonExist"
      ls.removeItem(key) if (ls.getItem "nonExist") isnt null
      item = ls.getItem "nonExist"
      expect(item).toBeNull()

    it "返回对应的值", ->
      item = ls.getItem "consult"
      expect(item.count).toEqual 1

  describe "setItem", ->
    beforeEach ->
      ls.setDefaultDataFile __dirname + "/data/data.json"

    it "如果key不存在，则创建", ->
      key = "nonExist"
      item = ls.getItem key
      ls.removeItem key if item isnt null
      ls.setItem key
      item = ls.getItem key
      expect(item.count).toEqual 1

    it "若key存在，则更新", ->
      key = "update"
      item = ls.getItem key
      count = item.count
      ls.setItem key
      item = ls.getItem key
      expect(item).not.toBeNull()
      expect(item.count).toEqual count + 1

  describe "removeItem", ->
    it "删除指定的键值对", ->
      ls.setDefaultDataFile __dirname + "/data/data.json"
      key = "remove"
      ls.setItem key
      item = ls.getItem key
      expect(item).not.toBeNull()
      ls.removeItem key
      item = ls.getItem key
      expect(item).toBeNull()

  describe "save", ->
    beforeEach ->
      ls.setDefaultDataFile __dirname + "/data/data.json"

    it "设置时保存", ->
      ls.setItem "update"

    it "删除时保存", ->
      ls.removeItem "nonExist"