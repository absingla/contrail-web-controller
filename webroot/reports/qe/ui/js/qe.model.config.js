/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEDefaultConfig = function () {

        this.getQueryModel = function (tableName, queryPrefix) {
            return {
                "table_name": tableName,
                "query_prefix": queryPrefix,
                "time_range": 30,
                "custom_time_visible": false,
                "from_time": null,
                "to_time": null,
                "select": null,
                "select_fields": [],
                "time_granularity": null,
                "where": null,
                "direction": 'ingress',
                "filter": null,
                "select_data_object": getSelectDataObject(queryPrefix)
            };
        };

        this.getFlowSeriesQueryModel = function () {
            return {};
        };
    };

    function getSelectDataObject(queryPrefix) {
        var selectDataObject = {}

        selectDataObject.fields = ko.observableArray([]);
        selectDataObject.isEnableMap = {};

        selectDataObject.defaultSelectAllText = ko.observable("Select All");
        selectDataObject.checkedFields = ko.observableArray([]);

        selectDataObject.onSelect = function (data, event) {
            var fieldName = $(event.currentTarget).attr('name'),
                dataObject = data.select_data_object();
            isEnableMap = dataObject.isEnableMap;

            if (fieldName == 'T') {
                if (dataObject.checkedFields.indexOf('T') != -1) {
                    dataObject.checkedFields.remove('T=');
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            dataObject.checkedFields.remove(key);
                            isEnableMap[key](false);
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            isEnableMap[key](true);
                        }
                    }
                }
            } else if (fieldName == 'T=') {
                if (dataObject.checkedFields.indexOf('T=') != -1) {
                    dataObject.checkedFields.remove('T');
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            isEnableMap[key](true);
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            dataObject.checkedFields.remove(key);
                            isEnableMap[key](false);
                        }
                    }
                }
            }
            return true;
        };

        selectDataObject.onSelectAll = function (data, event) {
            var dataObject = data.select_data_object(),
                defaultSelectAllText = dataObject.defaultSelectAllText(),
                isEnableMap = dataObject.isEnableMap,
                checkedFields = selectDataObject.checkedFields;

            if (defaultSelectAllText == 'Select All') {
                dataObject.defaultSelectAllText('Clear All');
                for (key in isEnableMap) {
                    if (key == "T=" || key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                        if (checkedFields.indexOf(key) != -1) {
                            checkedFields.remove(key);
                        }

                        if(key != "T=") {
                            isEnableMap[key](false);
                        }
                    } else {
                        isEnableMap[key](true);
                        if (checkedFields.indexOf(key) == -1) {
                            checkedFields.push(key);
                        }
                    }
                }
            } else {
                dataObject.defaultSelectAllText('Select All');
                for (key in isEnableMap) {
                    isEnableMap[key](true);
                    checkedFields.remove(key);
                }
            }
        };

        return selectDataObject;
    }

    return QEDefaultConfig;
});