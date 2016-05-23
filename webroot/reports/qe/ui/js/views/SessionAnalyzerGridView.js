/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {

    var SessionAnalyzerGridView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                resultModelKey = contrail.handleIfNull(viewConfig.resultModelKey, null),
                resultGridId = viewConfig.resultGridId,
                gridOptions = viewConfig.gridOptions,
                resultDataMap = viewConfig.resultDataMap,
                formModelAttrs;

            if (resultModelKey !== null) {
                formModelAttrs = resultDataMap[resultModelKey].queryRequestPostData.formModelAttrs;
            }

            if (resultModelKey == cowc.SESSION_ANALYZER_KEY) { // Render the summary grid

                gridOptions.gridColumns = getSessionAnalyzerSummaryGridColumnConfig(modelMap,
                    formModelAttrs, gridOptions.summaryRowOnClick);

                self.renderView4Config(self.$el, self.model.primaryListModel,
                    self.getSessionAnalyzerGridViewConfig(resultGridId, null, gridOptions), null, null, modelMap, null);

            } else { // Get the respective model and render the child grid
                var gridDataModel = new ContrailListModel({data: []});
                _.each(self.model.childModelObjs, function(modelObj) {
                    if (modelObj.modelConfig.id == resultModelKey) {
                        gridDataModel = modelObj.model;
                    }
                });
                self.renderView4Config(self.$el, gridDataModel,
                    self.getSessionAnalyzerGridViewConfig(resultGridId, formModelAttrs, gridOptions),
                    null, null, modelMap, null);
            }
        },

        getSessionAnalyzerGridViewConfig: function(gridId, formModelAttrs, gridOptions) {
            return {
                elementId: gridId,
                title: gridOptions.titleText,
                view: "GridView",
                viewConfig: {
                    elementConfig: getSessionAnalyzerGridConfig(formModelAttrs, gridOptions),
                    modelConfig: {
                        data: []
                    }
                }
            };
        }

    });
    
    function getSessionAnalyzerGridConfig(formModelAttrs, gridOptions) {
        var gridColumns = (contrail.checkIfExist(gridOptions.gridColumns)) ? gridOptions.gridColumns : [];

        if (contrail.checkIfExist(formModelAttrs)) {
            var selectArray = formModelAttrs.select.replace(/ /g, "").split(","),
                addGridColumns = qewgc.getColumnDisplay4Grid(formModelAttrs.table_name, formModelAttrs.table_type, selectArray);
            gridColumns = gridColumns.concat(addGridColumns);
        }

        return {
            header: {
                title: {
                    text: gridOptions.titleText
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true,
                    columnPickable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: contrail.checkIfExist(gridOptions.fixedRowHeight) ? gridOptions.fixedRowHeight : 30,
                    lazyLoading: true,
                    forceFitColumns: false,
                    defaultDataStatusMessage: false
                },
                dataSource: {},
                statusMessages: {}
            },
            columnHeader: {
                columns: gridColumns
            },
            footer: {
                pager: contrail.handleIfNull(gridOptions.pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 500] } })
            }
        };
    };

    function getSessionAnalyzerSummaryGridColumnConfig(modelMap, formModelAttrs, summaryRowOnClickFn) {
        return [
            {
                id: 'fc-badge', field:"", name:"", resizable: false, sortable: false, width: 30, minWidth: 30, searchable: false, exportConfig: { allow: false },
                formatter: function(r, c, v, cd, dc){
                    return '<span class="label-icon-badge label-icon-badge-' + dc.key +
                        ' icon-badge-color-' + r + ' " data-color_key="' + r + '"><i class="icon-sign-blank"></i></span>';
                },
                events: {
                    onClick: function(e, dc) {
                        summaryRowOnClickFn(e, dc, modelMap, formModelAttrs);
                    }
                }
            },
            {id:"name",field:"name", width:150, name:"Type", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.name);}},
            //{id:"start_time", field:"start_time", width:210, name:"Start Time", formatter: function(r, c, v, cd, dc){ return cowu.formatMicroDate(dc.start_time);}, filterable:false, groupable:false},
            //{id:"end_time", field:"end_time", width:210, name:"End Time", formatter: function(r, c, v, cd, dc){ return cowu.formatMicroDate(dc.end_time);}, filterable:false, groupable:false},
            {id:"vrouter",field:"vrouter", width:100, name:"Virtual Router", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.vrouter);}},
            {id:"sourcevn",field:"sourcevn", width:240, name:"Source VN", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.sourcevn);}},
            {id:"destvn", field:"destvn", width:240, name:"Destination VN", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.destvn);}},
            {id:"sourceip", field:"sourceip", width:100, name:"Source IP", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.sourceip);}},
            {id:"destip", field:"destip", width:120, name:"Destination IP", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.destip);}},
            {id:"sport", field:"sport", width:100, name:"Source Port", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.sport);}},
            {id:"dport", field:"dport", width:130, name:"Destination Port", groupable:false, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(dc.dport);}},
            {id:"direction_ing", field:"direction_ing", width:100, name:"Direction", groupable:true, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid((dc.direction_ing == 1) ? "Ingress" : "Egress");}},
            {id:"protocol", field:"protocol", width:100, name:"Protocol", groupable:true, formatter: function(r, c, v, cd, dc){ return cowu.handleNull4Grid(getProtocolName(dc.protocol));}},
        ];
    };

    function getSessionAnalyzerGridConfig(saSummaryRemoteConfig, queryFormAttributes, gridOptions) {
        var selectArray = queryFormAttributes.select.replace(/ /g, "").split(","),
            saSummaryGridColumns = qewgc.getColumnDisplay4Grid(queryFormAttributes.table_name, queryFormAttributes.table_type, selectArray);

        if (contrail.checkIfExist(gridOptions.gridColumns)) {
            saSummaryGridColumns = gridOptions.gridColumns.concat(saSummaryGridColumns)
        }

        return qewgc.getQueryGridConfig(saSummaryRemoteConfig, saSummaryGridColumns, gridOptions);
    };

    return SessionAnalyzerGridView;
});