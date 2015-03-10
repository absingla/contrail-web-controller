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
            var self = this, viewConfig = this.attributes.viewConfig,
                projectFQN = viewConfig['projectFQN'],
                projectUUID = viewConfig['projectUUID'];

            var connectedGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONNECTED_GRAPH, projectFQN), {fqName: projectFQN}, ':connected', 'Project'),
                configGraph = ctwu.getNetworkingGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONFIG_GRAPH, projectFQN), {fqName: projectFQN}, ':config', 'Project');

            cowu.renderView4Config(self.$el, null, getProjectViewConfig(connectedGraph, configGraph, projectFQN, projectUUID), null, null);
        }
    });

    function getProjectViewConfig(connectedGraph, configGraph, projectFQN, projectUUID) {
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
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_PROJECT_VIEW_ID,
                                view: "ProjectTabView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectFQN: projectFQN, projectUUID: projectUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return ProjectView;

});