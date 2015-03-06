/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FlowGridView = Backbone.View.extend({
        el: $(contentContainer),
        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig;

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
                advanceControls: getProtocolFilterActionConfig()
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
                        text: 'Loading..'
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

    function getProtocolFilterActionConfig (){
        var headerActionConfig = [
            {
                type: 'checked-multiselect',
                iconClass: 'icon-filter',
                placeholder: ctwl.TITLE_FILTER_BY_PROTOCOL,
                elementConfig: {
                    elementId: ctwl.PROJECT_FILTER_PROTOCOL_MULTISELECT_ID,
                    dataTextField: 'text',
                    dataValueField: 'id',
                    noneSelectedText: ctwl.TITLE_FILTER_PROTOCOL,
                    filterConfig: {
                        placeholder: ctwl.TITLE_FILTER_BY_PROTOCOL,
                    },
                    minWidth: 100,
                    height: 150,
                    emptyOptionText: 'No Protocol found',
                    data: [{
                        id: 'Protocol',
                        text: 'Protocol',
                        children: ctwc.PROTOCOL_MAP
                    }],
                    click: applyProtocolFilter,
                    optgrouptoggle: applyProtocolFilter,
                    control: false
                }
            }
        ];
        return headerActionConfig;
    };

    function applyProtocolFilter (event, ui) {
        var checkedRows = $('#' + ctwl.PROJECT_FILTER_PROTOCOL_MULTISELECT_ID).data('contrailCheckedMultiselect').getChecked(),
            flowsGrid = $('#' + ctwl.PROJECT_FLOW_GRID_ID).data('contrailGrid'),
            checkedProtocols = [];

        $.each(checkedRows, function (checkedRowKey, checkedRowValue) {
            checkedProtocols.push(parseInt($.parseJSON(unescape($(checkedRowValue).val())).value));
        });

        flowsGrid._dataView.setFilterArgs({checkedProtocols: checkedProtocols});
        flowsGrid._dataView.setFilter(function (item, args) {
            if (args['checkedProtocols'].length == 0) {
                return true;
            }
            if (args['checkedProtocols'].indexOf(item['protocol']) > -1)
                return true;
            return false;
        });
    };

    return FlowGridView;
});