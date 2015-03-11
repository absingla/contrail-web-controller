/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ProjectView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                graphTabsTemplate = contrail.getTemplate4Id(cowc.TMPL_2ROW_CONTENT_VIEW),
                viewConfig = this.attributes.viewConfig,
                projectFQN = viewConfig['projectFQN'],
                projectUUID = viewConfig['projectUUID'];

            this.$el.html(graphTabsTemplate);

            self.renderProjectGraph(projectFQN, projectUUID);
            self.renderProjectTabs(projectFQN, projectUUID);
        },

        renderProjectGraph: function(projectFQN, projectUUID) {
            var topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER),
                connectedGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONNECTED_GRAPH, projectFQN), {fqName: projectFQN}, ':connected', 'Project'),
                configGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONFIG_GRAPH, projectFQN), {fqName: projectFQN}, ':config', 'Project');

            cowu.renderView4Config(topContainerElement, null, getProjectGraphViewConfig(connectedGraph, configGraph, projectFQN, projectUUID), null, null, null);
        },

        renderProjectTabs: function(projectFQN, projectUUID) {
            var bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = ctwgrc.getTabsViewConfig('project', {
                    projectFQN: projectFQN,
                    projectUUID: projectUUID
                });

            cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
        }
    });

    function getProjectGraphViewConfig(connectedGraph, configGraph, projectFQN, projectUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    },

                ]
            }
        }
    };

    return ProjectView;

});