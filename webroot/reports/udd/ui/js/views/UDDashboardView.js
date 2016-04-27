/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UDDashboardView = ContrailView.extend({
        el: $(contentContainer),

        renderNetworkingUDD: function (viewConfig) {
            //TODO
        }
    });

    return UDDashboardView;
});