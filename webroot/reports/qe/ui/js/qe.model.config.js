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
                "query_prefix": contrail.checkIfExist(queryPrefix) ? queryPrefix : qewc.DEFAULT_QUERY_PREFIX,
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
    };

    function getSelectDataObject(queryPrefix) {
        var selectDataObject = {}

        selectDataObject.fields = ko.observableArray([]);
        selectDataObject.enable_map = {};

        selectDataObject.select_all_text = ko.observable("Select All");
        selectDataObject.checked_fields = ko.observableArray([]);

        selectDataObject.on_select = function (data, event) {
            var fieldName = $(event.currentTarget).attr('name'),
                dataObject = data.select_data_object(),
                isEnableMap = dataObject.enable_map,
                key;

            if (fieldName == 'T') {
                if (dataObject.checked_fields.indexOf('T') != -1) {
                    dataObject.checked_fields.remove('T=');
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            dataObject.checked_fields.remove(key);
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
                if (dataObject.checked_fields.indexOf('T=') != -1) {
                    dataObject.checked_fields.remove('T');
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            isEnableMap[key](true);
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        if (key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                            dataObject.checked_fields.remove(key);
                            isEnableMap[key](false);
                        }
                    }
                }
            }
            return true;
        };

        selectDataObject.on_select_all = function (data, event) {
            var dataObject = data.select_data_object(),
                selectAllText = dataObject.select_all_text(),
                isEnableMap = dataObject.enable_map,
                checkedFields = selectDataObject.checked_fields,
                key;

            if (selectAllText == 'Select All') {
                dataObject.select_all_text('Clear All');
                for (key in isEnableMap) {
                    if (key == "T=" || key.indexOf('sum(') != -1 || key.indexOf('count(') != -1 || key.indexOf('min(') != -1 || key.indexOf('max(') != -1) {
                        if (checkedFields.indexOf(key) != -1) {
                            checkedFields.remove(key);
                        }

                        if (key != "T=") {
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
                dataObject.select_all_text('Select All');
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