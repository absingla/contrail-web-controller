/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var IntrospectJSGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                introspectNode = viewConfig.node,
                introspectPort = viewConfig.port,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                jsonData = viewConfig.jsonData;

            self.renderView4Config(self.$el, null,
                getIntrospectJSGridViewConfig(jsonData, introspectNode, introspectPort), null, null, modelMap, null);

        }
    });

    function getIntrospectJSGridViewConfig(jsonData, introspectNode, introspectPort) {
        var sandeshData = parseSandeshData(jsonData),
            gridViewConfigs = [];

        _.each(sandeshData, function(value, key){
            gridViewConfigs.push({
                columns: [
                    {
                        elementId: 'introspect-result-js-grid-' + introspectNode  + '-' + introspectPort + '-' + key,
                        view: "GridView",
                        viewConfig: {
                            elementConfig: getIntrospectJSGridConfig(value)
                        }
                    }
                ]
            })
        });

        return {
            elementId: 'introspect-js-grids',
            view: "SectionView",
            viewConfig: {
                rows: gridViewConfigs
            }
        };
    }

    function getIntrospectJSGridConfig(value) {

        var dataObj = parseDataObject(value.data),
            gridConfig = {'data': [], 'columns': [], 'title': value['title']};

        if (dataObj != null && dataObj != undefined) {
            gridConfig['columns'] = createGridColumns(dataObj);
            gridConfig['data'] = createGridData(dataObj);
        }

        return {
            header: {
                title: {text: gridConfig['title']},
                defaultControls: {
                    collapseable: false,
                    columnPickable: true
                }
            },
            columnHeader: {columns: gridConfig['columns']},
            body: {
                options: {
                    forceFitColumns: false,
                    checkboxSelectable: false
                },
                dataSource: {data: gridConfig['data']}
            }
        };
    }

    function getJsonTitle(json) {
        var jsonKeys = _.keys(json);

        return jsonKeys[0]
    }

    function createGridColumns(dataObj) {
        var dataLength = dataObj.length,
            dataRecord = {}, gridColumns = [];

        if (!_.isArray(dataObj)) {
            dataRecord = dataObj;
        } else if (dataLength > 1) {
            dataRecord = dataObj[0];
        }

        _.each(dataRecord, function (value, key) {
            if (key.charAt(0) !== '_' && ['more', 'next_batch'].indexOf(key) == -1 ) {
                var gridColumn = {
                    id: key, field: key,
                    name: getLabel4Key(key),
                    width: getColoumnWidth(value, key),
                    sortable: true
                };

                if (contrail.checkIfExist(value['_link'])) {
                    gridColumn['formatter'] = function (r, c, v, cd, dc) {
                        return '<a class="introspect-link" data-link="' + value['_link'] + '" ' +
                            'x="' + dc[key] + '">' + dc[key] + '</a>';
                    };
                }

                if (_.contains(['list', 'struct', 'sandesh'], value['_type'])) {
                    gridColumn['formatter'] = {
                        format: 'json2html', options: {jsonValuePath: key, htmlValuePath: key + 'HTML', expandLevel: 0}
                    };
                }

                gridColumns.push(gridColumn);
            }
        });

        return gridColumns;
    };

    function getColoumnWidth(value, key) {
        var type = value['_type'],
            keyLength = key.length,
            headerPixelFactor = 10, strPixelFactor = 15,
            columnWidth = keyLength * headerPixelFactor,
            maxWidth = 360, minWidth = 80, textValue, textValueLength;

        columnWidth = columnWidth < minWidth ? minWidth : columnWidth;

        if((type == 'string' || type == 'u32' || type == 'u64') && contrail.checkIfExist(value['__text'])) {
            textValue = value['__text'];
            textValueLength = textValue.length * strPixelFactor;
            columnWidth = (textValueLength > maxWidth) ? maxWidth : ((textValueLength < columnWidth) ? columnWidth : textValueLength);

        } else if (_.contains(['list', 'struct', 'sandesh'], type)) {
            columnWidth = 250;
        }

        return columnWidth;
    }

    function createGridData(dataObj) {
        var dataLength = dataObj.length,
            gridData = [];

        if (!_.isArray(dataObj)) {
            gridData.push(cleanDataObj(dataObj));
        } else {
            _.each(dataObj, function (value, key) {
                gridData.push(cleanDataObj(value));
            });
        }

        return gridData;
    };

    function cleanDataObj(data) {
        var dataObj = $.extend(true, {}, data);
        _.each(dataObj, function (value, key) {
            if (contrail.checkIfExist(value['__text'])) {
                dataObj[key] = value['__text'];

            } else if (value['_type'] == 'string') {
                dataObj[key] = '-'

            } else if (value['_type'] == 'list') {
                if (parseInt(value['list']['_size']) == 0) {
                    dataObj[key] = '-'
                } else {
                    delete value['list']['_size'];
                    delete value['list']['_type'];
                    dataObj[key] = cleanDataObj(value['list']);
                }

            } else if (value['_type'] == 'struct') {
                delete value['_type'];
                delete value['_identifier'];
                dataObj[key] = cleanDataObj(value);

            } else if (_.isArray(value)) {
                dataObj[key] = cleanDataObj(value);

            } else if (_.isObject(value)) {
                dataObj[key] = cleanDataObj(value);
            }
        });

        return dataObj
    }

    function getLabel4Key(key) {
        var newKey = replaceAll("_", " ", key),
            label = capitalizeSentence(newKey);

        return label;
    }

    function replaceAll(find, replace, strValue) {
        return strValue.replace(new RegExp(find, 'g'), replace);
    };

    function capitalizeSentence(sentence) {
        var word = sentence.split(" ");
        for (var i = 0; i < word.length; i++) {
            word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
        }
        return word.join(" ");
    };

    function parseSandeshData(jsonObject, title) {
        var keys = _.keys(jsonObject),
            sandeshKey = null, sandeshObj = {}, sandeshData = [],
            sandeshTypes = ['list', 'struct'],
            sandeshTypesLength = 0;

        sandeshKey = keys[0];
        sandeshObj = jsonObject[sandeshKey];

        if (sandeshObj['_type'] === 'sandesh') {
            sandeshObj = _.omit(sandeshObj, ['_type', 'more', 'next_batch']);
            sandeshTypesLength = getLengthOfTypesInSandeshObj(sandeshObj, sandeshTypes);

            if (sandeshTypesLength < sandeshData.length) {
                sandeshData.push({
                    title: (contrail.checkIfExist(title) ? title + ' | ' : '') + sandeshKey,
                    data: sandeshObj
                });
            }

            if (sandeshTypesLength > 0) {
                _.each(sandeshObj, function (value, key) {
                    if(_.contains(sandeshTypes, value['_type'])) {
                        sandeshData.push({
                            title: (contrail.checkIfExist(title) ? title + ' | ' : '') + sandeshKey + ' | ' + key,
                            data: value
                        });
                    }
                });
            }

        } else if (sandeshObj['_type'] === 'slist') {
            sandeshObj = _.omit(sandeshObj, ['_type', 'more', 'next_batch']);
            _.each(sandeshObj, function(value, key) {
                var sandeshListObj = {};
                sandeshListObj[key] = value;
                sandeshData = sandeshData.concat(parseSandeshData(sandeshListObj, sandeshKey));
            });
        }

        return sandeshData
    }

    function getLengthOfTypesInSandeshObj(sandeshObj, types) {
        var typesLength = 0;
        _.each(sandeshObj, function(value, key) {
            if(_.contains(types, value['_type'])) {
                typesLength += 1;
            }
        });

        return typesLength;
    }

    function parseDataObject(jsonObject) {

        while (getTypeFromDataObject(jsonObject) === 'list') {
            jsonObject = parseListDataObj(jsonObject);
        }

        while (getTypeFromDataObject(jsonObject) === 'struct') {
            jsonObject = parseDataObjByType(jsonObject, 'struct');
        }

        for (var key in jsonObject) {
            if (_.isObject(jsonObject[key]) && !contrail.checkIfExist(jsonObject[key]['_type'])) {
                jsonObject = jsonObject[key];
                break;
            }
        }

        return jsonObject;
    };

    function parseDataObjByType(jsonObject, type) {
        for (var key in jsonObject) {
            if (_.isObject(jsonObject[key]) && jsonObject[key]['_type'] === type) {
                jsonObject = jsonObject[key];
                break;
            }
        }

        return jsonObject;
    }

    function parseListDataObj(jsonObject) {
        var keys = _.keys(jsonObject);

        if (jsonObject[keys[0]]['list']['_size'] > 0) {
            jsonObject = jsonObject[keys[0]]['list'];
        } else {
            jsonObject = {};
        }

        return jsonObject;
    }


    function getTypeFromDataObject(jsonObject) {
        var keys = _.keys(jsonObject);
        if (keys.length > 0) {
            return contrail.checkIfExist(jsonObject[keys[0]]['_type']) ? jsonObject[keys[0]]['_type'] : false;
        } else {
            return false;
        }
    }

    return IntrospectJSGridView;
});