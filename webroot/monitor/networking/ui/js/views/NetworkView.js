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
            var self = this, viewConfig = this.attributes.viewConfig,
                networkFQN = viewConfig['networkFQN'],
                networkUUID = viewConfig['networkUUID'];

            var connectedGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), {fqName: networkFQN}, ':connected', 'Network'),
                configGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), {fqName: networkFQN}, ':config', 'Network');

            cowu.renderView4Config(self.$el, null, getNetworkViewConfig(connectedGraph, configGraph, networkFQN, networkUUID), null, null);
        }
    });

    function getNetworkViewConfig(connectedGraph, configGraph, networkFQN, networkUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_NETWORK_VIEW_ID,
                                view: "NetworkTabView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {networkFQN: networkFQN, networkUUID: networkUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return NetworkView;

});