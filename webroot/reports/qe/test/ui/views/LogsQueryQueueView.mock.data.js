define(['underscore'], function (_) {
    this.logsQueryQueueMockData =
[
    {
        "startTime": 1467826489378,
        "queryJSON": {
            "table": "MessageTable",
            "start_time": 1467783240000000,
            "end_time": 1467826440000000,
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
        "progress": 20,
        "status": "queued",
        "tableName": "MessageTable",
        "count": 0,
        "timeTaken": -1,
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
                "time_range": "43200",
                "from_time": 1467825879579,
                "from_time_utc": 1467783240000,
                "to_time": 1467826479579,
                "to_time_utc": 1467826440000,
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
            "queryId": "80D1931A-9AAD-4A0A-A47B-EC7D612FB8F8-1467826489362",
            "engQueryStr": "{\"select\":\"MessageTS, Source, ModuleId, Category, Level, NodeType, Messagetype, Xmlmessage\",\"from\":\"MessageTable\",\"where\":null,\"filter\":\"limit: 150000 & sort_fields:  & sort: asc\",\"direction\":\"1\",\"from_time\":\"Jul 05, 2016 10:34:00 PM\",\"to_time\":\"Jul 06, 2016 10:34:00 AM\"}"
        },
        "opsQueryId": "f0702733-439f-11e6-9509-00000a541ef9"
    },
    {
        "startTime": 1467826313480,
        "queryJSON": {
            "table": "MessageTable",
            "start_time": 1467825660000000,
            "end_time": 1467826260000000,
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
        "timeTaken": 3.254,
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
                "from_time": 1467825712206,
                "from_time_utc": 1467825660000,
                "to_time": 1467826312206,
                "to_time_utc": 1467826260000,
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
            "queryId": "E56C2D0B-423F-4A50-AB1C-3E776A4DEC7C-1467826313440",
            "engQueryStr": "{\"select\":\"MessageTS, Source, ModuleId, Category, Level, NodeType, Messagetype, Xmlmessage\",\"from\":\"MessageTable\",\"where\":null,\"filter\":\"limit: 150000 & sort_fields:  & sort: asc\",\"direction\":\"1\",\"from_time\":\"Jul 06, 2016 10:21:00 AM\",\"to_time\":\"Jul 06, 2016 10:31:00 AM\"}"
        },
        "opsQueryId": "8798270c-439f-11e6-9e09-00000a541ef9"
    }
]
    return {
        logsQueryQueueMockData:logsQueryQueueMockData
    };
});