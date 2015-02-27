/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FlowListView = Backbone.View.extend({
        el: $(contentContainer),
        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig,
                networkFQN = viewConfig['fqName'];

            var flowRemoteConfig = {
                url:constructReqURL($.extend({}, getURLConfigForGrid(viewConfig), {protocol:['tcp','icmp','udp']})),
                type: 'GET'
            };
            cowu.renderView4Config(that.$el, null, getFlowListViewConfig(flowRemoteConfig));
        }
    });

    var getFlowListViewConfig = function (flowRemoteConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOW_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_FLOW_GRID_ID,
                                title: ctwl.TITLE_FLOWS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectFlowGridConfig(flowRemoteConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectFlowGridConfig = function (flowRemoteConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_FLOWS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                },
                customControls: ['<a class="toggleProtocol selected">ICMP</a>','<a class="toggleProtocol selected">UDP</a>','<a class="toggleProtocol selected">TCP</a>'],
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    actionCell: [
                        {
                            title: 'Start Packet Capture',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                startPacketCapture4Flow(ctwl.PROJECT_FLOW_GRID_ID, rowIndex, 'parseAnalyzerRuleParams4FlowByPort');
                            }
                        }
                    ]
                },
                dataSource: {
                    remote: {
                        ajaxConfig: flowRemoteConfig,
                        dataParser: function(response) {
                            return response.data
                        }
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading..',
                    },
                    empty: {
                        text: 'No Flows for the given criteria'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in fetching the details'
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectFlowsColumns
            }
        };
        return gridElementConfig;
    };

    var getURLConfigForGrid = function (viewConfig){
        var urlConfigObj = {
            'container'  : "#content-container",
            'context'    : "network",
            'type'       : "portRangeDetail",
            'startTime'  : viewConfig['startTime'],
            'endTime'    : viewConfig['endTime'],
            'fqName'     : viewConfig['fqName'],
            'port'       : viewConfig['port'],
            'portType'   : viewConfig['portType']
        }
        return urlConfigObj;
    };

    return FlowListView;
});