/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

function generateTS(rowsCount) {
    var timeStamp = 1468458000000000;
    var tmpArray = [];
    for (var i = 0; i < rowsCount; i++) {
        timeStamp = timeStamp + Math.floor((Math.random() * 999));
        var skeletonData = {
            "T": timeStamp,
            "destip": "10.1.1.3",
            "destvn": "default-domain:admin:frontend",
            "direction_ing": 1,
            "dport": 34911,
            "flow_class_id": 2030614318697347000,
            "protocol": 6,
            "sourceip": "10.2.1.3",
            "sourcevn": "default-domain:admin:backend",
            "sport": 9100,
            "sum(bytes)": 16618,
            "sum(packets)": 49,
            "vrouter": "a3s27"
        };
        tmpArray.push(skeletonData);
    }
    return tmpArray;
};

var mockData = {
    postValues: {
        "data": [
            {
                "fields.value": "a3s27",
                "name": "FlowSeriesTable:vrouter"
            },
            {
                "fields.value": "a3s28",
                "name": "FlowSeriesTable:vrouter"
            },
            {
                "fields.value": "default-domain:admin:frontend",
                "name": "FlowSeriesTable:destvn"
            },
            {
                "fields.value": "default-domain:admin:backend",
                "name": "FlowSeriesTable:destvn"
            },
            {
                "fields.value": "default-domain:admin:backend",
                "name": "FlowSeriesTable:sourcevn"
            },
            {
                "fields.value": "default-domain:admin:frontend",
                "name": "FlowSeriesTable:sourcevn"
            }
        ],
        "total": 6,
        "queryJSON": {
            "start_time": 1468522236000000,
            "end_time": 1468522836000000,
            "select_fields": [
                "name",
                "fields.value"
            ],
            "table": "StatTable.FieldNames.fields",
            "where": [
                [
                    {
                        "name": "name",
                        "value": "FlowSeriesTable",
                        "op": 7
                    }
                ]
            ]
        },
        "chunk": 1,
        "chunkSize": 6,
        "serverSideChunking": true
    },

    flowSchemaTable: {
        "type": "FLOW",
        "columns": [
            {
                "datatype": "string",
                "index": true,
                "name": "vrouter",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "string",
                "index": true,
                "name": "sourcevn",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "ipaddr",
                "index": true,
                "name": "sourceip",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "string",
                "index": true,
                "name": "destvn",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "ipaddr",
                "index": true,
                "name": "destip",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": true,
                "name": "protocol",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": true,
                "name": "sport",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": true,
                "name": "dport",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": true,
                "name": "direction_ing",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "flow_class_id",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "T",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "T=",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "packets",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "bytes",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "sum(packets)",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "sum(bytes)",
                "select": null,
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "flow_count",
                "select": null,
                "suffixes": null
            }
        ]
    },

    serverInfo: {
        "orchestrationModel": [
            "openstack"
        ],
        "serverUTCTime": 1468528899000,
        "hostName": "pjagadeesh-mbp",
        "role": [
            "member",
            "superAdmin"
        ],
        "featurePkg": {
            "webController": true,
            "serverManager": true,
            "webStorage": true
        },
        "uiConfig": {
            "nodemanager": {
                "installed": true
            },
            "dropdown_value_separator": ";"
        },
        "isAuthenticated": true,
        "discoveryEnabled": false,
        "configServer": {
            "port": "8082",
            "ip": "10.84.11.2"
        },
        "optFeatureList": {
            "mon_infra_underlay": false,
            "mon_infra_mx": false
        },
        "featurePkgsInfo": {
            "webController": {
                "path": "/Users/pjagadeesh/testAuto/contrail-web-controller",
                "enable": true
            },
            "serverManager": {
                "path": "/Users/pjagadeesh/testAuto/contrail-web-server-manager",
                "enable": true
            },
            "webStorage": {
                "path": "/Users/pjagadeesh/testAuto/contrail-web-storage",
                "enable": true
            }
        },
        "sessionTimeout": 3600000,
        "_csrf": "3yKZE/9ITYaiQoZOGUt/aPhh",
        "serviceEndPointFromConfig": true,
        "regionList": [],
        "isRegionListFromConfig": false,
        "configRegionList": {
            "RegionOne": "http://127.0.0.1:5000/v2.0"
        },
        "currentRegionName": null,
        "loggedInOrchestrationMode": "openstack",
        "insecureAccess": false
    },

    getFlowViewQueryMockData: {
        "data": generateTS(5),
        "total": 5,
        "queryJSON": {
            "table": "FlowSeriesTable",
            "start_time": 1468458000000000,
            "end_time": 1468458600000000,
            "select_fields": [
                "flow_class_id",
                "direction_ing",
                "T",
                "vrouter",
                "sourcevn",
                "sourceip",
                "destvn",
                "destip",
                "protocol",
                "sport",
                "dport",
                "T=60",
                "sum(packets)",
                "sum(bytes)"
            ],
            "filter": [
                []
            ],
            "sort_fields": [
                "T"
            ],
            "sort": "asc",
            "limit": 150000,
            "dir": 1
        },
        "chunk": 1,
        "chunkSize": 1980,
        "serverSideChunking": true
    },

    viewQueryQueueMockData: [
        {
            "startTime": 1467997933519,
            "queryJSON": {
                "table": "FlowSeriesTable",
                "start_time": 1467997320000000,
                "end_time": 1467997920000000,
                "select_fields": [
                    "flow_class_id",
                    "direction_ing",
                    "T",
                    "vrouter",
                    "sourcevn",
                    "sourceip",
                    "destvn",
                    "destip",
                    "protocol",
                    "sport",
                    "dport",
                    "T=60",
                    "sum(packets)",
                    "sum(bytes)"
                ],
                "filter": [
                    []
                ],
                "sort_fields": [
                    "T"
                ],
                "sort": "asc",
                "limit": 150000,
                "dir": 1
            },
            "progress": 100,
            "status": "completed",
            "tableName": "FlowSeriesTable",
            "count": 120,
            "timeTaken": 3.205,
            "errorMessage": "",
            "queryReqObj": {
                "chunk": 1,
                "autoSort": true,
                "chunkSize": 10000,
                "async": true,
                "formModelAttrs": {
                    "table_name": "FlowSeriesTable",
                    "table_type": "FLOW",
                    "table_name_data_object": [],
                    "query_prefix": "fs",
                    "time_range": "600",
                    "from_time": 1467997331174,
                    "from_time_utc": 1467997320000,
                    "to_time": 1467997931174,
                    "to_time_utc": 1467997920000,
                    "select": "vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, T=, sum(packets), sum(bytes)",
                    "time_granularity": 60,
                    "time_granularity_unit": "secs",
                    "where": null,
                    "where_json": null,
                    "filter_json": null,
                    "direction": "1",
                    "filters": "limit: 150000 & sort_fields:  & sort: asc",
                    "limit": "150000"
                },
                "queryId": "B792FB7F-EB32-4F61-8130-9E9EC612C91E-1467997933477",
                "engQueryStr": "{\"select\":\"vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, T=, sum(packets), sum(bytes)\",\"from\":\"FlowSeriesTable\",\"where\":null,\"filter\":\"limit: 150000 & sort_fields:  & sort: asc\",\"direction\":\"1\",\"from_time\":\"Jul 08, 2016 10:02:00 AM\",\"to_time\":\"Jul 08, 2016 10:12:00 AM\"}"
            },
            "opsQueryId": "1cfb11a1-452f-11e6-add3-00000a540b02"
        }
    ]
};


module.exports = mockData;