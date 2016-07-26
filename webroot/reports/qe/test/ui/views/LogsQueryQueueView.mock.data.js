define(['underscore'], function (_) {

    this.getMockData = function(){

        var mockData = [];
        for(var i=0; i<120; i++){
            var ts = 1467997860000000;
            ts = ts + Math.floor((Math.random() * 999));
            var data =
            {
                "Category": "__default__",
                "Level": 6 + (ts%2),
                "MessageTS": ts,
                "Messagetype": "discServiceLog",
                "ModuleId": "contrail-discovery",
                "NodeType": "Config",
                "Source": "a7s12",
                "Type": 1,
                "Xmlmessage": "<discServiceLog type=\"sandesh\"><log_msg type=\"string\" identifier=\"1\">&lt;cl=a7s12:contrail-vrouter-nodemgr,st=Collector&gt;  subs service=a7s12, assign=2, count=2</log_msg></discServiceLog>"
            };
            mockData.push(data);
        }
        return mockData;
    }


    this.logsViewQueryMockData = {
        "data": getMockData(),
        "total": getMockData().length,
        "queryJSON": {
            "table": "MessageTable",
            "start_time": 1468256700000000,
            "end_time": 1468257300000000,
            "select_fields": [
                "Type",
                "Level",
                "MessageTS",
                "Source",
                "ModuleId",
                "Category",
                "Level",
                "NodeType",
                "Messagetype",
                "Xmlmessage"
            ],
            "filter": [
                [
                    {
                        "name": "Type",
                        "value": "1",
                        "op": 1
                    },
                    {
                        "name": "Level",
                        "value": "7",
                        "op": 5
                    }
                ],
                [
                    {
                        "name": "Type",
                        "value": "10",
                        "op": 1
                    },
                    {
                        "name": "Level",
                        "value": "7",
                        "op": 5
                    }
                ]
            ],
            "sort_fields": [
                "MessageTS"
            ],
            "sort": "asc",
            "limit": 150000,
            "dir": 1
        },
        "chunk": 1,
        "chunkSize": 1505,
        "serverSideChunking": true
    },

        this.logsQueryQueueMockData = [
            {
                "startTime": 1468257356092,
                "queryJSON": {
                    "table": "MessageTable",
                    "start_time": 1468256700000000,
                    "end_time": 1468257300000000,
                    "select_fields": [
                        "Type",
                        "Level",
                        "MessageTS",
                        "Source",
                        "ModuleId",
                        "Category",
                        "Level",
                        "NodeType",
                        "Messagetype",
                        "Xmlmessage"
                    ],
                    "filter": [
                        [
                            {
                                "name": "Type",
                                "value": "1",
                                "op": 1
                            },
                            {
                                "name": "Level",
                                "value": "7",
                                "op": 5
                            }
                        ],
                        [
                            {
                                "name": "Type",
                                "value": "10",
                                "op": 1
                            },
                            {
                                "name": "Level",
                                "value": "7",
                                "op": 5
                            }
                        ]
                    ],
                    "sort_fields": [
                        "MessageTS"
                    ],
                    "sort": "asc",
                    "limit": 150000,
                    "dir": 1
                },
                "progress": 100,
                "status": "completed",
                "tableName": "MessageTable",
                "count": 1505,
                "timeTaken": 3.211,
                "errorMessage": "",
                "queryReqObj": {
                    "chunk": 1,
                    "autoSort": true,
                    "chunkSize": 10000,
                    "async": true,
                    "formModelAttrs": {
                        "table_name": "MessageTable",
                        "table_type": "LOG",
                        "table_name_data_object": [],
                        "query_prefix": "sl",
                        "time_range": "600",
                        "from_time": 1468256733006,
                        "from_time_utc": 1468256700000,
                        "to_time": 1468257333006,
                        "to_time_utc": 1468257300000,
                        "select": "MessageTS, Source, ModuleId, Category, Level, NodeType, Messagetype, Xmlmessage",
                        "time_granularity": 60,
                        "time_granularity_unit": "secs",
                        "where": null,
                        "where_json": null,
                        "filter_json": null,
                        "direction": "1",
                        "filters": "limit: 150000 & sort_fields:  & sort: asc",
                        "limit": "50000",
                        "keywords": "",
                        "log_level": "7"
                    },
                    "queryId": "74DE2303-2A17-4470-B2C6-EB6DED728BA1-1468257356000",
                    "engQueryStr": "{\"select\":\"MessageTS, Source, ModuleId, Category, Level, NodeType, Messagetype, Xmlmessage\",\"from\":\"MessageTable\",\"where\":null,\"filter\":\"limit: 150000 & sort_fields:  & sort: asc\",\"direction\":\"1\",\"from_time\":\"Jul 11, 2016 10:05:00 AM\",\"to_time\":\"Jul 11, 2016 10:15:00 AM\"}"
                },
                "opsQueryId": "20fc1c63-478b-11e6-8d2b-00000a541ef9"
            }
        ],

        this.values = {
            "data": [
                {
                    "fields.value": "contrail-analytics-api",
                    "name": "MessageTable:ModuleId"
                },
                {
                    "fields.value": "contrail-dns",
                    "name": "MessageTable:ModuleId"
                },
                {
                    "fields.value": "discClientLog",
                    "name": "MessageTable:Messagetype"
                },
                {
                    "fields.value": "discServiceLog",
                    "name": "MessageTable:Messagetype"
                },
                {
                    "fields.value": "QELog",
                    "name": "MessageTable:Messagetype"
                },
                {
                    "fields.value": "IFMapDSResp",
                    "name": "MessageTable:Messagetype"
                },
                {
                    "fields.value": "a3s31",
                    "name": "MessageTable:Source"
                },
                {
                    "fields.value": "contrail-discovery",
                    "name": "MessageTable:ModuleId"
                },
                {
                    "fields.value": "contrail-query-engine",
                    "name": "MessageTable:ModuleId"
                },
                {
                    "fields.value": "QEQueryLog",
                    "name": "MessageTable:Messagetype"
                },
                {
                    "fields.value": "contrail-control",
                    "name": "MessageTable:ModuleId"
                }
            ],
            "total": 11,
            "queryJSON": {
                "start_time": 1468619108000000,
                "end_time": 1468619708000000,
                "select_fields": [
                    "name",
                    "fields.value"
                ],
                "table": "StatTable.FieldNames.fields",
                "where": [
                    [
                        {
                            "name": "name",
                            "value": "MessageTable",
                            "op": 7
                        }
                    ]
                ]
            },
            "chunk": 1,
            "chunkSize": 11,
            "serverSideChunking": true
        },

        this.serverInfo = {
            "orchestrationModel": [
                "openstack"
            ],
            "serverUTCTime": 1468619708000,
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
            "_csrf": "L+ou5PaLVsLrRB+qOOmpcdNn",
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

        this.logsSchemaTable = {
            "type": "LOG",
            "columns": [
                {
                    "datatype": "int",
                    "index": false,
                    "name": "MessageTS",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": true,
                    "name": "Source",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": true,
                    "name": "ModuleId",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": true,
                    "name": "Category",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "int",
                    "index": true,
                    "name": "Level",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "int",
                    "index": false,
                    "name": "Type",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": false,
                    "name": "InstanceId",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": false,
                    "name": "NodeType",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": true,
                    "name": "Messagetype",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "int",
                    "index": false,
                    "name": "SequenceNum",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": false,
                    "name": "Context",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": true,
                    "name": "Keyword",
                    "select": null,
                    "suffixes": null
                },
                {
                    "datatype": "string",
                    "index": false,
                    "name": "Xmlmessage",
                    "select": null,
                    "suffixes": null
                }
            ]
        }

    return {
        logsQueryQueueMockData:logsQueryQueueMockData,
        logsViewQueryMockData:logsViewQueryMockData,
        values : values,
        serverInfo : serverInfo,
        logsSchemaTable:logsSchemaTable
    };
});