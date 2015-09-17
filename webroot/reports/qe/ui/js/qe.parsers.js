/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEParsers = function () {
        var self = this;

        self.fsQueryDataParser = function(response) {
            var chartData = [],
                sumBytes = {key: "Sum(Bytes)", values: [], color: d3_category5[0]},
                chartData = [sumBytes];

            for (var key in response) {
                response = response[key];
                break;
            }

            for (var time in response) {
                var ts = parseInt(time);
                sumBytes.values.push({x: ts, y: response[time]['sum(bytes)']});
            }

            return chartData;
        };
    };

    return QEParsers;
});