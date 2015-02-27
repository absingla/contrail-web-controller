/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTParsers = function() {
        this.networkDataParserBack = function(response) {
            var retArr = $.map(ifNull(response['data']['value'], response), function (currObject) {
                currObject['rawData'] = $.extend(true,{},currObject);
                currObject['url'] = '/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + currObject['name'];
                currObject['outBytes'] = '-';
                currObject['inBytes'] = '-';
                var inBytes = 0,outBytes = 0;
                var statsObj = getValueByJsonPath(currObject,'value;UveVirtualNetworkAgent;vn_stats;0;StatTable.UveVirtualNetworkAgent.vn_stats',[]);
                for(var i = 0; i < statsObj.length; i++){
                    inBytes += ifNull(statsObj[i]['SUM(vn_stats.in_bytes)'],0);
                    outBytes += ifNull(statsObj[i]['SUM(vn_stats.out_bytes)'],0);
                }
                if(getValueByJsonPath(currObject,'value;UveVirtualNetworkAgent;vn_stats') != null) {
                    currObject['outBytes'] = outBytes;
                    currObject['inBytes'] = inBytes;
                }
                currObject['instCnt'] = ifNull(jsonPath(currObject, '$..virtualmachine_list')[0], []).length;
                currObject['inThroughput'] = ifNull(jsonPath(currObject, '$..in_bandwidth_usage')[0], 0);
                currObject['outThroughput'] = ifNull(jsonPath(currObject, '$..out_bandwidth_usage')[0], 0);
                return currObject;
            });
            return retArr;
        };

        this.networkDataParser = function(response) {
            var retArr = $.map(ifNull(response['data']['value'], response), function (currObject) {
                currObject['rawData'] = $.extend(true, {}, currObject);
                currObject['url'] = '/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + currObject['name'];
                currObject['outBytes'] = '-';
                currObject['inBytes'] = '-';
                currObject['outBytes60'] = '-';
                currObject['inBytes60'] = '-';
                var inBytes = 0, outBytes = 0;
                var statsObj = getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;vn_stats;0;StatTable.UveVirtualNetworkAgent.vn_stats', []);
                for (var i = 0; i < statsObj.length; i++) {
                    inBytes += ifNull(statsObj[i]['SUM(vn_stats.in_bytes)'], 0);
                    outBytes += ifNull(statsObj[i]['SUM(vn_stats.out_bytes)'], 0);
                }
                if (getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;vn_stats') != null) {
                    currObject['outBytes'] = outBytes;
                    currObject['inBytes'] = inBytes;
                }
                currObject['instCnt'] = ifNull(jsonPath(currObject, '$..virtualmachine_list')[0], []).length;
                currObject['inThroughput'] = ifNull(jsonPath(currObject, '$..in_bandwidth_usage')[0], 0);
                currObject['outThroughput'] = ifNull(jsonPath(currObject, '$..out_bandwidth_usage')[0], 0);

                currObject['intfCnt'] = ifNull(jsonPath(currObject, '$..interface_list')[0], []).length;
                currObject['vnCnt'] = ifNull(jsonPath(currObject, '$..connected_networks')[0], []).length;
                currObject['throughput'] = currObject['inThroughput'] + currObject['outThroughput'];
                currObject['x'] = currObject['intfCnt'];
                currObject['y'] = currObject['vnCnt'];
                currObject['size'] = currObject['throughput'] + 1;
                currObject['type'] = 'network';
                currObject['name'] = currObject['name'];
                currObject['uuid'] = currObject['uuid'];
                currObject['project'] = currObject['name'].split(':').slice(0, 2).join(':');

                return currObject;

            });
            return retArr;
        };

        this.statsOracleParseFn = function(response,type) {
            var retArr = $.map(ifNull(response['value'],response), function (obj, idx) {
                var item = {};
                var props = STATS_PROP[type];
                item['name'] = obj['name'];
                item['inBytes'] = ifNull(obj[props['inBytes']],'-');
                item['outBytes'] = ifNull(obj[props['outBytes']],'-');
                return item;
            });
            return retArr;
        };

        this.projectNetworksDataParser = function (projectModel, networkModel) {
            var projectItems = projectModel.getItems(), vnList = networkModel.getItems(),
                projectMap = {}, inBytes = 0, outBytes = 0, projNameList = [];

            var defProjObj = {
                intfCnt: 0,
                vnCnt: 0,
                throughput: 0,
                inThroughput: 0,
                outThroughput: 0,
                inBytes: 0,
                outBytes: 0,
                inBytes60: 0,
                outBytes60: 0
            };

            $.each(projectItems, function (idx, projObj) {
                projNameList.push(projObj['name']);
            });

            $.each(vnList, function (idx, vn) {
                var project;
                inBytes += vn['inBytes'];
                outBytes += vn['outBytes'];
                if (!(vn['project'] in projectMap)) {
                    projectMap[vn['project']] = $.extend({}, defProjObj);
                }
                project = projectMap[vn['project']];

                project['outBytes'] = contrail.checkAndReplace(project['outBytes'], '-', 0) + vn['outBytes'];
                project['inBytes'] = contrail.checkAndReplace(project['inBytes'], '-', 0) + vn['inBytes'];
                project['outBytes60'] = contrail.checkAndReplace(project['outBytes60'], '-', 0) + vn['outBytes60'];
                project['inBytes60'] = contrail.checkAndReplace(project['inBytes60'], '-', 0) + vn['inBytes60'];

                project['inThroughput'] += vn['inThroughput'];
                project['outThroughput'] += vn['outThroughput'];
                project['intfCnt'] += vn['intfCnt'];
                project['throughput'] += vn['throughput'];
                project['vnCnt']++;
            });

            $.each(projNameList, function (idx, currProjName) {
                if (projectMap[currProjName] == null) {
                    projectMap[currProjName] = $.extend({}, defProjObj);
                }
            });

            projectItems = projectModel.getItems();

            $.each(projectItems, function(key, project) {
                var projectName = project['name'],
                    projectWithVNData = projectMap[projectName];
                if(projectWithVNData != null) {
                    $.extend(true, project, projectWithVNData, {
                        type: 'project',
                        size: projectWithVNData['throughput'] + 1,
                        x: projectWithVNData['intfCnt'],
                        y: projectWithVNData['vnCnt']
                    });
                }
            });
            projectModel.updateData(projectItems);
        };

        this.instanceDataParser = function(response) {
            var retArr = $.map(ifNull(response['data']['value'],response), function (currObject, idx) {
                var currObj = currObject['value'];
                var intfStats = getValueByJsonPath(currObj,'VirtualMachineStats;if_stats;0;StatTable.VirtualMachineStats.if_stats',[]);
                currObject['rawData'] = $.extend(true,{},currObj);
                currObject['inBytes'] = '-';
                currObject['outBytes'] = '-';
                currObject['inBytes60'] = '-';
                currObject['outBytes60'] = '-';
                // If we append * wildcard stats info are not there in response,so we changed it to flat
                currObject['url'] = '/api/tenant/networking/virtual-machine/summary?fqNameRegExp=' + currObject['name'] + '?flat';
                currObject['vmName'] = ifNull(jsonPath(currObj, '$..vm_name')[0], '-');
                var vRouter = getValueByJsonPath(currObj,'UveVirtualMachineAgent;vrouter');
                currObject['vRouter'] = ifNull(tenantNetworkMonitorUtils.getDataBasedOnSource(vRouter), '-');
                currObject['intfCnt'] = ifNull(jsonPath(currObj, '$..interface_list')[0], []).length;
                currObject['vn'] = ifNull(jsonPath(currObj, '$..interface_list[*].virtual_network'),[]);
                //Parse the VN only if it exists
                if(currObject['vn'] != false) {
                    if(currObject['vn'].length != 0) {
                        currObject['vnFQN'] = currObject['vn'][0];
                    }
                    currObject['vn'] = tenantNetworkMonitorUtils.formatVN(currObject['vn']);
                }
                currObject['ip'] = [];
                var intfList = tenantNetworkMonitorUtils.getDataBasedOnSource(getValueByJsonPath(currObj,'UveVirtualMachineAgent;interface_list',[]));
                for(var i = 0; i < intfList.length; i++ ) {
                    if(intfList[i]['ip6_active'] == true) {
                        if(intfList[i]['ip_address'] != '0.0.0.0')
                            currObject['ip'].push(intfList[i]['ip_address']);
                        if(intfList[i]['ip6_address'] != null)
                            currObject['ip'].push(intfList[i]['ip6_address']);
                    } else {
                        if(intfList[i]['ip_address'] != '0.0.0.0')
                            currObject['ip'].push(intfList[i]['ip_address']);
                    }
                }
                var fipStatsList = getValueByJsonPath(currObj,'UveVirtualMachineAgent:fip_stats_list');
                var floatingIPs = ifNull(tenantNetworkMonitorUtils.getDataBasedOnSource(fipStatsList), []);
                currObject['floatingIP'] = [];
                if(getValueByJsonPath(currObj,'VirtualMachineStats;if_stats') != null) {
                    currObject['inBytes'] = 0;
                    currObject['outBytes'] = 0;
                }
                $.each(floatingIPs, function(idx, fipObj){
                    currObject['floatingIP'].push(contrail.format('{0}<br/> ({1}/{2})', fipObj['ip_address'],formatBytes(ifNull(fipObj['in_bytes'],'-')),
                        formatBytes(ifNull(fipObj['out_bytes'],'-'))));
                });
                $.each(intfStats, function (idx, value) {
                    currObject['inBytes'] += ifNull(value['SUM(if_stats.in_bytes)'],0);
                });
                $.each(intfStats, function (idx, value) {
                    currObject['outBytes'] += ifNull(value['SUM(if_stats.out_bytes)'],0);
                });
                return currObject;
            });
            return retArr;
        }

        this.projectDataParser = function (response) {
            var projects = contrail.handleIfNull(response['projects'], []),
                project, projectList = [];

            for(var i = 0; i < projects.length; i++) {
                project = {};
                project['name'] = projects[i]['fq_name'].join(":");
                project['uuid'] = projects[i]['uuid'];
                projectList.push(project);
            }

            return projectList;
        };
    }

    return CTParsers;
});