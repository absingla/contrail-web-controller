/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {

    var WidgetContentView = ContrailView.extend({
        render: function () {
            var self = this;

            self.renderView4Config(self.$(".panel-body"), null, self.getContentViewConfig());
        },

        getContentViewConfig: function () {
            var self = this;
            var viewConfig = $.extend(true, {}, self.model.get('contentViewConfig'));
            return viewConfig;
        }
    });

    return WidgetContentView;
});