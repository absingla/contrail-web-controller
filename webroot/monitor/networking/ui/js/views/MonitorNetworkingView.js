/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var MonitorNetworkingView = Backbone.View.extend({
        el: $(contentContainer),

        renderProject: function (viewConfig) {
            var self = this, domain = cowc.DEFAULT_DOMAIN,
                projectFQN = (contrail.checkIfExist(viewConfig.hashParams.fqName)) ? viewConfig.hashParams.fqName : null,
                projectUUID = (contrail.checkIfExist(viewConfig.hashParams.uuid)) ? viewConfig.hashParams.uuid : null;


            renderProjectDropdown(domain, projectFQN, projectUUID, function (projectFQN, projectUUID) {
                _ignoreOnHashChange = true;
                layoutHandler.setURLHashObj({
                    p: 'mon_net_projects-beta',
                    q: {
                        fqName: projectFQN,
                        uuid: projectUUID
                    }
                });
                self.renderProjectCB(projectFQN, projectUUID);
            });
        },

        renderProjectCB: function (projectFQN, projectUUID) {
            var graphConfig = {
                url: ctwc.get(ctwc.URL_PROJECT_GRAPH, projectFQN),
                fqName: projectFQN,
                focusedElement: 'Project'
            };

            cowu.renderView4Config(this.$el, null, getMonitorProjectConfig(graphConfig, projectFQN, projectUUID));
        },

        renderNetworkList: function (projectFQN) {
            cowu.renderView4Config(this.$el, null, getNetworksConfig(projectFQN));
        },

        renderInstanceList: function (projectUUID) {
            cowu.renderView4Config(this.$el, null, getInstancesConfig(projectUUID));
        }

    });

    var renderProjectDropdown = function (domain, projectFQN, projectUUID, changeCB) {
        var that = this;

        $.ajax({
            url: networkPopulateFns.getProjectsURL(domain),
            async: false
        }).done(function (projectList) {
            if (projectList.projects.length > 0) {

                pushBreadcrumbDropdown('projectDropdown');

                if (projectFQN == null) {
                    projectFQN = projectList.projects[0].fq_name.join(':');
                    projectUUID = projectList.projects[0].uuid
                }

                var projects = $.map(projectList.projects, function (n, i) {
                    if (projectUUID == null && projectFQN == n.fq_name.join(':')) {
                        projectUUID = n.uuid
                    }

                    return {
                        name: n.fq_name.join(':'),
                        value: n.uuid
                    };
                });

                var projectDropdown = $('#projectDropdown').contrailDropdown({
                    dataTextField: "name",
                    dataValueField: "value",
                    data: projects,
                    change: function (e) {
                        var projectFQN = $('#projectDropdown').data('contrailDropdown').text(),
                            projectUUID = $('#projectDropdown').data('contrailDropdown').value();

                        changeCB(projectFQN, projectUUID);
                    }
                }).data('contrailDropdown');

                projectDropdown.text(projectFQN);
                changeCB(projectFQN, projectUUID);

            } else {
                that.$el.html(ctwm.NO_PROJECT_FOUND);
            }
        }).fail(function (errObj, status, errorText) {
            that.$el.html("Error");
        });

    }

    var getMonitorProjectConfig = function (graphConfig, projectFQN, projectUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECTS_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {elementConfig: graphConfig}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_DETAILS_ID,
                                view: "ProjectView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {graphConfig: graphConfig, projectFQN: projectFQN, projectUUID: projectUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getNetworksConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORKS_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_NETWORKS_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "NetworkListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectFQN: null}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getInstancesConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCES_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCES_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "InstanceListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectUUID: null}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return MonitorNetworkingView;
});