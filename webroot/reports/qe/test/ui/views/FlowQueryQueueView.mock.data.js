/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {

    var rowsCount = 120, timeStamp = 1468458000000000;
    this.getMockData = function () {

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
    }
    this.flowsQueryQueueMockData = [
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
            "count": rowsCount,
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
    ],

        this.getFlowViewQueryMockData = {
            "data": getMockData(),
            "total": rowsCount,
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
        }


    return {
        flowsQueryQueueMockData: flowsQueryQueueMockData,
        getFlowViewQueryMockData: getFlowViewQueryMockData
    };
});