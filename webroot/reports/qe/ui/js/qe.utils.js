/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEUtils = function () {
        var self = this;

        self.generateQueryUUID = function () {
            var s = [], itoh = '0123456789ABCDEF';
            for (var i = 0; i < 36; i++) {
                s[i] = Math.floor(Math.random() * 0x10);
            }
            s[14] = 4;
            s[19] = (s[19] & 0x3) | 0x8;
            for (var i = 0; i < 36; i++) {
                s[i] = itoh[s[i]];
            }
            s[8] = s[13] = s[18] = s[23] = s[s.length] = '-';
            s[s.length] = (new Date()).getTime();
            return s.join('');
        };

        self.setUTCTimeObj = function (queryPrefix, reqObject, options, timeRange) {
            var serverCurrentTime = options ? options['serverCurrentTime'] : null;
            timeRange = (timeRange == null) ? getTimeRange(queryPrefix, reqObject, serverCurrentTime) : timeRange;

            if (options != null) {
                options.fromTime = timeRange.fromTimeUTC;
                options.toTime = timeRange.toTimeUTC;
            }

            reqObject['fromTimeUTC'] = timeRange.fromTime;
            reqObject['toTimeUTC'] = timeRange.toTime;
            reqObject['reRunTimeRange'] = timeRange.reRunTimeRange;
            return reqObject;
        };

        self.getLabelStepUnit = function (tg, tgUnit) {
            var baseUnit = null, secInterval = 0;
            if (tgUnit == 'secs') {
                secInterval = tg;
                if (tg < 60) {
                    tg = (-1 * tg);
                } else {
                    tg = Math.floor(parseInt(tg / 60));
                }
                baseUnit = 'minutes';
            } else if (tgUnit == 'mins') {
                secInterval = tg * 60;
                baseUnit = 'minutes';
            } else if (tgUnit == 'hrs') {
                secInterval = tg * 3600;
                baseUnit = 'hours';
            } else if (tgUnit == 'days') {
                secInterval = tg * 86400;
                baseUnit = 'days';
            }
            return {labelStep: (1 * tg), baseUnit: baseUnit, secInterval: secInterval};
        };

        self.getEngQueryStr = function (reqQueryObj) {
            var engQueryJSON = {
                select: reqQueryObj.select,
                from: reqQueryObj.table,
                where: reqQueryObj.where,
                filter: reqQueryObj.filters
            };
            if (reqQueryObj.toTimeUTC == "now") {
                engQueryJSON['from_time'] = reqQueryObj.fromTimeUTC;
                engQueryJSON['to_time'] = reqQueryObj.toTimeUTC;
            } else {
                engQueryJSON['from_time'] = moment(reqQueryObj.fromTimeUTC).format('MMM DD, YYYY hh:mm:ss A');
                engQueryJSON['to_time'] = moment(reqQueryObj.toTimeUTC).format('MMM DD, YYYY hh:mm:ss A');
            }
            return JSON.stringify(engQueryJSON);
        };
    };

    function getTimeRange(queryPrefix, reqObject, serverCurrentTime) {
        var timeRange = reqObject['timeRange'],
            tgUnits = reqObject['tgUnits'],
            tgValue = reqObject['tgValue'],
            fromDate, toDate, fromTimeUTC, toTimeUTC,
            fromTime, toTime, now, tgMicroSecs = 0;

        tgMicroSecs = getTGMicroSecs(tgValue, tgUnits);

        if (timeRange > 0) {
            if (serverCurrentTime) {
                toTimeUTC = serverCurrentTime;
            } else {
                now = new Date();
                now.setSeconds(0);
                now.setMilliseconds(0);
                toTimeUTC = now.getTime();
            }
            fromTimeUTC = toTimeUTC - (timeRange * 1000);
            if (queryPrefix !== 'fs' && queryPrefix !== 'stat') {
                toTime = "now";
                fromTime = "now-" + timeRange + "s";
            } else {
                toTime = toTimeUTC;
                fromTime = fromTimeUTC;
            }
        } else {
            // used for custom time range
            fromDate = reqObject['fromTime'];
            fromTimeUTC = new Date(fromDate).getTime();
            fromTime = fromTimeUTC;
            toDate = reqObject['toTime'];
            toTimeUTC = new Date(toDate).getTime();
            toTime = toTimeUTC;
        }

        if (queryPrefix == 'stat' && typeof fromTimeUTC !== 'undefined' && typeof tgMicroSecs !== 'undefined') {
            fromTimeUTC = updateFromTime(fromTimeUTC, tgMicroSecs);
        }
        return {fromTime: fromTime, toTime: toTime, fromTimeUTC: fromTimeUTC, toTimeUTC: toTimeUTC, reRunTimeRange: timeRange};
    };

    function getTGMicroSecs(tg, tgUnit) {
        if (tgUnit == 'secs') {
            return tg * 1000;
        } else if (tgUnit == 'mins') {
            return tg * 60 * 1000;
        } else if (tgUnit == 'hrs') {
            return tg * 3600 * 1000;
        } else if (tgUnit == 'days') {
            return tg * 86400 * 1000;
        }
    };

    return QEUtils;
});
