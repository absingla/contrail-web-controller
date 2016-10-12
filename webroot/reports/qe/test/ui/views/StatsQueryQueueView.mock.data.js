/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

function generateTS(itemCount) {
    var mockData = [];
    for (var i = 0; i < itemCount; i++) {
        var ts = 1467997860000000;
        ts = ts + Math.floor((Math.random() * 999));
        var data =
        {
            "T=": ts,
            "name": "a7s12",
            "SUM(cql_stats.errors.connection_timeouts)": (ts % 10),
            "SUM(cql_stats.errors.pending_request_timeouts)": (ts % 5),
            "SUM(cql_stats.errors.request_timeouts)": (ts % 4),
            "COUNT(cql_stats.errors)": 1,
            "CLASS(T=)": 91883852587504720,
            "MAX(cql_stats.errors.connection_timeouts)": (ts % 10),
            "MAX(cql_stats.errors.pending_request_timeouts)": (ts % 5),
            "MAX(cql_stats.errors.request_timeouts)": (ts % 4),
            "MIN(cql_stats.errors.connection_timeouts)": (ts % 3),
            "MIN(cql_stats.errors.pending_request_timeouts)": (ts % 2),
            "MIN(cql_stats.errors.request_timeouts)": (ts % 4)
        }
        mockData.push(data);
    }
    return mockData;
};

var mockData = {
    statQueryQueueMockData: [
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

    vrouterSchema: {
        "type": "STAT",
        "columns": [
            {
                "datatype": "string",
                "index": true,
                "name": "Source",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "T",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(T)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "T=",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(T=)",
                "suffixes": null
            },
            {
                "datatype": "uuid",
                "index": false,
                "name": "UUID",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "COUNT(cql_stats.errors)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "cql_stats.errors.connection_timeouts",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "SUM(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MAX(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MIN(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "percentiles",
                "index": false,
                "name": "PERCENTILES(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "avg",
                "index": false,
                "name": "AVG(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "cql_stats.errors.pending_request_timeouts",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "SUM(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MAX(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MIN(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "percentiles",
                "index": false,
                "name": "PERCENTILES(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "avg",
                "index": false,
                "name": "AVG(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "cql_stats.errors.request_timeouts",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "SUM(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MAX(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MIN(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "percentiles",
                "index": false,
                "name": "PERCENTILES(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "avg",
                "index": false,
                "name": "AVG(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "string",
                "index": true,
                "name": "name",
                "suffixes": null
            }
        ]
    },
    statViewQueryQueueMockData: {
        "data": generateTS(60),
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
    },
    webServerInfo: {
        "orchestrationModel": [
            "openstack"
        ],
        "serverUTCTime": 1468825063000,
        "hostName": "testclient-mbp",
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
                "path": "/Users/testclient/testAuto/contrail-web-controller",
                "enable": true
            },
            "serverManager": {
                "path": "/Users/testclient/testAuto/contrail-web-server-manager",
                "enable": true
            },
            "webStorage": {
                "path": "/Users/testclient/testAuto/contrail-web-storage",
                "enable": true
            }
        },
        "sessionTimeout": 3600000,
        "_csrf": "ke9T/27gO5mYaZJzwGE0DHo6",
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
    values: {
        "data": [
            {
                "fields.value": "StatTable.CollectorDbStats.cql_stats.errors",
                "name": "STAT:StatTable.CollectorDbStats.cql_stats.errors"
            },
            {
                "fields.value": "StatTable.CollectorDbStats.cql_stats.stats",
                "name": "STAT:StatTable.CollectorDbStats.cql_stats.stats"
            },
            {
                "fields.value": "StatTable.VirtualMachineStats.cpu_stats",
                "name": "STAT:StatTable.VirtualMachineStats.cpu_stats"
            },
            {
                "fields.value": "StatTable.CollectorDbStats.cql_stats",
                "name": "STAT:StatTable.CollectorDbStats.cql_stats"
            },
            {
                "fields.value": "StatTable.AlarmgenStatus.counters",
                "name": "STAT:StatTable.AlarmgenStatus.counters"
            },
            {
                "fields.value": "StatTable.VncApiStatsLog.api_stats",
                "name": "STAT:StatTable.VncApiStatsLog.api_stats"
            },
            {
                "fields.value": "StatTable.AnalyticsCpuState.cpu_info",
                "name": "STAT:StatTable.AnalyticsCpuState.cpu_info"
            },
            {
                "fields.value": "StatTable.ConfigCpuState.cpu_info",
                "name": "STAT:StatTable.ConfigCpuState.cpu_info"
            },
            {
                "fields.value": "StatTable.ControlCpuState.cpu_info",
                "name": "STAT:StatTable.ControlCpuState.cpu_info"
            },
            {
                "fields.value": "StatTable.AlarmgenUpdate.o",
                "name": "STAT:StatTable.AlarmgenUpdate.o"
            },
            {
                "fields.value": "StatTable.AlarmgenUpdate.i",
                "name": "STAT:StatTable.AlarmgenUpdate.i"
            },
            {
                "fields.value": "StatTable.CollectorDbStats.table_info",
                "name": "STAT:StatTable.CollectorDbStats.table_info"
            },
            {
                "fields.value": "StatTable.NodeStatus.disk_usage_info",
                "name": "STAT:StatTable.NodeStatus.disk_usage_info"
            },
            {
                "fields.value": "StatTable.VrouterStatsAgent.flow_rate",
                "name": "STAT:StatTable.VrouterStatsAgent.flow_rate"
            },
            {
                "fields.value": "StatTable.UveVirtualNetworkAgent.vn_stats",
                "name": "STAT:StatTable.UveVirtualNetworkAgent.vn_stats"
            },
            {
                "fields.value": "StatTable.CassandraStatusData.thread_pool_stats",
                "name": "STAT:StatTable.CassandraStatusData.thread_pool_stats"
            },
            {
                "fields.value": "StatTable.CollectorDbStats.errors",
                "name": "STAT:StatTable.CollectorDbStats.errors"
            },
            {
                "fields.value": "StatTable.UveVMInterfaceAgent.if_stats",
                "name": "STAT:StatTable.UveVMInterfaceAgent.if_stats"
            },
            {
                "fields.value": "StatTable.CollectorDbStats.statistics_table_info",
                "name": "STAT:StatTable.CollectorDbStats.statistics_table_info"
            },
            {
                "fields.value": "StatTable.DatabaseUsageInfo.database_usage",
                "name": "STAT:StatTable.DatabaseUsageInfo.database_usage"
            },
            {
                "fields.value": "StatTable.AnalyticsApiStats.api_stats",
                "name": "STAT:StatTable.AnalyticsApiStats.api_stats"
            },
            {
                "fields.value": "StatTable.VrouterStatsAgent.phy_if_band",
                "name": "STAT:StatTable.VrouterStatsAgent.phy_if_band"
            },
            {
                "fields.value": "StatTable.QueryPerfInfo.query_stats",
                "name": "STAT:StatTable.QueryPerfInfo.query_stats"
            },
            {
                "fields.value": "StatTable.CassandraStatusData.cassandra_compaction_task",
                "name": "STAT:StatTable.CassandraStatusData.cassandra_compaction_task"
            },
            {
                "fields.value": "StatTable.SandeshMessageStat.msg_info",
                "name": "STAT:StatTable.SandeshMessageStat.msg_info"
            },
            {
                "fields.value": "StatTable.ComputeCpuState.cpu_info",
                "name": "STAT:StatTable.ComputeCpuState.cpu_info"
            }
        ],
        "total": 26,
        "queryJSON": {
            "start_time": 1468631066000000,
            "end_time": 1468631666000000,
            "select_fields": [
                "name",
                "fields.value"
            ],
            "table": "StatTable.FieldNames.fields",
            "where": [
                [
                    {
                        "name": "name",
                        "value": "STAT",
                        "op": 7
                    }
                ]
            ]
        },
        "chunk": 1,
        "chunkSize": 26,
        "serverSideChunking": true
    },
    cql_stats_errors: {
        "type": "STAT",
        "columns": [
            {
                "datatype": "string",
                "index": true,
                "name": "Source",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "T",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(T)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "T=",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(T=)",
                "suffixes": null
            },
            {
                "datatype": "uuid",
                "index": false,
                "name": "UUID",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "COUNT(cql_stats.errors)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "cql_stats.errors.connection_timeouts",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "SUM(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MAX(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MIN(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "percentiles",
                "index": false,
                "name": "PERCENTILES(cql_stats.errors.connection_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "cql_stats.errors.pending_request_timeouts",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "SUM(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MAX(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MIN(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "percentiles",
                "index": false,
                "name": "PERCENTILES(cql_stats.errors.pending_request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "cql_stats.errors.request_timeouts",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "SUM(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "CLASS(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MAX(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "int",
                "index": false,
                "name": "MIN(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "percentiles",
                "index": false,
                "name": "PERCENTILES(cql_stats.errors.request_timeouts)",
                "suffixes": null
            },
            {
                "datatype": "string",
                "index": true,
                "name": "name",
                "suffixes": null
            }
        ]
    }
};

module.exports = mockData;