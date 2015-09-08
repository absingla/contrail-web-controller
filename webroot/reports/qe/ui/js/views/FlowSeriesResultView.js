/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'knockback'
], function (_, QueryResultView, Knockback) {

    var FlowSeriesResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;

            console.log(self.$el);
            console.log(this.model);
            console.log(self.getViewConfig());

            //self.renderView4Config(self.$el, null, self.getViewConfig());
        },

        getViewConfig: function () {}
    });

    return FlowSeriesResultView;
});