define(['underscore'], function (_) {

    this.getMockData = function(){

        var mockData = [];
        for(var i=0; i<100; i++){
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
    }

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
    ]
    return {
        logsQueryQueueMockData:logsQueryQueueMockData,
        logsViewQueryMockData:logsViewQueryMockData
    };
});