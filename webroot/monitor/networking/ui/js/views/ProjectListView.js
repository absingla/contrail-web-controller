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
            var ucid = "default-domain:projects";

            cowu.renderView4Config(that.$el, null, getProjectListViewConfig(projectsRemoteConfig, ucid));
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
                        dataParser: projectDataParser
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
                successCallback: function (response, contrailListModel) {
                    var statDataList = tenantNetworkMonitorUtils.statsOracleParseFn(response[0], type),
                        dataItems = contrailListModel.getItems(),
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
                    contrailListModel.updateData(dataItems);
                }
            }
        ];
    }

    var projectDataParser = function (response) {
        var vnList = [], projectObjList = [], projectMap = {}, projectList = ifNull(response['data'], []);
        var inBytes = 0, outBytes = 0;
        var projNameList = [];

        var defProjObj = { intfCnt: 0, vnCnt: 0, throughput: 0, inThroughput: 0, outThroughput: 0, inBytes: 0, outBytes: 0 };

        $.each(vnList, function (idx, d) {
            inBytes += d['inBytes'];
            outBytes += d['outBytes'];
            if (!(d['project'] in projectMap)) {
                projectMap[d['project']] = $.extend({}, defProjObj);
            }
            projectMap[d['project']]['outBytes'] += d['outBytes'];
            projectMap[d['project']]['inBytes'] += d['inBytes'];
            projectMap[d['project']]['inThroughput'] += d['inThroughput'];
            projectMap[d['project']]['outThroughput'] += d['outThroughput'];
            projectMap[d['project']]['intfCnt'] += d['intfCnt'];
            projectMap[d['project']]['throughput'] += d['throughput'];
            projectMap[d['project']]['vnCnt']++;
        });

        $.each(projNameList, function (idx, currProjName) {
            if (projectMap[currProjName] == null) {
                projectMap[currProjName] = $.extend({}, defProjObj);
            }
        });

        $.each(projectMap, function (key, project) {
            var cfgIdx = $.inArray(key, projNameList);
            if (cfgIdx > -1) {
                $.extend(project, {
                    type: 'project',
                    cgrid: key,
                    name: key,
                    uuid: projectList[cfgIdx]['uuid'],
                    size: project['throughput'] + 1,
                    x: project['intfCnt'],
                    y: project['vnCnt']
                });
                projectObjList.push(project);
            }
        });

        //return {projectsData: projectObjList, aggData: {inBytes: inBytes, outBytes: outBytes}};
        return projectObjList;
    };

    return ProjectListView;
})
;
