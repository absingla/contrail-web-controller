/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailModel = require('contrail-model')
    var cowc = require('core-constants')
    var cowf = new (require('core-formatters'))

    return ContrailModel.extend({
        defaultConfig: {
            'color': '1f77b4',
            'yAxisLabel': '',
            'yAxisValue': '',
            'yAxisValues': [],
        },

        validations: {
            validation: {
                'yAxisValue': {
                    required: true,
                    msg: 'Y Axis Value is required',
                },
            },
        },

        toJSON: function () {
            var self = this
            return {
                'color': self.color(),
                'yAxisLabel': self.yAxisLabel(),
                'yAxisValue': self.yAxisValue(),
            }
        },

        getParserOptions: function () {
            var self = this
            return {
                parserName: 'timeSeriesParser',
                dataFields: [self.yAxisValue()],
            }
        },

        getContentViewOptions: function () {
            var self = this
            return {
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabel: self.yAxisLabel(),
                    colors: [self.color()],
                    forceY: [0, 10],
                    yFormatter: cowf.getFormattedValue.bind(cowf, cowc.QUERY_COLUMN_FORMATTER[self.yAxisValue()]),
                },
            }
        },
    })
})
