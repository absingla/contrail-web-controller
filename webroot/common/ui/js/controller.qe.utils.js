/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'core-basedir/js/common/qe.model.config'
], function (_, qewmc) {
    var CTQEUtils = function() {
        this.getQueryPostData = function(tableType, nodeType, minsSince, serverCurrentTime) {
            var queryObj = this.getStatQueryModelConfigByType(nodeType);
            this.setFromTimeToTimeUTC(tableType, queryObj, minsSince, serverCurrentTime);
            return queryObj;
        };

        this.getStatTableColumns = function(nodeType){
            var colNames = ctwc.STATS_SELECT_FIELDS[nodeType];
            return [colNames['inBytes'], colNames['outBytes'], colNames['inPkts'], colNames['outPkts']];
        };

        this.getStatQueryModelConfigByType = function(nodeType) {
            var defaultConfig = qewmc.getQueryModelConfig({
                table_type: cowc.QE_STAT_TABLE_TYPE,
                query_prefix: cowc.STAT_QUERY_PREFIX
            });
            var tableConfig = {}
            if ('virtual-machine' == nodeType) {
                tableConfig.table_name = 'StatTable.UveVMInterfaceAgent.if_stats';
                tableConfig.select = this.getStatTableColumns(nodeType).concat(['vm_uuid']).join(',');
            } else if ('virtual-network' == nodeType) {
                tableConfig.table_name = 'StatTable.UveVirtualNetworkAgent.vn_stats';
                tableConfig.select = this.getStatTableColumns(nodeType).concat(['name']).join(',');
                tableConfig.context = 'vn';
            } else if ('virtual-machine-interface' == nodeType) {
                tableConfig.table_name = 'StatTable.UveVMInterfaceAgent.if_stats';
                tableConfig.select = this.getStatTableColumns(nodeType).concat(['name']).join(',');
            }
            var queryObj = $.extend(true, {}, defaultConfig, tableConfig);
            return queryObj;
        };

        this.setFromTimeToTimeUTC = function(tableType, queryObj, minsSince, serverTime) {
            if (minsSince && serverTime) {
                queryObj['to_time_utc'] = serverTime;
                queryObj['from_time_utc'] = serverTime - (minsSince * 60 * 1000);
            }
        }
    }

    ctqeu = new CTQEUtils();
    return ctqeu;
});
