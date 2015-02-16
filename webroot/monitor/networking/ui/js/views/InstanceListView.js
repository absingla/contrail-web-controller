/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InstanceListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig,
                projectUUID = viewConfig['projectUUID'];

            var instanceRemoteConfig = {
                url: projectUUID != null ? ctwc.get(ctwc.URL_PROJECT_INSTANCES, projectUUID) : ctwc.URL_INSTANCES,
                type: 'POST',
                data: JSON.stringify({
                    data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
                })
            };

            cowu.renderView4Config(that.$el, null, getProjectsViewConfig(instanceRemoteConfig));

        }
    });

    var getProjectsViewConfig = function (instanceRemoteConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECTS_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCE_GRID_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectInstancesConfig(instanceRemoteConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectInstancesConfig = function (instanceRemoteConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_INSTANCES_SUMMARY
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
                        ajaxConfig: instanceRemoteConfig,
                        dataParser: tenantNetworkMonitorUtils.projectInstanceParseFn
                    },
                    lazyRemote: getLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE)
                }
            },
            columnHeader: {
                columns: ctwgc.projectInstancesColumns
            }
        };
        return gridElementConfig;
    };

    var getLazyRemoteConfig = function (type) {
        return [
            {
                getAjaxConfig: function (responseJSON) {
                    var uuids, lazyAjaxConfig;

                    uuids = $.map(responseJSON, function (item) {
                        return item['name'];
                    });

                    lazyAjaxConfig = {
                        url: ctwc.URL_VM_VN_STATS,
                        type: 'POST',
                        data: JSON.stringify({
                            data: {
                                type: type,
                                uuids: uuids.join(','),
                                minSince: 60,
                                useServerTime: true
                            }
                        })
                    }
                    return lazyAjaxConfig;
                },
                successCallback: function (response, contrailDataView) {
                    var statDataList = tenantNetworkMonitorUtils.statsOracleParseFn(response[0], type),
                        dataItems = contrailDataView.getItems(),
                        statData;

                    for (var j = 0; j < statDataList.length; j++) {
                        statData = statDataList[j];
                        for (var i = 0; i < dataItems.length; i++) {
                            var dataItem = dataItems[i];
                            if (statData['name'] == dataItem['name']) {
                                dataItem['inBytes'] = ifNull(statData['inBytes'], 0);
                                dataItem['outBytes'] = ifNull(statData['outBytes'], 0);
                                break;
                            }
                        }
                    }
                    contrailDataView.updateData(dataItems);
                }
            }
        ];
    }

    return InstanceListView;
})
;
