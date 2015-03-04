/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ctCache = {
        'breadcrumb': {},
        'monitor-networking': {
            graphs: {},
            charts: {},
            lists: {}
        }
    };

    var CTCache = function () {
        this.init = function () {};

        this.cleanCache = function(key) {
            this.set(key, {});
        };

        this.get = function (key) {
            var keyList = key.split(':'),
                cache = ctCache;

            for (var i = 0; i < keyList.length; i++) {
                cache = cache[keyList[i]];
                if (cache == null) {
                    return cache;
                }
            }

            return cache;
        };

        this.set = function (key, value) {
            var keyList = key.split(':'),
                cache = ctCache;

            for (var i = 0; i < keyList.length; i++) {
                if (cache[keyList[i]] == null && i != (keyList.length - 1)) {
                    cache[keyList[i]] = {};
                    cache = cache[keyList[i]];
                } else if (i == (keyList.length - 1)) {
                    cache[keyList[i]] = value;
                } else if (cache[keyList[i]] != null) {
                    cache = cache[keyList[i]];
                }
            }
        };

        this.getDataFromCache = function (ucid) {
            return this.get(ucid);
        };

        this.setData2Cache = function (ucid, dataObject) {
            this.set(ucid, {lastUpdateTime: $.now(), dataObject: dataObject});
        }
    };

    return CTCache;
})