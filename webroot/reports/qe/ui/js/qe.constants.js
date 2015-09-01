/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEConstants = function () {
        this.TIMERANGE_DROPDOWN_VALUES = [
            {'id': 10, 'text': 'Last 10 Mins'},
            {'id': 30, 'text': 'Last 30 Mins'},
            {'id': 60, 'text': 'Last 1 Hr'},
            {'id': 360, 'text': 'Last 6 Hrs'},
            {'id': 720, 'text': 'Last 12 Hrs'},
            {'id': -1, 'text': 'Custom'}
        ];

        this.DIRECTION_DROPDOWN_VALUES = [
            {'id': 'ingress', 'text': 'INGRESS'},
            {'id': 'egress', 'text': 'EGRESS'}
        ];

        this.DEFAULT_QUERY_PREFIX = 'query';
    }
    return QEConstants;
});
