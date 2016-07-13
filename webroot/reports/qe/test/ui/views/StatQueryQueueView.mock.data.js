
define(['underscore'], function (_) {
    this.statQueryQueueMockData = [
        {
            "startTime": 1468258056991,
            "queryJSON": {
                "table": "StatTable.CollectorDbStats.cql_stats.errors",
                "start_time": 1468254420000000,
                "end_time": 1468258020000000,
                "select_fields": [
                    "T=60",
                    "COUNT(cql_stats.errors)",
                    "SUM(cql_stats.errors.connection_timeouts)",
                    "MAX(cql_stats.errors.connection_timeouts)",
                    "MIN(cql_stats.errors.connection_timeouts)",
                    "SUM(cql_stats.errors.pending_request_timeouts)",
                    "MAX(cql_stats.errors.pending_request_timeouts)",
                    "MIN(cql_stats.errors.pending_request_timeouts)",
                    "SUM(cql_stats.errors.request_timeouts)",
                    "MAX(cql_stats.errors.request_timeouts)",
                    "MIN(cql_stats.errors.request_timeouts)",
                    "name",
                    "CLASS(T=)"
                ],
                "filter": [
                    []
                ],
                "where": [
                    [
                        {
                            "name": "name",
                            "value": "",
                            "op": 7
                        }
                    ]
                ],
                "dir": 1,
                "limit": 150000
            },
            "progress": 100,
            "status": "completed",
            "tableName": "StatTable.CollectorDbStats.cql_stats.errors",
            "count": 60,
            "timeTaken": 3.122,
            "errorMessage": "",
            "queryReqObj": {
                "chunk": 1,
                "autoSort": true,
                "chunkSize": 10000,
                "async": true,
                "formModelAttrs": {
                    "table_name": "StatTable.CollectorDbStats.cql_stats.errors",
                    "table_type": "STAT",
                    "table_name_data_object": [
                        "StatTable.CollectorDbStats.cql_stats.errors",
                        "StatTable.CollectorDbStats.cql_stats.stats",
                        "StatTable.VirtualMachineStats.cpu_stats",
                        "StatTable.CollectorDbStats.cql_stats",
                        "StatTable.AlarmgenStatus.counters",
                        "StatTable.VncApiStatsLog.api_stats",
                        "StatTable.AnalyticsCpuState.cpu_info",
                        "StatTable.ConfigCpuState.cpu_info",
                        "StatTable.ControlCpuState.cpu_info",
                        "StatTable.AlarmgenUpdate.o",
                        "StatTable.AlarmgenUpdate.i",
                        "StatTable.CollectorDbStats.table_info",
                        "StatTable.NodeStatus.disk_usage_info",
                        "StatTable.VrouterStatsAgent.flow_rate",
                        "StatTable.UveVirtualNetworkAgent.vn_stats",
                        "StatTable.CassandraStatusData.thread_pool_stats",
                        "StatTable.CollectorDbStats.errors",
                        "StatTable.CollectorDbStats.statistics_table_info",
                        "StatTable.DatabaseUsageInfo.database_usage",
                        "StatTable.AnalyticsApiStats.api_stats",
                        "StatTable.VrouterStatsAgent.phy_if_band",
                        "StatTable.QueryPerfInfo.query_stats",
                        "StatTable.CassandraStatusData.cassandra_compaction_task",
                        "StatTable.SandeshMessageStat.msg_info",
                        "StatTable.ComputeCpuState.cpu_info"
                    ],
                    "query_prefix": "stat",
                    "time_range": "3600",
                    "from_time": 1468257430657,
                    "from_time_utc": 1468254420000,
                    "to_time": 1468258030657,
                    "to_time_utc": 1468258020000,
                    "select": "T=, COUNT(cql_stats.errors), SUM(cql_stats.errors.connection_timeouts), MAX(cql_stats.errors.connection_timeouts), MIN(cql_stats.errors.connection_timeouts), SUM(cql_stats.errors.pending_request_timeouts), MAX(cql_stats.errors.pending_request_timeouts), MIN(cql_stats.errors.pending_request_timeouts), SUM(cql_stats.errors.request_timeouts), MAX(cql_stats.errors.request_timeouts), MIN(cql_stats.errors.request_timeouts), name",
                    "time_granularity": 60,
                    "time_granularity_unit": "secs",
                    "where": "",
                    "where_json": null,
                    "filter_json": null,
                    "direction": "1",
                    "filters": "",
                    "limit": "150000"
                },
                "queryId": "1911525A-13C3-4A22-99D6-FDA1198ED000-1468258056963",
                "engQueryStr": "{\"select\":\"T=, COUNT(cql_stats.errors), SUM(cql_stats.errors.connection_timeouts), MAX(cql_stats.errors.connection_timeouts), MIN(cql_stats.errors.connection_timeouts), SUM(cql_stats.errors.pending_request_timeouts), MAX(cql_stats.errors.pending_request_timeouts), MIN(cql_stats.errors.pending_request_timeouts), SUM(cql_stats.errors.request_timeouts), MAX(cql_stats.errors.request_timeouts), MIN(cql_stats.errors.request_timeouts), name\",\"from\":\"StatTable.CollectorDbStats.cql_stats.errors\",\"where\":\"\",\"filter\":\"\",\"direction\":\"1\",\"from_time\":\"Jul 11, 2016 09:27:00 AM\",\"to_time\":\"Jul 11, 2016 10:27:00 AM\"}"
            },
            "opsQueryId": "c2c0bab0-478c-11e6-9ee6-00000a541ef9"
        }
    ],
        this.getMockData = function(){

            var mockData = [];
            for(var i=0; i<60; i++){
                var ts = 1467997860000000;
                ts = ts + Math.floor((Math.random() * 999));
                var data =
                    {
                        "T=": ts,
                        "name": "a7s12",
                        "SUM(cql_stats.errors.connection_timeouts)": (ts%10),
                        "SUM(cql_stats.errors.pending_request_timeouts)": (ts%5),
                        "SUM(cql_stats.errors.request_timeouts)": (ts%4),
                        "COUNT(cql_stats.errors)": 1,
                        "CLASS(T=)": 91883852587504720,
                        "MAX(cql_stats.errors.connection_timeouts)": (ts%10),
                        "MAX(cql_stats.errors.pending_request_timeouts)": (ts%5),
                        "MAX(cql_stats.errors.request_timeouts)": (ts%4),
                        "MIN(cql_stats.errors.connection_timeouts)": (ts%3),
                        "MIN(cql_stats.errors.pending_request_timeouts)": (ts%2),
                        "MIN(cql_stats.errors.request_timeouts)": (ts%4)
                    }
                mockData.push(data);
            }
            return mockData;
        }
    this.statViewQueryQueueMockData = {
        "data": getMockData(),
        "total": 60,
        "queryJSON": {
            "table": "StatTable.CollectorDbStats.cql_stats.errors",
            "start_time": 1468254420000000,
            "end_time": 1468258020000000,
            "select_fields": [
                "T=60",
                "COUNT(cql_stats.errors)",
                "SUM(cql_stats.errors.connection_timeouts)",
                "MAX(cql_stats.errors.connection_timeouts)",
                "MIN(cql_stats.errors.connection_timeouts)",
                "SUM(cql_stats.errors.pending_request_timeouts)",
                "MAX(cql_stats.errors.pending_request_timeouts)",
                "MIN(cql_stats.errors.pending_request_timeouts)",
                "SUM(cql_stats.errors.request_timeouts)",
                "MAX(cql_stats.errors.request_timeouts)",
                "MIN(cql_stats.errors.request_timeouts)",
                "name",
                "CLASS(T=)"
            ],
            "filter": [
                []
            ],
            "where": [
                [
                    {
                        "name": "name",
                        "value": "",
                        "op": 7
                    }
                ]
            ],
            "dir": 1,
            "limit": 150000
        },
        "chunk": 1,
        "chunkSize": 60,
        "serverSideChunking": true
    }
    
    return {
        statQueryQueueMockData:statQueryQueueMockData,
        statViewQueryQueueMockData:statViewQueryQueueMockData
    };
});