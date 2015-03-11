/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InstanceView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                graphTabsTemplate = contrail.getTemplate4Id(cowc.TMPL_2ROW_CONTENT_VIEW),
                viewConfig = this.attributes.viewConfig,
                networkFQN = viewConfig['networkFQN'],
                networkUUID = viewConfig['networkUUID'],
                instanceUUID = viewConfig['instanceUUID'];

            this.$el.html(graphTabsTemplate);

            self.renderInstanceGraph(networkFQN, instanceUUID);
            self.renderInstanceTabs(networkFQN, instanceUUID);
        },

        renderInstanceGraph: function(networkFQN, instanceUUID) {
            var topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER),
                connectedGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), {fqName: networkFQN, instanceUUID: instanceUUID}, ':connected', 'Instance'),
                configGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), {fqName: networkFQN, instanceUUID: instanceUUID}, ':config', 'Instance');

            cowu.renderView4Config(topContainerElement, null, getInstanceGraphViewConfig(connectedGraph, configGraph, networkFQN, instanceUUID), null, null, null);
        },

        renderInstanceTabs: function(networkFQN, instanceUUID) {
            var bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = ctwgrc.getTabsViewConfig('virtual-machine', {
                    networkFQN: networkFQN,
                    instanceUUID: instanceUUID
                });

            cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
        }
    });

    function getInstanceGraphViewConfig(connectedGraph, configGraph, networkFQN, instanceUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INSTANCE_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    connectedGraph: connectedGraph, configGraph: configGraph,
                                    networkFQN: networkFQN, instanceUUID: instanceUUID
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return InstanceView;

});