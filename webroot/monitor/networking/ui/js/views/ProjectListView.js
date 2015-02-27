/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ProjectListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig;

            var projectsRemoteConfig = {
                url: networkPopulateFns.getProjectsURL('default-domain'),
                type: 'GET'
            };

            // TODO: Handle multi-tenancy
            var projectsUCID = "default-domain:projects";

            cowu.renderView4Config(that.$el, null, getProjectListViewConfig(projectsRemoteConfig, projectsUCID));
        }
    });

    var getProjectListViewConfig = function (projectsRemoteConfig, ucid) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_GRID_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectGridConfig(projectsRemoteConfig, ucid)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectGridConfig = function (projectsRemoteConfig, ucid) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_PROJECTS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false
                },
                dataSource: {
                    remote: {
                        ajaxConfig: projectsRemoteConfig,
                        hlRemoteConfig: getHLazyRemoteConfig(),
                        dataParser: ctwp.projectDataParser,
                    },
                    cacheConfig: {
                        getDataFromCache: function (ucid) {
                            return mnPageLoader.mnView.listCache[ucid];
                        },
                        setData2Cache: function (ucid, dataObject) {
                            mnPageLoader.mnView.listCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
                        },
                        ucid: ucid
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectsColumns
            }
        };
        return gridElementConfig;
    };

    var getHLazyRemoteConfig = function () {
        return {
            remote: {
                ajaxConfig: {
                    url: ctwc.URL_NETWORKS_DETAILS,
                    type: 'POST',
                    data: JSON.stringify({
                        data: [{
                            "type": ctwc.TYPE_VIRTUAL_NETWORK,
                            "cfilt": ctwc.FILTERS_COLUMN_VN.join(',')
                        }]
                    })
                },
                dataParser: ctwp.networkDataParser
            },
            vlRemoteConfig: {
                completeCallback: function(contrailListModel, parentListModel) {
                    ctwp.projectNetworksDataParser(parentListModel, contrailListModel);
                }
            },
            lazyRemote: ctwgc.getVNDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK),
            cacheConfig: {
                getDataFromCache: function (ucid) {
                    return mnPageLoader.mnView.listCache[ucid];
                },
                setData2Cache: function (ucid, dataObject) {
                    mnPageLoader.mnView.listCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
                },
                ucid: "default-domain:virtual-networks"
            }
        };
    };

    return ProjectListView;
})
;
