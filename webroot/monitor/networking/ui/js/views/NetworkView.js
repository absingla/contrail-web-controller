/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            cowu.renderView4Config(self.$el, null, getNetworkViewConfig(viewConfig));
        }

    });

    var getNetworkViewConfig = function(viewConfig){
        var networkFQN = viewConfig['networkFQN'];

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORKS_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                    },
                                    tabs: []
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return NetworkView;
});
