/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var nwMonApi = module.exports;

var cacheApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/web/core/cache.api'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    authApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api'),
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    infraCmn = require('../../../common/api/infra.common.api'),
    nwMonUtils = require('../../../common/api/nwMon.utils'),
    ctrlGlobal = require('../../../common/api/global'),
    nwMonJobs = require('../jobs/network.mon.jobs.js'),
    appErrors = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors'),
    config = process.mainModule.exports["config"],
    async = require('async'),
    jsonPath = require('JSONPath').eval,
    flowCache = require('../../../common/api/flowCache.api'),
    qeUtils = require(process.mainModule.exports["corePath"] +
                      '/webroot/reports/qe/api/query.utils'),
    assert = require('assert');

var instanceDetailsMap = {
    vcenter: getInstancesDetailsForUser
}

var virtualNetworkDetailsMap = {
    vcenter: getVirtualNetworksForUser
}

function getFlowSeriesByVN(req, res) {
    var minsSince = req.query['minsSince'];
    var vnName = req.query['srcVN'];
    var sampleCnt = req.query['sampleCnt'];
    var dstVN = req.query['destVN'];
    var srcVN = req.query['srcVN'];
    var fqName = req.query['fqName'];
    var startTime = req.query['startTime'];
    var endTime = req.query['endTime'];
    var relStartTime = req.query['relStartTime'];
    var relEndTime = req.query['relEndTime'];
    var timeGran = req.query['timeGran'];
    var minsAlign = req.query['minsAlign'];
    var useServerTime = req.query['useServerTime'];
    var vrouter = req.query['vrouter'];
    var reqKey;

    if (null == dstVN) {
        dstVN = "";
        srcVN = fqName;
        reqKey = global.GET_FLOW_SERIES_BY_VN;
    } else {
        reqKey = global.GET_FLOW_SERIES_BY_VNS;
    }

    var appData = {
        minsSince: minsSince,
        minsAlign: minsAlign,
        srcVN: srcVN,
        dstVN: dstVN,
        sampleCnt: sampleCnt,
        startTime: startTime,
        endTime: endTime,
        relStartTime: relStartTime,
        relEndTime: relEndTime,
        timeGran: timeGran,
        useServerTime: useServerTime,
        vrouter: vrouter,
        minsAlign: minsAlign
    };

    var reqUrl = "/flow_series/VN=";
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
        reqKey, reqUrl,
        0, 1, 0, -1, true, appData);
}

function getProjectSummary(req, res, appData) {
    var urlLists = [];
    var project = req.param('fqName');
    url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + project;
    getProjectData({url: url, appData: appData}, function (err, results) {
        if (err || (null == results)) {
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, results['virtual-networks']);
        }
    });
}

function getNetworkStats(req, res) {
    var fqName = req.query['fqName'];
    var type = req.query['type'];
    var limit = req.query['limit'];
    var minsSince = req.query['minsSince'];
    var protocol = req.query['protocol'];
    var startTime = req.query['startTime'];
    var endTime = req.query['endTime'];
    var useServerTime = req.query['useServerTime'];
    var ip = req.query['ip'];
    var reqKey;

    var appData = {
        minsSince: minsSince,
        fqName: fqName,
        limit: limit,
        startTime: startTime,
        endTime: endTime,
        useServerTime: useServerTime,
        protocol: protocol,
        ip: ip
    };
    if (type == 'port') {
        reqKey = global.STR_GET_TOP_PORT_BY_NW;
        if (req.query['portRange']) {
            appData['portRange'] = req.query['portRange'];
        }
    } else {
        var err =
            appErrors.RESTServerError(messages.error.monitoring.invalid_type_provided,
                                      reqKey);
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }

    var url = '/virtual-network/stats';
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                             reqKey, url, 0, 1, 0, -1, true,
                                             appData);
}

function getVNStatsSummary(req, res, appData) {
    var vnName = req.param('fqName');
    var url = '/analytics/uves/virtual-network/' + vnName;
    var json = {};
        opApiServer.apiGet(url, appData, function (error, vnJSON) {
            var resultJSON = {};
            if (!error && (vnJSON)) {
                var resultJSON = {};
                resultJSON['virtual-networks'] = [];
                resultJSON['virtual-networks'][0] = {};
                resultJSON['virtual-networks'][0]['fq_name'] = vnName.split(':');
                populateInOutTraffic(resultJSON, vnJSON, 0);
                try {
                    json = resultJSON['virtual-networks'][0];
                } catch (e) {
                    logutils.logger.error("In getVNStatsSummary(), JSON parse error: " + e);
                    json = {};
                }
                commonUtils.handleJSONResponse(null, res, json);
            } else {
                commonUtils.handleJSONResponse(error, res, json);
            }
        });
}

function getFlowSeriesByVM(req, res) {
    var vnName = req.query['fqName'];
    var sampleCnt = req.query['sampleCnt'];
    var minsSince = req.query['minsSince'];
    var ip = req.query['ip'];
    var startTime = req.query['startTime'];
    var endTime = req.query['endTime'];
    var relStartTime = req.query['relStartTime'];
    var relEndTime = req.query['relEndTime'];
    var timeGran = req.query['timeGran'];
    var minsAlign = req.query['minsAlign'];
    var useServerTime = req.query['useServerTime'];
    var vmName = req.query['vmName'];
    var vmVnName = req.query['vmVnName'];
    var fip = req.query['fip'];
    var appData = {
        ip: ip,
        vnName: vnName,
        vmName: vmName,
        vmVnName: vmVnName,
        fip: fip,
        sampleCnt: sampleCnt,
        minsSince: minsSince,
        minsAlign: minsAlign,
        startTime: startTime,
        endTime: endTime,
        relStartTime: relStartTime,
        relEndTime: relEndTime,
        timeGran: timeGran,
        useServerTime: useServerTime,
        minsAlign: minsAlign
    };
    var reqUrl = "/flow_series/VM=";
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
        global.GET_FLOW_SERIES_BY_VM, reqUrl,
        0, 1, 0, -1, true, appData);
}

function getVMStatByInterface(vmStat, vmVnName) {
    var resultJSON = {};
    var data;
    try {
        var len = vmStat.length;
        for (var i = 0; i < len; i++) {
            try {
                data = vmStat[i];
                if (data['name']['#text'] == vmVnName) {
                    break;
                }
            } catch (e) {
                logutils.logger.error("In getVMStatByInterface(): Data JSON Parse error:" + e);
                continue;
            }
        }
        if (i == len) {
            return resultJSON;
        }
        resultJSON = commonUtils.createJSONByUVEResponse(resultJSON, data);
    } catch (e) {
        logutils.logger.error("In getVMStatByInterface(): JSON Parse error:" + e);
    }
    return resultJSON;
}

function initVmStatResultData(resultJSON, vmName) {
    resultJSON['name'] = vmName;
    resultJSON['in_pkts'] = 0;
    resultJSON['in_bytes'] = 0;
    resultJSON['out_pkts'] = 0;
    resultJSON['out_bytes'] = 0;
}

function getVMStatsSummary(req, res, appData) {
    var url;
    var vmVnName = req.query['vmVnName'];
    var resultJSON = {};

    try {
        var vmName = vmVnName.split(':')[0];
    } catch (e) {
        commonUtils.handleJSONResponse(null, res, {});
        return;
    }

    initVmStatResultData(resultJSON, vmVnName);
    url = '/analytics/uves/virtual-machine/' + vmName;

        opApiServer.apiGet(url, appData, function (err, data) {
            var statData = jsonPath(data, "$..VmInterfaceAgentStats");
            if (statData.length > 0) {
                var data = getVMStatByInterface(statData[0], vmVnName);
                commonUtils.handleJSONResponse(null, res, data);
            } else {
                commonUtils.handleJSONResponse(null, res, resultJSON);
            }
        });
}

function getTrafficInEgrStat(resultJSON, srcVN, destVN, type) {
    var results = {};
    results['srcVN'] = srcVN;
    results['destVN'] = destVN;
    results['inBytes'] = 0;
    results['inPkts'] = 0;
    results['outBytes'] = 0;
    results['outPkts'] = 0;
    if (type != global.FlOW_SERIES_STAT_TYPE) {
        var inStat = resultJSON['in_stats'];
        var outStat = resultJSON['out_stats'];
        var inStatLen = inStat.length;
        var outStatLen = outStat.length;
        for (var i = 0; i < inStatLen; i++) {
            if (destVN == inStat[i]['other_vn']) {
                results['inBytes'] = inStat[i]['bytes'];
                results['inPkts'] = inStat[i]['tpkts'];
                break;
            }
        }
        for (var i = 0; i < outStatLen; i++) {
            if (destVN == outStat[i]['other_vn']) {
                results['outBytes'] = outStat[i]['bytes'];
                results['outPkts'] = outStat[i]['tpkts'];
                break;
            }
        }
        return results;
    } else {
        if (resultJSON['vn_stats'] != null && resultJSON['vn_stats'][0]['StatTable.UveVirtualNetworkAgent.vn_stats'] != null) {
            var stats = resultJSON['vn_stats'][0]['StatTable.UveVirtualNetworkAgent.vn_stats'];
            for (var i = 0; i < stats.length; i++) {
                if (stats[i]['vn_stats.other_vn'] == destVN) {
                    results['inBytes'] = stats[i]['SUM(vn_stats.in_bytes)'] != null ? stats[i]['SUM(vn_stats.in_bytes)'] : 0;
                    results['outBytes'] = stats[i]['SUM(vn_stats.out_bytes)'] != null ? stats[i]['SUM(vn_stats.out_bytes)'] : 0;
                    results['inPkts'] = stats[i]['SUM(vn_stats.in_tpkts)'] != null ? stats[i]['SUM(vn_stats.in_tpkts)'] : 0;
                    results['outPkts'] = stats[i]['SUM(vn_stats.out_tpkts)'] != null ? stats[i]['SUM(vn_stats.out_tpkts)'] : 0;
                    break;
                }
            }
        }
        return results;
    }
}

function getVNStatsJSONSummary(resultJSON, results) {
    var len = results.length;
    var VNAgentData;
    var inStat;
    var outStat;
    for (var i = 0; i < len; i++) {
        resultJSON[i] = {};
        try {
            resultJSON[i]['vn_stats'] = results[i]['UveVirtualNetworkAgent']['vn_stats'];
        } catch (e) {
            resultJSON[i]['vn_stats'] = [];
        }
        try {
            inStat = results[i]['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats'];
            var inStatCnt = inStat.length;
            resultJSON[i]['in_stats'] = [];
            resultJSON[i]['out_stats'] = [];
            for (var j = 0; j < inStatCnt; j++) {
                resultJSON[i]['in_stats'][j] = {};
                resultJSON[i]['in_stats'][j]['other_vn'] =
                    inStat[j]['other_vn']['#text'];
                resultJSON[i]['in_stats'][j]['bytes'] =
                    inStat[j]['bytes']['#text'];
                resultJSON[i]['in_stats'][j]['tpkts'] =
                    inStat[j]['tpkts']['#text'];
            }
        } catch (e) {
            resultJSON[i]['in_stats'] = [];
        }
        try {
            outStat = results[i]['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats'];
            var outStatCnt = outStat.length;
            for (j = 0; j < outStatCnt; j++) {
                resultJSON[i]['out_stats'][j] = {};
                resultJSON[i]['out_stats'][j]['other_vn'] =
                    outStat[j]['other_vn']['#text'];
                resultJSON[i]['out_stats'][j]['bytes'] =
                    outStat[j]['bytes']['#text'];
                resultJSON[i]['out_stats'][j]['tpkts'] =
                    outStat[j]['tpkts']['#text'];
            }
        } catch (e) {
            resultJSON[i]['out_stats'] = [];
        }
    }
}

function getNetworkInGressEgressTrafficStat(srcVN, destVN, appData, callback) {
    var dataObjArr = [];
    var resultJSON = [];

    var url = '/analytics/uves/virtual-network/' + srcVN + '?flat';
    commonUtils.createReqObj(dataObjArr, url, null, null, null, null, appData);
    url = '/analytics/uves/virtual-network/' + destVN + '?flat';
    commonUtils.createReqObj(dataObjArr, url, null, null, null, null, appData);

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(opApiServer.apiGet, true),
              function (err, results) {
            if ((null == err) && results) {
                getVNStatsJSONSummary(resultJSON, results);
                /* Now get the data */
                var jsonData = [];
                jsonData[0] = getTrafficInEgrStat(resultJSON[0], srcVN, destVN);
                jsonData[1] = getTrafficInEgrStat(resultJSON[1], destVN, srcVN);
                callback(null, jsonData);
            } else {
                callback(err, results);
            }
        });
}

function formatNetworkStatsSummary(data) {
    var results = {};
    results['fromNW'] = {};
    try {
        results['fromNW']['inBytes'] = data[0]['inBytes'];
    } catch (e) {
        results['fromNW']['inBytes'] = 0;
    }
    try {
        results['fromNW']['inPkts'] = data[0]['inPkts'];
    } catch (e) {
        results['fromNW']['inPkts'] = 0;
    }
    try {
        results['fromNW']['outBytes'] = data[0]['outBytes'];
    } catch (e) {
        results['fromNW']['outBytes'] = 0;
    }
    try {
        results['fromNW']['outPkts'] = data[0]['outPkts'];
    } catch (e) {
        results['fromNW']['outPkts'] = 0;
    }
    results['toNW'] = {};
    try {
        results['toNW']['inBytes'] = data[1]['inBytes'];
    } catch (e) {
        results['toNW']['inBytes'] = 0;
    }
    try {
        results['toNW']['inPkts'] = data[1]['inPkts'];
    } catch (e) {
        results['toNW']['inPkts'] = 0;
    }
    try {
        results['toNW']['outBytes'] = data[1]['outBytes'];
    } catch (e) {
        results['toNW']['outBytes'] = 0;
    }
    try {
        results['toNW']['outPkts'] = data[1]['outPkts'];
    } catch (e) {
        results['toNW']['outPkts'] = 0;
    }
    return results;
}

function swapInEgressData(statData) {
    var resultJSON = {};
    resultJSON['fromNW'] = {};
    resultJSON['toNW'] = {};
    resultJSON['fromNW'] = statData['fromNW'];
    resultJSON['toNW']['inBytes'] = statData['toNW']['outBytes'];
    resultJSON['toNW']['inPkts'] = statData['toNW']['outPkts'];
    resultJSON['toNW']['outBytes'] = statData['toNW']['inBytes'];
    resultJSON['toNW']['outPkts'] = statData['toNW']['inPkts'];
    return resultJSON;
}

function getNetworkStatsSummary(req, res, appData) {
    var srcVN = req.query['srcVN'];
    var destVN = req.query['destVN'];
    var urlLists = [];
    var resultJSON = [];

    getNetworkInGressEgressTrafficStat(srcVN, destVN, appData, function (err, data) {
        if ((null == err) && (data)) {
            var results = formatNetworkStatsSummary(data);
            /* Swap IN/Out Data */
            var resultJSON = swapInEgressData(results);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        } else {
            commonUtils.handleJSONResponse(err, res, null);
        }
    });
}

function sendOpServerResponseByURL(url, req, res, appData) {
    opApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, data);
        }
    });
}

function getVNSummary(fqName, data) {
    var resultJSON = [];
    try {
        uveData = data['value'];
        var vnCnt = uveData.length;
    } catch (e) {
        if ((fqName.split(':')).length == 3) {
            var tempData = {};
            tempData['value'] = [];
            tempData['value'][0] = {};
            tempData['value'][0]['name'] = fqName;
            tempData['value'][0]['value'] = data;
            return tempData;
        }
        return data;
    }
    for (var i = 0, j = 0; i < vnCnt; i++) {
        try {
            if (false == isServiceVN(uveData[i]['name'])) {
                resultJSON[j++] = uveData[i];
            }
        } catch (e) {
        }
    }
    return {'value': resultJSON};
}

function getVirtualNetworksSummary(req, res, appData) {
    var fqNameRegExp = req.query['fqNameRegExp'];
    var url = '/analytics/uves/virtual-network/';
    var fqn = fqNameRegExp;

    var fqNameArr = fqNameRegExp.split(':');
    if (fqNameArr) {
        var len = fqNameArr.length;
        if (len == 3) {
            /* Exact VN */
            if (true == isServiceVN(fqNameRegExp)) {
                commonUtils.handleJSONResponse(null, res, {});
                return;
            }
        }
        if ((fqNameArr[len - 1] != '*') &&
            (len < 3)) {
            fqn = fqNameRegExp + ':*';
        }
    }

    url += fqn + '?flat';
    opApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, {});
        } else {
            var resultJSON = getVNSummary(fqNameRegExp, data);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        }
    });
}

function getVirtualMachine(req, res, appData) {
    var fqNameRegExp = req.query['fqNameRegExp'];
    var url = '/analytics/uves/virtual-machine/' + fqNameRegExp;
    sendOpServerResponseByURL(url, req, res, appData);
}


function getVirtualMachinesSummary(req, res, appData) {
    var reqPostData = req.body,
        kfilt = reqPostData['kfilt'], cfilt = reqPostData['cfilt'],
        url = '/analytics/uves/virtual-machine',
        opServerPostData = {};

    if (kfilt != null && kfilt != '') {
        opServerPostData['kfilt'] = kfilt.split(",");
    }

    if (cfilt != null && cfilt != '') {
        opServerPostData['cfilt'] = cfilt.split(",");
    }

    opApiServer.apiPost(url, opServerPostData, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, data);
        }
    });
}

function getVirtualInterfacesSummary(req, res, appData) {
    var reqPostData = req.body,
        parentType = reqPostData['parentType'],
        kfilt = reqPostData['kfilt'], cfilt = reqPostData['cfilt'],
        projectFQN = reqPostData['projectFQN'],
        networkFQN = reqPostData['networkFQN'],
        vmiUrl = '/analytics/uves/virtual-machine-interface',
        vnUrl = '/analytics/uves/virtual-network',
        opServerPostData = {};

    if (cfilt != null && cfilt != '') {
        opServerPostData['cfilt'] = cfilt.split(",");
    }

    if (parentType == 'project') {
        vmiUrl += "/" + projectFQN + ":*";

        if (cfilt != null && cfilt != '') {
            vmiUrl += '?cfilt=' + cfilt;
        }

        opApiServer.apiGet(vmiUrl, appData, function (err, data) {
            if (err || (null == data)) {
                commonUtils.handleJSONResponse(err, res, null);
            } else {
                commonUtils.handleJSONResponse(null, res, data);
            }
        });
    } else if (parentType == 'virtual-network') {
        vnUrl += '/' + networkFQN + '?cfilt=UveVirtualNetworkAgent:interface_list';
        opApiServer.apiGet(vnUrl, appData, function (err, vnJSON) {
            var interfaceList = [];
            if (err || (null == vnJSON)) {
                commonUtils.handleJSONResponse(err, res, null);
            } else if (vnJSON['UveVirtualNetworkAgent'] != null) {
                interfaceList = vnJSON['UveVirtualNetworkAgent']['interface_list'];
                opServerPostData['kfilt'] = interfaceList;

                opApiServer.apiPost(vmiUrl, opServerPostData, appData,
                                    function (err, data) {
                    if (err || (null == data)) {
                        commonUtils.handleJSONResponse(err, res, null);
                    } else {
                        commonUtils.handleJSONResponse(null, res, data);
                    }
                });
            } else {
                commonUtils.handleJSONResponse(null, res, []);
            }
        });
    } else if (parentType == 'virtual-machine') {
        opServerPostData['kfilt'] = kfilt.split(",");

        opApiServer.apiPost(vmiUrl, opServerPostData, appData,
                            function (err, data) {
            if (err || (null == data)) {
                commonUtils.handleJSONResponse(err, res, null);
            } else {
                commonUtils.handleJSONResponse(null, res, data);
            }
        });
    }
}

function isServiceVN(vnName) {
    if (null == isServiceVN) {
        return false;
    }
    var vnNameArr = vnName.split(':');
    var vnNameLen = vnNameArr.length;

    if (3 != vnNameLen) {
        return false;
    }
    if ((-1 == vnNameArr[2].indexOf('svc-vn-right')) &&
        (-1 == vnNameArr[2].indexOf('svc-vn-left')) &&
        (-1 == vnNameArr[2].indexOf('svc-vn-mgmt'))) {
        return false;
    }
    return true;
}

function isAllowedVN(fqName, vnName) {
    if ((null == vnName) || (null == fqName)) {
        return false;
    }

    if (true == isServiceVN(vnName)) {
        return false;
    }

    var vnNameArr = vnName.split(':');
    var fqNameArr = fqName.split(':');
    var fqLen = fqNameArr.length;
    if (3 == fqLen) {
        /* VN */
        if (fqName == vnName) {
            return true;
        }
    } else if (2 == fqLen) {
        /* Project */
        if ((vnNameArr[0] == fqNameArr[0]) && (vnNameArr[1] == fqNameArr[1])) {
            return true;
        }
    } else if (1 == fqLen) {
        if ('*' == fqNameArr[0]) {
            return true;
        }
        if (vnNameArr[0] == fqNameArr[0]) {
            return true;
        }
    }
    return false;
}

function getVMListByVMIList(vmiList, appData, callback) {
    var insertedVMList = {};
    var insertedVMIList = {};
    var vmiListObjArr = [];
    var vmiUUID = null;
    var vmList = [];
    var vmiReqUrl = null;

    if (null == vmiList) {
        callback(null, null);
        return;
    }
    var vmiCnt = vmiList.length;
    var vmiUUIDList = [];
    for (var i = 0; i < vmiCnt; i++) {
        vmiUUID = vmiList[i]['uuid'];
        if (null == insertedVMIList[vmiUUID]) {
            vmiUUIDList.push(vmiUUID);
            // vmiReqUrl = '/virtual-machine-interface/' + vmiUUID;
            // commonUtils.createReqObj(vmiListObjArr, vmiReqUrl,
            //     global.HTTP_REQUEST_GET, null, null,
            //     null, appData);
            // insertedVMIList[vmiUUID] = vmiUUID;
        }
    }

    var chunk = 200,
        tmpArray = [],
        uuidCnt = vmiUUIDList.length;
    for (var i = 0, j = uuidCnt; i < j; i += chunk) {
        tmpArray = vmiUUIDList.slice(i, i + chunk);
        var reqUrl = '/virtual-machine-interfaces?detail=true&obj_uuids=' +
            tmpArray.join(',') +
            '&fields=virtual_machine_refs';

        commonUtils.createReqObj(vmiListObjArr, reqUrl, null, null, null, null,
            appData);
    }

    async.map(vmiListObjArr, commonUtils.getServerResponseByRestApi(configApiServer, true),
        function (err, data) {
            if (null != data && data.length > 0) {
                var resultVMIList = [];
                for (var i = 0; i < data.length; i++) {
                    resultVMIList = resultVMIList.concat(data[i]['virtual-machine-interfaces']);
                }
                for (var i = 0; i < resultVMIList.length; i++) {
                    if (resultVMIList[i]['virtual-machine-interface'] &&
                        resultVMIList[i]['virtual-machine-interface']['virtual_machine_refs']) {
                        var vmRefs = resultVMIList[i]['virtual-machine-interface']['virtual_machine_refs'];
                        for (var j = 0; j < vmRefs.length; j++) {
                            var vmUUID = vmRefs[j]['uuid'];
                            if (null == insertedVMList[vmUUID]) {
                                vmList.push(vmUUID);
                                insertedVMList[vmUUID] = vmUUID;
                            }
                        }
                    }

                }
            }
            callback(null, vmList);
        });

    // async.map(vmiListObjArr,
    //     commonUtils.getServerResponseByRestApi(configApiServer, true),
    //     function (err, data) {
    //         console.log("response");
    //         console.log(data[0]['virtual-machine-interfaces'][0]);
    //
    //         if (null != data) {
    //             var vmiRespCnt = data.length;
    //             for (var i = 0; i < vmiRespCnt; i++) {
    //                 if (data[i] && data[i]['virtual-machine-interface'] &&
    //                     data[i]['virtual-machine-interface']['virtual_machine_refs']) {
    //                     vmRefs =
    //                         data[i]['virtual-machine-interface']['virtual_machine_refs'];
    //                     var vmRefsCnt = vmRefs.length;
    //                     for (var j = 0; j < vmRefsCnt; j++) {
    //                         var vmUUID = vmRefs[j]['uuid'];
    //                         if (null == insertedVMList[vmUUID]) {
    //                             vmList.push(vmUUID);
    //                             insertedVMList[vmUUID] = vmUUID;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         callback(null, vmList);
    //     });
}

function getVMListByType(type, configData, appData, callback) {
    var emptyList = [];

    if (type == 'vn') {
        /*
         if (isServiceVN((configData['virtual-network']['fq_name']).join(':'))) {
         callback(null, null);
         return;
         }
         */
        if ((null == configData['virtual-network']) ||
            (null ==
            configData['virtual-network']['virtual_machine_interface_back_refs'])) {
            callback(null, emptyList);
            return;
        }

        var vmiBackRefsList =
            configData['virtual-network']['virtual_machine_interface_back_refs'];
        getVMListByVMIList(vmiBackRefsList, appData, function (err, vmList) {
            if (vmList && vmList.length > 1) {
                vmList.sort();
            }
            callback(err, vmList);
        });
    } else if (type == 'project') {
        if ((null == configData['project']) ||
            (null == configData['project']['virtual_machine_interfaces'])) {
            callback(null, emptyList);
            return;
        }

        var vmiList = configData['project']['virtual_machine_interfaces'];
        getVMListByVMIList(vmiList, appData, function (err, vmList) {
            if (vmList && vmList.length > 1) {
                vmList.sort();
            }
            callback(null, vmList);
        });
    }
}

function getVMDetails(req, res, appData) {
    var resultJSON = [];
    var fqnUUID = req.query['fqnUUID'];
    var type = req.query['type'];
    var url = null;
    if (type == 'vn') {
        url = '/virtual-network/' + fqnUUID;
    } else if (type == 'project') {
        url = '/project/' + fqnUUID;
    }

    if (null == type) {
        err = new
            appErrors.RESTServerError('type is required');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }

    var opServerUrl = '/analytics/uves/virtual-machine';
    configApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        getVMListByType(type, data, appData, function (err, vmOpList) {
            if (err || (null == vmOpList) || (!vmOpList.length)) {
                commonUtils.handleJSONResponse(err, res, resultJSON);
                return;
            }
            var postData = {};
            postData['kfilt'] = vmOpList;
            opApiServer.apiPost(opServerUrl, postData, appData, function (err, data) {
                if (err || (null == data)) {
                    commonUtils.handleJSONResponse(err, res, resultJSON);
                    return;
                }
                commonUtils.handleJSONResponse(null, res, data);
            });
        });
    });
}

function processVirtualNetworksReqByLastUUID(lastUUID, count, keyToCompare,
                                             vnList, filtUrl, tenantList,
                                             appData, callback) {
    getOpServerPagedResponseByLastKey(lastUUID, count, keyToCompare, vnList,
                                      'virtual-network', filtUrl, tenantList,
                                      appData, function (err, data) {
            callback(err, data);
    });
}

function processInstanceReqByLastUUID(lastUUID, count, keyToCompare, VMList,
                                      filtUrl, appData, callback) {
    getOpServerPagedResponseByLastKey(lastUUID, count, keyToCompare, VMList,
                                      'virtual-machine', filtUrl, null,
                                      appData, function (err, data) {
        if (data && data['data'] && (-1 == count)) {
            data = data['data'];
        }
        callback(err, data);
    });
}

function getOpServerPagedResponseByLastKey(lastKey, count, keyToCompare, list,
                                           type, filtUrl, tenantList, appData, callback) {
    var found = false, retLastUUID = null,
        resultJSON = {}, typeStr = type + 's',
        url = '/analytics/uves/' + type + '/*?kfilt=',
        index, listLength, totalCount;

    resultJSON['data'] = [];
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;

    if (list[typeStr] != null) {
        list = list[typeStr];
    }

    index = nwMonUtils.getnThIndexByLastKey(lastKey, list, keyToCompare);
    if (index == -2) {
        callback(null, resultJSON);
        return;
    }

    try {
        var listLength = list.length;
    } catch (e) {
        callback(null, resultJSON);
        return;
    }

    if (listLength == index) {
        /* We are already at end */
        callback(null, resultJSON);
        return;
    }

    if (-1 == count) {
        totalCount = listLength;
    } else {
        totalCount = index + 1 + parseInt(count);
    }

    if (totalCount < listLength) {
        if(keyToCompare != null) {
            retLastUUID = list[totalCount - 1][keyToCompare];
        } else {
            retLastUUID = list[totalCount - 1];
        }
    }

    for (var i = index + 1; i < totalCount; i++) {
        if (list[i]) {
            if (i != index + 1) {
                url += ',';
            }
            if(keyToCompare != null) {
                url += list[i][keyToCompare];
            } else {
                url += list[i];
            }
            found = true;
        }
    }

    if (false == found) {
        callback(null, resultJSON);
        return;
    }
    //filtURL already contains the url, /analytics/uves, so remove this and then append to our url
    var kfiltUrlKey = '/*?kfilt=',
        splArr = url.split(kfiltUrlKey),
        postData = {};

    if (splArr.length == 2) {
        postData['kfilt'] = splArr[1].split(',');
        url = splArr[0];
    }

    if (filtUrl) {
        var cfiltArr = filtUrl.split('cfilt=');
        if (cfiltArr.length == 2) {
            postData['cfilt'] = cfiltArr[1].split(',');
        }
    }
    opApiServer.apiPost(url, postData, appData, function (err, data) {
        if (data && data['value']) {
            var resCnt = data['value'].length;
            if (resCnt < count) {
                /* We have got less number of elements compared to whatever we
                 * sent to opSrever in kfilt, so these entries may be existing
                 * in API Server, but not in opServer, so add these in the
                 * response 
                 */
                var tempResData = {}, vnName;
                for (i = 0; i < resCnt; i++) {
                    if (null == data['value'][i]) {
                        continue;
                    }
                    vnName = data['value'][i]['name'];
                    tempResData[vnName] = vnName;
                }
                var kFiltLen = postData['kfilt'].length;
                for (i = 0; i < kFiltLen; i++) {
                    vnName = postData['kfilt'][i];
                    if (null == tempResData[vnName]) {
                        tempResData[vnName] = vnName;
                        data['value'].push({'name': vnName, 'value': {}});
                    }
                }
            }
        }
        resultJSON['data'] = data;
        resultJSON['lastKey'] = retLastUUID;
        if (null == retLastUUID) {
            resultJSON['more'] = false;
        } else {
            resultJSON['more'] = true;
        }
        callback(err, resultJSON);
    });
}

function createEmptyPaginatedData() {
    var resultJSON = {};
    resultJSON['data'] = {};
    resultJSON['data']['value'] = [];
    resultJSON['more'] = false;
    resultJSON['lastKey'] = null;
    return resultJSON;
}

function getInstanceDetailsByFqn(req, appData, callback) {
    var fqnUUID = req.query['fqnUUID'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var url = null;
    var filtUrl = null;

    var resultJSON = createEmptyPaginatedData();

    if (type == 'vn') {
        url = '/virtual-network/' + fqnUUID;
    } else if (type == 'project') {
        url = '/project/' + fqnUUID;
    }

    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    configApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            callback(err, resultJSON);
            return;
        }
        getVMListByType(type, data, appData, function (err, vmOpList) {
            if (err || (null == vmOpList) || (!vmOpList.length)) {
                callback(err, resultJSON);
                return;
            }
            var data = nwMonUtils.makeUVEList(vmOpList);
            processInstanceReqByLastUUID(lastUUID, count, 'name', data, filtUrl,
                                         appData, function (err, data) {
                    callback(err, data);
            });
        });
    });
}

function getVNListByProject(projectFqn, appData, callback) {
    aggConfigVNList(projectFqn, appData, function (err, vnList) {
        callback(err, vnList);
    });
}

function getVirtualNetworksDetailsByFqn(fqn, lastUUID, count, res, appData) {
    var fqn = res.req.query['fqn'];
    var filtUrl = null;

    var filtData = nwMonUtils.buildBulkUVEUrls(res.req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    var fqnArr = fqn.split(':');
    var len = fqnArr.length;
    var resultJSON = createEmptyPaginatedData();

    if (2 == len) {
        /* Project */
        getVNListByProject(fqn, appData, function (err, vnList, tenantList) {
            if (err || (null == vnList) || (!vnList.length)) {
                commonUtils.handleJSONResponse(err, res, resultJSON);
                return;
            }

            processVirtualNetworksReqByLastUUID(lastUUID, count, 'name', vnList,
                                                filtUrl, tenantList, appData,
                                                function (err, data) {
                    commonUtils.handleJSONResponse(err, res, data);
                });
        });
    }
}

function aggConfigVNList(fqn, appData, callback) {
    var vnList = [], dataObjArr = [], req = appData.authObj.req;
    var configURL = null;
    if (null != fqn) {
        configURL = '/virtual-networks?parent_type=project&parent_fq_name_str=' + fqn;
        getVNConfigList(configURL, appData, callback);
    } else {
        var getVNCB = virtualNetworkDetailsMap[req.session.loggedInOrchestrationMode];
        if (null != getVNCB) {
            getVNCB(appData, callback);
            return;
        }
        getVirtualNetworksForUser(appData, callback)
    }
}
/*
 * This function just calls the config server to get the virtual networks
 */
function getVNConfigList(configURL, appData, callback) {
    configApiServer.apiGet(configURL, appData, function (err, configVNData) {
        if (err || (null == configVNData)) {
            callback(err, null);
            return;
        }
        if ((null != configVNData) &&
            (null != configVNData['virtual-networks'])) {
            vnList = getFqNameList(configVNData['virtual-networks']);
        }
        if (0 != vnList.length) {
            vnList.sort(infraCmn.sortUVEList);
        }
        callback(err, vnList, null);
    });
}
/*
 * This function is to get the virtual networks based on the user name
 */
function getVirtualNetworksForUser(appData, callback) {
    var vnList = [], dataObjArr = [];
    var configURL = null;
    authApi.getTenantList(appData.authObj.req, appData,
        function (error, tenantList) {
            var cookieDomain =
                commonUtils.getValueByJsonPath(appData,
                                               'authObj;req;cookies;domain',
                                               null, false);
            var tenantListLen = (tenantList['tenants'] != null) ? (tenantList['tenants'].length) : 0;
            for (var i = 0; i < tenantListLen; i++) {
                configURL =
                    '/virtual-networks?parent_type=project&parent_fq_name_str=' +
                    cookieDomain + ':' + tenantList['tenants'][i]['name'];
                commonUtils.createReqObj(dataObjArr, configURL,
                    global.HTTP_REQUEST_GET, null, null, null,
                    appData);
            }
            async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                       true),
                function (err, configVNData) {
                    if (err || (null == configVNData)) {
                        callback(err, vnList);
                        return;
                    }
                    var vnArray = [], configVNDataLen = configVNData.length;
                    for (var i = 0; i < configVNDataLen; i++) {
                        var vnList = commonUtils.getValueByJsonPath(configVNData[i], 'virtual-networks', []);
                        vnArray = vnArray.concat(vnList);
                    }
                    configVNData['virtual-networks'] = vnArray;
                    vnList = getFqNameList(configVNData['virtual-networks']);
                    if (0 != vnList.length) {
                        vnList.sort(infraCmn.sortUVEList);
                    }
                    callback(err, vnList, tenantList);
                });
        });
}
/*
 * This function takes the data, parses it and checks for fqName
 * and constructs the fqName array
 */
function getFqNameList(data) {
    var vnList = [], vnNmae = null, dataLen = (data != null) ? (data.length) : 0;
    if (null != data) {
        for (var i = 0; i < dataLen; i++) {
            try {
                vnName =
                    data[i]['fq_name'].join(':');
            } catch (e) {
                continue;
            }
            vnList.push({'name': vnName});
        }
    }
    return vnList;
}
function getVirtualNetworksDetails(req, res, appData) {
    var fqn = req.query['fqn'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var filtUrl = null;
    var vnList = [];
    var dataObjArr = [];

    var resultJSON = createEmptyPaginatedData();
    var filtData = nwMonUtils.buildBulkUVEUrls(res.req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    if (null == count) {
        count = -1;
    } else {
        count = parseInt(count);
    }
    if (null != fqn) {
        getVirtualNetworksDetailsByFqn(fqn, lastUUID, count, res, appData);
        return;
    }
    aggConfigVNList(null, appData, function (err, vnList, tenantList) {
        if (0 == vnList.length) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        processVirtualNetworksReqByLastUUID(lastUUID, count, 'name', vnList,
                                            filtUrl, tenantList, appData,
                                            function (err, data) {
                commonUtils.handleJSONResponse(err, res, data);
        });
    });
}

//Returns the list of virtual networks for calculating the 
//vn count in Infra Dashboard
function getVirtualNetworksList(req, res, appData) {
    var reqPostData = req.body;
    var url = '/analytics/uves/virtual-networks?cfilt=UveVirtualNetworkAgent';
    opApiServer.apiGet(url, appData, function (error, data) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        commonUtils.handleJSONResponse(error, res, data);
    });
}

function getInstanceDetails(req, res, appData) {
    var getVMCB = instanceDetailsMap[req.session.loggedInOrchestrationMode];
    if (null != getVMCB) {
        getVMCB(req, appData, function (err, instDetails) {
            commonUtils.handleJSONResponse(err, res, instDetails);
            return;
        });
        return;
    }
    getInstancesDetailsForUser(req, appData, function (err, instDetails) {
        commonUtils.handleJSONResponse(err, res, instDetails);
        return;
    });
}
/*
 * This function is to get the Virtual Machines
 * details of the particular vRouter
 */
function getInstanceDetailsForVRouter (req, res, appData) {
    var vRouterName = req.query['vRouter'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var filtUrl = null;
    var resultJSON = createEmptyPaginatedData();
    if (null == vRouterName) {
        err = new appErrors.RESTServerError('vRouter is required');
        commonUtils.handleJSONResponse(err, res, resultJSON);
        return;
    }
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    var url = '/analytics/uves/vrouter/'+vRouterName+'?flat';
    opApiServer.apiGet(url, appData, function (err, data) {
        if(err || null == data) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var vmUUIDArr = [];
        if(data['VrouterAgent'] != null &&
            data['VrouterAgent']['virtual_machine_list'] != null) {
            vmUUIDArr = data['VrouterAgent']['virtual_machine_list'];
            vmUUIDArr.sort(function (vmUUID1, vmUUID2){
                if(vmUUID1 > vmUUID2){
                    return 1;
                } else if (vmUUID1 < vmUUID2) {
                    return -1;
                }
                return 0;
            });
            processInstanceReqByLastUUID(lastUUID, count, null, vmUUIDArr, filtUrl,
                                         appData, function (err, instDetails) {
                    commonUtils.handleJSONResponse(err, res, instDetails);
                    return;
            });
        } else {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
    });
}


/*
 * This function fetch the virtual machines for the Admin role
 */
function getInstanceDetailsForAdmin(req, appData, callback) {
    var fqnUUID = req.query['fqnUUID'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var url = '/analytics/uves/virtual-machines';
    var filtUrl = null;
    var resultJSON = createEmptyPaginatedData();
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    if (null == count) {
        count = -1;
    } else {
        count = parseInt(count);
    }
    if (null != fqnUUID) {
        if (null == type) {
            err = new
                appErrors.RESTServerError('type is required');
            callback(err, resultJSON);
            return;
        }
        return getInstanceDetailsByFqn(req, appData, callback);
    }
    opApiServer.apiGet(url, appData, function (err, data) {
        if (err || (null == data)) {
            callback(err, resultJSON);
            return;
        }
        data.sort(infraCmn.sortUVEList);
        processInstanceReqByLastUUID(lastUUID, count, 'name', data, filtUrl,
                                     appData, callback);
    });
}
/*
 * This function fetch the virtual machines for the User role
 */
function getInstancesDetailsForUser(req, appData, callback) {
    var fqnUUID = req.query['fqnUUID'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var dataObjArr = [];
    var filtUrl = null;
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }
    if (null != fqnUUID) {
        if (null == type) {
            var err = new appErrors.RESTServerError('type is required');
            callback(err, null)
            return;
        }
        getInstanceDetailsByFqn(req, appData, callback);
        return;
    }
    authApi.getTenantList(req, appData, function (err, tenantList) {
        var projectsLen = (tenantList['tenants'] != null) ? (tenantList['tenants'].length) : 0,
            configURL = null;
        for (var i = 0; i < projectsLen; i++) {
            configURL = '/project/' + commonUtils.convertUUIDToString(tenantList['tenants'][i]['id']);
            commonUtils.createReqObj(dataObjArr, configURL, global.HTTP_REQUEST_GET, null, null, null, appData);
        }
        async.map(dataObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet, true), function (err, projectData) {
                if (err || (null == projectData)) {
                    callback(err, null);
                    return;
                }
                var vmiUrl = null, reqArr = [], projectDataLen = projectData.length;
                for (var i = 0; i < projectDataLen; i++) {
                    var itemData = projectData[i]['project'];
                    var vmiLen = (itemData['virtual_machine_interfaces'] != null) ?
                        (itemData['virtual_machine_interfaces'].length) : 0;
                    for (var j = 0; j < vmiLen; j++) {
                        vmiUrl = '/virtual-machine-interface/' + itemData['virtual_machine_interfaces'][j]['uuid'];
                        commonUtils.createReqObj(reqArr, vmiUrl, global.HTTP_REQUEST_GET, null, null, null, appData);
                    }
                }
                if (0 == reqArr.length) {
                    var emptyData = {
                        "data": [],
                        "lastKey": null,
                        "more": false
                    };
                    callback(null, emptyData);
                    return;
                }
                async.map(reqArr,
                          commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                           true), function (error, vmiData) {
                        if (error || (null == vmiData)) {
                            callback(error, null);
                            return;
                        }
                        var vmuuidObjArr = [], vmuuidArr = [], vmiDataLen = vmiData.length;
                        for (var k = 0; k < vmiDataLen; k++) {
                            var itemData = (vmiData[k]['virtual-machine-interface'] != null) ? (vmiData[k]['virtual-machine-interface']) : {},
                                vmiRefsLen = (itemData['virtual_machine_refs'] != null) ? (itemData['virtual_machine_refs'].length) : 0;

                            if (itemData['virtual_machine_refs'] != null) {
                                for (var l = 0; l < vmiRefsLen; l++) {
                                    if (-1 == vmuuidArr.indexOf(itemData['virtual_machine_refs'][l]['uuid'])) {
                                        vmuuidArr.push(itemData['virtual_machine_refs'][l]['uuid']);
                                        vmuuidObjArr.push({name: itemData['virtual_machine_refs'][l]['uuid']});
                                    }
                                }
                            }
                        }
                        vmuuidObjArr.sort(infraCmn.sortUVEList);
                        processInstanceReqByLastUUID(lastUUID, count, 'name',
                                                     vmuuidObjArr, filtUrl,
                                                     appData, function (err, vmdata) {
                                callback(err, vmdata);
                        });
                    });
            });
    });

}

function getStats (req, res, appData)
{

    var reqParams = req.body['data'],
        type = reqParams['type'],
        uuids = reqParams['uuids'],
        whereClauseArray = [], table, context,
        whereFieldName = "name", whereClause;

    if ('virtual-machine' == type) {
        table = 'StatTable.UveVMInterfaceAgent.if_stats';
        context = 'vm';
        whereFieldName = 'vm_uuid';
    } else if ('virtual-network' == type) {
        table = 'StatTable.UveVirtualNetworkAgent.vn_stats';
        context = 'vn';
    } else if ('virtual-machine-interface' == type) {
        table = 'StatTable.UveVMInterfaceAgent.if_stats';
        context = 'vm';
    }

    uuids = uuids.split(',');
    var uuidsLen = uuids.length;
    whereClause = "";
    for (var i = 0; i < uuidsLen; i++) {
        whereClause += "(" + whereFieldName + " = " + uuids[i] + ")";
        if ((uuidsLen > 1) && (i < uuidsLen - 1)) {
            whereClause += " OR ";
        }
    }

    var props = global.STATS_PROP[context];
    var selectArr = [props['inBytes'], props['outBytes'], props['inPkts'],
        props['outPkts'], whereFieldName];

    var qeQuery = qeUtils.formQEQueryData(table, reqParams, selectArr,
                                          whereClause, null);
    var qeQueries = [];
    qeQueries.push(qeQuery);
    flowCache.getFlowSeriesDataByQE(qeQueries, reqParams, appData, context, null,
                                    function (err, qeResp) {
        var resultJSON = [];
        resultJSON[0] =
            {value: commonUtils.getValueByJsonPath(qeResp, '0;data', [])};
        logutils.logger.debug(JSON.stringify(resultJSON));
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

// Handle request to get a JSON of projects for a given domain.
function getProjects(req, res, appData) {
    var url, domain = req.param('domain');
    //Re-check to add domain filtering
    url = "/projects?domain=" + domain;
    configApiServer.apiGet(url, appData, function (error, projectsJSON) {
        commonUtils.handleJSONResponse(error, res, projectsJSON);
    });
}

// Handle request to get a JSON of virtual networks under a given project name.
function getVNetworks(req, res, appData) {
    var url, fqName = req.param('fqname');
    url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + fqName;
    configApiServer.apiGet(url, appData, function (error, vnsJSON) {
        commonUtils.handleJSONResponse(error, res, vnsJSON);
    });
}

function populateName(arr) {

    for (var j = 0; j < arr.length; j++) {
        var currData = arr[j];
        currData['name'] = currData['fq_name'][currData['fq_name'].length - 1];
    }
}

function populateInOutTraffic(vnJSON, trafficJSON, counter) {
    try {
        var inBytes = 0, outBytes = 0, inPkts = 0, outPkts = 0;
        var interVNInBytes = 0, interVNOutBytes = 0, interVNInPkts = 0, interVNOutPkts = 0;
        if (trafficJSON['UveVirtualNetworkAgent']) {
            var inBytesData = trafficJSON['UveVirtualNetworkAgent']['in_bytes'];
            var outBytesData = trafficJSON['UveVirtualNetworkAgent']['out_bytes'];
            var inPktsData = trafficJSON['UveVirtualNetworkAgent']['in_tpkts'];
            var outPktsData = trafficJSON['UveVirtualNetworkAgent']['out_tpkts'];
            if ((inBytesData == null) || (inBytesData['#text'] == null)) {
                inBytes = 0;
            } else {
                inBytes = inBytesData['#text'];
            }
            if ((outBytesData == null) || (outBytesData['#text'] == null)) {
                outBytes = 0;
            } else {
                outBytes = outBytesData['#text'];
            }

            if ((inPktsData == null) || (inPktsData['#text'] == null))
                inPkts = 0;
            else
                inPkts = inPktsData['#text'];
            if ((outPktsData == null) || (outPktsData['#text'] == null))
                outPkts = 0;
            else
                outPkts = outPktsData['#text'];

            var inStatsData = [], outStatsData = [];

            if ((trafficJSON['UveVirtualNetworkAgent']['in_stats'] != null) && (trafficJSON['UveVirtualNetworkAgent']['in_stats']['list'] != null) &&
                (trafficJSON['UveVirtualNetworkAgent']['out_stats'] != null) && (trafficJSON['UveVirtualNetworkAgent']['out_stats']['list'] != null)) {
                var inStatsData = trafficJSON['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats'];
                var outStatsData = trafficJSON['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats'];
                for (var i = 0; i < inStatsData.length; i++) {
                    interVNInBytes += parseInt(inStatsData[i]['bytes']['#text']);
                    interVNInPkts += parseInt(inStatsData[i]['tpkts']['#text']);
                }
                for (var i = 0; i < outStatsData.length; i++) {
                    interVNOutBytes += parseInt(outStatsData[i]['bytes']['#text']);
                    interVNOutPkts += parseInt(outStatsData[i]['tpkts']['#text']);
                }
            }
        }
        populateName([vnJSON['virtual-networks'][counter]]);
        vnJSON["virtual-networks"][counter]['inBytes'] = parseInt(inBytes);
        vnJSON["virtual-networks"][counter]['outBytes'] = parseInt(outBytes);
        vnJSON["virtual-networks"][counter]['inPkts'] = parseInt(inPkts);
        vnJSON["virtual-networks"][counter]['outPkts'] = parseInt(outPkts);
        vnJSON["virtual-networks"][counter]['interVNInBytes'] = interVNInBytes;
        vnJSON["virtual-networks"][counter]['interVNOutBytes'] = interVNOutBytes;
        vnJSON["virtual-networks"][counter]['interVNInPkts'] = interVNInPkts;
        vnJSON["virtual-networks"][counter]['interVNOutPkts'] = interVNOutPkts;
    } catch (err) {
        logutils.logger.error(err.stack);
    }
}

function getProjectData(configObj, callback) {
    var url = configObj.url;
    var appData = configObj.appData;
    var dataObjArr = [];
    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            callback(error);
        } else {
            try {
                var vnJSON = jsonData,
                    uveUrls = [],
                    vnCount = vnJSON["virtual-networks"].length,
                    i, uuid, fq_name, url;
                //logutils.logger.debug("vnJSONStr: " + JSON.stringify(vnJSON));
                if (vnCount != 0) {
                    for (i = 0; i < vnCount; i += 1) {
                        uuid = vnJSON["virtual-networks"][i].uuid;
                        fq_name = vnJSON['virtual-networks'][i].fq_name;
                        url = '/analytics/uves/virtual-network/' + fq_name.join(':');
                        commonUtils.createReqObj(dataObjArr, url,
                                                 null, null, null, null,
                                                 appData);
                        logutils.logger.debug('getProjectDetails URL:', url);
                    }
                    async.map(dataObjArr,
                              commonUtils.getAPIServerResponse(opApiServer.apiGet,
                                                               true),
                              function (err, results) {
                            var i, trafficJSON;
                            if (!err) {
                                for (i = 0; i < vnCount; i += 1) {
                                    trafficJSON = results[i];
                                    populateInOutTraffic(vnJSON, trafficJSON, i);
                                }
                                callback(null, vnJSON);
                            } else {
                                callback(error);
                            }
                        });
                } else {
                    callback(null, vnJSON);
                }
            } catch (error) {
                callback(error);
            }
        }
    });
}

function parseDomainSummary(resultJSON, results) {
    resultJSON = {};
    resultJSON['interVNInBytes'] = 0;
    resultJSON['interVNInPkts'] = 0;
    resultJSON['interVNOutBytes'] = 0;
    resultJSON['interVNOutPkts'] = 0;
    resultJSON['inBytes'] = 0;
    resultJSON['inPkts'] = 0;
    resultJSON['outBytes'] = 0;
    resultJSON['outPkts'] = 0;
    try {
        var projCount = results.length;
        for (var i = 0; i < projCount; i++) {
            vnData = results[i]['virtual-networks'];
            vnCount = vnData.length;
            for (var j = 0; j < vnCount; j++) {
                try {
                    resultJSON['interVNInBytes'] = parseInt(resultJSON['interVNInBytes']) +
                        parseInt(vnData[j]['interVNInBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['interVNInPkts'] = parseInt(resultJSON['interVNInPkts']) +
                        parseInt(vnData[j]['interVNInPkts']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['interVNOutBytes'] = parseInt(resultJSON['interVNOutBytes']) +
                        parseInt(vnData[j]['interVNOutBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['interVNOutPkts'] = parseInt(resultJSON['interVNOutPkts']) +
                        parseInt(vnData[j]['interVNOutPkts']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['inBytes'] = parseInt(resultJSON['inBytes']) +
                        parseInt(vnData[j]['inBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['inPkts'] = parseInt(resultJSON['inPkts']) +
                        parseInt(vnData[j]['interVNInBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['inPkts'] = parseInt(resultJSON['interVNInBytes']) +
                        parseInt(vnData[j]['interVNInBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['outBytes'] = parseInt(resultJSON['outBytes']) +
                        parseInt(vnData[j]['outBytes']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
                    resultJSON['outPkts'] = parseInt(resultJSON['outPkts']) +
                        parseInt(vnData[j]['outPkts']);
                } catch (e) {
                    logutils.logger.error("In parseDomainSummary(), JSON Parse error:" + e);
                }
            }
        }
    } catch (e) {
        logutils.logger.error("In parseDomainSummary(), JSON parse error" + e);
    }
    return resultJSON;
}

function getNetworkDomainSummary(req, res, appData) {
    var configObjArr = [];
    var domain = req.param('fq-name');
    var results = {};
    var urlLists = [];
    var j = 0;
    var resultJSON = {};

    var url = '/projects?domain=' + domain;
    /* First get the project details in this domain */
    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        try {
            var projects = jsonData['projects'];
            var projectsCount = projects.length;
            for (var i = 0; i < projectsCount; i++) {
                if ((projects[i]['fq_name'][1] == 'service') ||
                    (projects[i]['fq_name'][1] == 'default-project') ||
                    (projects[i]['fq_name'][1] == 'invisible_to_admin')) {
                    continue;
                }
                url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + projects[i]['fq_name'].join(':');
                configObjArr[j] = {};
                configObjArr[j]['url'] = url;
                configObjArr[j]['appData'] = appData;
                j++;
            }
            async.map(configObjArr, getProjectData, function (err, results) {
                resultJSON = parseDomainSummary(resultJSON, results);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            });
        } catch (e) {
            logutils.logger.error("getNetworkDomainSummary JSON parse error: " + e.stack);
            commonUtils.handleJSONResponse(null, res, results);
        }
    });
}

function parseVNUveData(resultJSON, vnUve) {
    try {
        resultJSON['intfList'] =
            vnUve['UveVirtualNetworkAgent']['interface_list']['list']['element'];
    } catch (e) {
    }
    try {
        resultJSON['aclRuleCnt'] =
            vnUve['UveVirtualNetworkAgent']['total_acl_rules'][0][0]['#text'];
    } catch (e) {
        resultJSON['aclRuleCnt'] = 0;
    }
    try {
        resultJSON['intfCnt'] = resultJSON['intfList'].length;
    } catch (e) {
        resultJSON['intfCnt'] = 0;
    }
    try {
        resultJSON['vmCnt'] =
            vnUve['UveVirtualNetworkAgent']['virtualmachine_list']['list']['@size'];
    } catch (e) {
        resultJSON['vmCnt'] = 0;
    }
    try {
        resultJSON['partiallyConnectedNws'] =
            vnUve['UveVirtualNetworkConfig']['partially_connected_networks']['list']['element'];
    } catch (e) {
    }
}

function parseNetworkDetails(resultJSON, appData, jsonData, callback) {
    var vmRefs = [], vmRefsCount = 0,
        urlLists = [], dataObjArr = [];

    if (null == jsonData) {
        return;
    }

    resultJSON['vmCnt'] = 0;
    resultJSON['intfCnt'] = 0;
    resultJSON['aclRuleCnt'] = 0;
    resultJSON['policyList'] = [];
    resultJSON['intfList'] = {};
    resultJSON['partiallyConnectedNws'] = {};

    try {
        resultJSON['fq-name'] = jsonData['fq_name'].join(':');
        var nwPolicyRefs = jsonData['network_policy_refs'],
            policyCount = nwPolicyRefs.length;
        for (i = 0; i < policyCount; i++) {
            resultJSON['policyList'][i] = {};
            resultJSON['policyList'][i]['name'] = nwPolicyRefs[i]['to'].join(':');
            resultJSON['policyList'][i]['uuid'] = nwPolicyRefs[i]['uuid'];
        }
        /* Now get the rest of the data from UVE */
        var url = '/analytics/uves/virtual-network/' + resultJSON['fq-name'];
        opApiServer.apiGet(url, appData, function (err, vnUve) {
            parseVNUveData(resultJSON, vnUve);
            callback(resultJSON);
        });
    } catch (e) {
        logutils.logger.debug("In parseNetworkDetails(): VM JSON Parse error:" + e);
        callback(resultJSON);
    }
}

function getNetworkDetails(req, res, appData) {
    var resultJSON = {},
        uuid = req.param('uuid'),
        url = '/virtual-network/' + uuid;

    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        parseNetworkDetails(resultJSON, appData, jsonData['virtual-network'],
            function (results) {
                commonUtils.handleJSONResponse(null, res, results);
            });
    });
}


/**
 * Redis 
 */

function generateRequestUUID() {
    var s = [], itoh = '0123456789ABCDEF';
    for (var i = 0; i < 36; i++) {
        s[i] = Math.floor(Math.random() * 0x10);
    }
    s[14] = 4;
    s[19] = (s[19] & 0x3) | 0x8;
    for (var i = 0; i < 36; i++) {
        s[i] = itoh[s[i]];
    }
    s[8] = s[13] = s[18] = s[23] = s[s.length] = '-';
    s[s.length] = (new Date()).getTime();
    return s.join('');
};

function saveQueryResult2Redis(resultData, total, queryId, chunkSize, sort, queryJSON) {
    var endRow;
    if (sort != null) {
        redisClient.set(queryId + ":sortStatus", JSON.stringify(sort));
    }

    if (total == 0) {
        redisClient.set(queryId + ':chunk1', JSON.stringify({data: [], total: 0, queryJSON: queryJSON}));
        redisClient.set(queryId, JSON.stringify({data: [], total: 0, queryJSON: queryJSON}));
    } else {
        for (var j = 0, k = 1; j < total; k++) {
            endRow = k * chunkSize;
            if (endRow > resultData.length) {
                endRow = resultData.length;
            }
            var spliceData = resultData.slice(j, endRow);

            var redisKey = queryId + ':chunk' + k,
                dataJSON = {data: spliceData, total: total, queryJSON: queryJSON, chunk: k, chunkSize: chunkSize, serverSideChunking: true},
                workerData = {redisKey: redisKey, dataJSON: dataJSON};

            writeData2Redis(workerData);

            j = endRow;
        }
    }
};

function writeData2Redis(workerData) {
    var redisKey = workerData['redisKey'],
        dataJSON = workerData['dataJSON'];

    var jsonWorker = new Worker(function () {
        this.onmessage = function (event) {
            var jsonData = event.data;
            try {
                var jsonStr = JSON.stringify(jsonData);
                postMessage({error: null, jsonStr: jsonStr});
            } catch (error) {
                postMessage({error: error});
            }
        };
    });

    jsonWorker.onmessage = function (event) {
        var workedData = event.data;
        if (workedData.error == null) {
            var jsonStr = workedData['jsonStr']

            //logutils.logger.debug(redisKey + " start writing data to redis");
            redisClient.set(redisKey, jsonStr, function (rError) {
                if (rError) {
                    logutils.logger.error("QE Redis Write Error: " + rError);
                }
                //logutils.logger.debug(redisKey + " end writing data to redis");
            });
        } else {
            logutils.logger.error("QE JSON Stringify Error: " + workedData.error);
        }
    }

    jsonWorker.postMessage(dataJSON);
}


/**
 * Creates a new object data structure which can store and retrieve objects with
 * keys for up to size of 'size' and new insertion should delete the
 * oldest entry.
 * @param size
 */
function FixedHash(size) {
    var self = this;
    this.store = {};
    this.keyStore = [];
    this.size = size ? size : 10;

    this.has = function(key) {
        return self.store.hasOwnProperty(key);
    };
    
    this.ensureSpace = function() {
        if (self.keyStore.length == self.size) {
            //Remove the first key inserted from keyStore and Store.
            delete self.store[self.keyStore.shift()];
        }
    }
    
    this.insert = function(key, obj) {
        console.log("insert!!", self.store[key], obj);
        self.ensureSpace();
        self.deleteItem(key);
        self.keyStore.push(key);
        self.store[key] = obj;
    };

    this.push = function(key, obj) {
        self.ensureSpace();
        if (self.store.hasOwnProperty(key)) {
            if( Object.prototype.toString.call( self.store[key] ) === '[object Array]' ) {
                self.store[key] = self.store[key].concat(obj);
            } else {
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) {
                        self.store[attr] = obj[attr];
                    }
                }
            }
        } else {
            self.keyStore.push(key);
            self.store[key] = obj;
        }

    };

    //If key is present return the record, else return empty
    this.get = function(key) {
        return self.store.hasOwnProperty(key) ? self.store[key] : [];
    };

    this.getAllItems = function() {
        return self.store;
    }

    this.deleteItem = function(key) {
        var idx = self.keyStore.indexOf(key);
        if ( idx > -1) {
            self.keyStore.splice(idx, 1);
            delete self.store[key];
        }
    }
}

var RESPONSE_DATA_STORE = new FixedHash(10), //Hash of List to keep the records based on reqId
    OPSERVER_PROCESS_QUEUE = new FixedHash(10), //Hash of Queue to be used for Analytics async.each scenarios. Indexed with reqId
    REQ_STATUS_QUEUE = new FixedHash(10); //Stores processing status for each reqId.

/*get Instance list API */

function getInstancesListFromConfig(req, appData, callback) {
    var fqnUUID = req.body['fqnUUID'];
    var type = req.query['type'];
    var url = null;

    var reqId = req.body['id'];

    console.log("Config vm list request :");

    if (null != fqnUUID) {
        if (type == 'vn') {
            url = '/virtual-network/' + fqnUUID;
        } else if (type == 'project') {
            url = '/project/' + fqnUUID;
        }

        configApiServer.apiGet(url, appData, function (err, configFQNData) {
            if (err || (null == configFQNData)) {
                callback(err, []);
                return;
            }
            getVMListByType(type, configFQNData, appData, function (err, configVMList) {
                if (err || (null == configVMList) || (!configVMList.length)) {
                    callback(err, []);
                    return;
                }

                if (configVMList.length != 0) {
                    //Sorting the UUID list so the order remains the same always.
                    configVMList.sort(function (s1, s2) {
                        return (s1 > s2) - (s1 < s2)
                    });

                    RESPONSE_DATA_STORE.push(reqId, configVMList);
                }
                
                callback(err, configVMList);

            });
        });
    } else {
        var dataObjArr = [];
        authApi.getTenantList(req, appData, function (err, tenantList) {
            var projectsLen = (tenantList['tenants'] != null) ? (tenantList['tenants'].length) : 0,
                configURL = null;
            for (var i = 0; i < projectsLen; i++) {
                configURL = '/project/' + commonUtils.convertUUIDToString(tenantList['tenants'][i]['id']);
                commonUtils.createReqObj(dataObjArr, configURL, global.HTTP_REQUEST_GET, null, null, null, appData);
            }
            async.map(dataObjArr, commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                function (err, projectData) {
                    if (err || (null == projectData)) {
                        callback(err, null);
                        return;
                    }
                    var projectDataLen = projectData.length, vmiList = [];
                    for (var i = 0; i < projectDataLen; i++) {
                        var itemData = projectData[i]['project'];
                        if (itemData['virtual_machine_interfaces'] != null){
                            vmiList = vmiList.concat(itemData['virtual_machine_interfaces']);
                        }
                    }

                    getVMListByVMIList(vmiList, appData, function (err, configVMList) {
                        if (configVMList && configVMList.length > 1) {
                            configVMList.sort();
                        }

                        RESPONSE_DATA_STORE.push(reqId, configVMList);
                        
                        callback(err, configVMList);

                    });
                });
        });
    }

}

function getInstancesListFromAnalytics(req, appData, callback) {
    var reqId = req.body['id'];
    var fqn = req.body['FQN'];
    var opUrl, opUri = '/analytics/uves/virtual-network/', opUriQuery = '?cfilt=UveVirtualNetworkAgent:virtualmachine_list';

    if (null != fqn) {
        if (type == 'vn') {
            opUrl = opUri + fqn + opUriQuery;
        } else if (type == 'project') {
            //For type project, we will get all networks under project by appending :* to fqn
            opUrl = opUri + fqn + ":*" + opUriQuery;
        }

        opApiServer.apiGet(opUrl, appData, function(err, response) {
            if (err || (null == response)) {
                callback(err, []);
                return;
            }
            var opVMList = [];
            if (type == 'vn') {
                if (response.hasOwnProperty('UveVirtualNetworkAgent')) {
                    opVMList = opVMList.concat(response['UveVirtualNetworkAgent']['virtualmachine_list']);
                }
            } else if (type == 'project') {
                if (response['value'].length > 0) {
                    for (var i = 0; i < response['value'].length; i++) {
                        if (response['value'][i]['value'].hasOwnProperty('UveVirtualNetworkAgent')) {
                            opVMList = opVMList.concat(response['value'][i]['value']['UveVirtualNetworkAgent']['virtualmachine_list']);
                        }
                    }
                }
            }
            if (opVMList.length != 0) {
                //Sorting the UUID list so the order remains the same always.
                opVMList.sort(function (s1, s2) {
                    return (s1 > s2) - (s1 < s2)
                });

                RESPONSE_DATA_STORE.push(reqId, opVMList);
            }
            callback(err, opVMList);
            return;
        });
    } else {
        var domainFQN = commonUtils.getValueByJsonPath(appData, 'authObj;req;cookies;domain', null, false),
            reqObjArr = [];
        authApi.getTenantList(req, appData, function (err, tenantList) {
            var projectsLen = (tenantList['tenants'] != null) ? (tenantList['tenants'].length) : 0;

            for (var i = 0; i < projectsLen; i++) {
                opUrl = opUri + domainFQN + ':' + tenantList['tenants'][i]['name'] + ':*' + opUriQuery;
                commonUtils.createReqObj(reqObjArr, opUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
            }

            async.map(reqObjArr, commonUtils.getAPIServerResponse(opApiServer.apiGet, true), function (err, response) {
                if (err || (null == response)) {
                    callback(err, null);
                    return;
                }
                var opVMList = [];
                if (response.length > 0) {
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].hasOwnProperty('value') && response[i]['value'].length > 0) {
                            for (var j = 0; j < response[i]['value'].length; j++) {
                                if (response[i]['value'][j]['value'].hasOwnProperty('UveVirtualNetworkAgent')) {
                                    opVMList = opVMList.concat(response[i]['value'][j]['value']['UveVirtualNetworkAgent']['virtualmachine_list']);
                                }
                            }
                        }
                    }
                    if (opVMList.length != 0) {
                        //Sorting the UUID list so the order remains the same always.
                        opVMList.sort(function (s1, s2) {
                            return (s1 > s2) - (s1 < s2)
                        });
                        RESPONSE_DATA_STORE.push(reqId, opVMList);

                        if (!REQ_STATUS_QUEUE.has(reqId)) {
                            REQ_STATUS_QUEUE.insert(reqId, "complete");
                        }
                    }
                }
                callback(err, opVMList);
                return;
            });

        });
    }

}

function getInstancesList(req, res, appData) {
    if (req.query['via']) {
        if (req.query['via'] == "analytics") {
            console.log("via analytics>>>>>>>>");
            getInstancesListFromAnalytics(req, appData, function (err, vmList) {
                commonUtils.handleJSONResponse(err, res, vmList);
                return;
            });
        } else if (req.query['via'] == "config") {
            getInstancesListFromConfig(req, appData, function (err, vmList) {
                commonUtils.handleJSONResponse(err, res, vmList);
                return;
            });
        }
    } else {
        getInstancesListFromConfig(req, appData, function (err, vmList) {
            commonUtils.handleJSONResponse(err, res, vmList);
            return;
        });
    }
}

/*End of Instance list API */

/*Get Instances API*/

/**
 * Process API requests to OPServer in queue. Supports paginated response
 * @param queue
 * @param queueFetchStatus
 * @param count
 * @param type
 * @param filtUrl
 * @param appData
 * @param callback
 */
function processReqFromQueue(queue, queueFetchStatus, count, type, filtUrl, appData, callback) {
    var resultJSON = createEmptyPaginatedData(),
        url = '/analytics/uves/' + type + '/*?kfilt=';

    //We will use only more for paginated response.
    delete resultJSON['lastKey'];

    var list = queue.splice(0, count);

    if (list.length > 0) {
        for (var i = 0; i < list.length; i++) {
            url += list[i];
            if (i + 1 < list.length) {
                url += ',';
            }
        }

        //filtURL already contains the url, /analytics/uves, so remove this and then append to our url
        var kfiltUrlKey = '/*?kfilt=',
            splArr = url.split(kfiltUrlKey),
            postData = {};

        if (splArr.length == 2) {
            postData['kfilt'] = splArr[1].split(',');
            url = splArr[0];
        }

        if (filtUrl) {
            var cfiltArr = filtUrl.split('cfilt=');
            if (cfiltArr.length == 2) {
                postData['cfilt'] = cfiltArr[1].split(',');
            }
        }
        opApiServer.apiPost(url, postData, appData, function (err, data) {
            if (data && data['value']) {
                var resCnt = data['value'].length;
                if (resCnt < count) {
                    /* We have got less number of elements compared to whatever we
                     * sent to opSrever in kfilt, so these entries may be existing
                     * in API Server, but not in opServer, so add these in the
                     * response
                     */
                    var tempResData = {}, vnName;
                    for (var i = 0; i < resCnt; i++) {
                        if (null == data['value'][i]) {
                            continue;
                        }
                        vnName = data['value'][i]['name'];
                        tempResData[vnName] = vnName;
                    }
                    var kFiltLen = postData['kfilt'].length;
                    for (var i = 0; i < kFiltLen; i++) {
                        vnName = postData['kfilt'][i];
                        if (null == tempResData[vnName]) {
                            tempResData[vnName] = vnName;
                            data['value'].push({'name': vnName, 'value': {}});
                        }
                    }
                }
            }

            resultJSON['data'] = data;

            //Queue can be still populating, even though queue is empty after processing.
            //So make sure fetch status is also "complete" before setting more to false.
            if (queueFetchStatus == "complete" && queue.length == 0) {
                resultJSON['more'] = false;
            } else {
                resultJSON['more'] = true;
            }

            callback(err, resultJSON);

        });
    } else {
        //Queue is currently empty. This request may have come due to previous response with more set
        //to true. Check if the Queue building requests are complete; set 'more' accordingly and in
        //both cases, set data values to empty to prevent grid showing empty rows.
        if (queueFetchStatus == "complete") {
            resultJSON['more'] = false;
        } else {
            resultJSON['msg'] = "Queue is empty now; But origin requests are still in progress.";
            resultJSON['more'] = true;
        }
        resultJSON["data"]["value"] = [];

        callback(null, resultJSON);
    }

}

/**
 * Get the list of instances from Config API and proceed with requests to
 * Analytics with the filters in the request.
 * @param req
 * @param appData
 * @param callback
 */
function getInstancesForUserFromConfig(req, appData, callback) {

    var lastUUID = req.body['lastKey'],
        count = req.query['count'],
        type = req.query['type'],
        filtUrl = null,
        resultJSON = createEmptyPaginatedData(),
        filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);

    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }

    getInstancesListFromConfig(req, appData, function(err, configVMList) {
        if (err || (null == configVMList)) {
            callback(err, resultJSON);
            return;
        }
        var vmList = nwMonUtils.makeUVEList(configVMList);
        processInstanceReqByLastUUID(lastUUID, count, 'name', vmList, filtUrl, appData, function (err, data) {
            callback(err, data);
        });
    });

}

/**
 * For requests with FQN set, request Analytics based on type and get instance list and proceed with requests to
 * Analytics with the filters in the request.
 * @param req
 * @param appData
 * @param callback
 */
function getInstancesByFqnFromAnalytics(req, appData, callback) {
    var fqnUUID = req.query['fqnUUID'];
    var lastUUID = req.query['lastKey'];
    var count = req.query['count'];
    var type = req.query['type'];
    var filtUrl = null;

    var reqId = req.body['id'];
    var fqn = req.body['FQN'];
    var opUrl, opUri = '/analytics/uves/virtual-network/', opUriQuery = '?cfilt=UveVirtualNetworkAgent:virtualmachine_list';
    var resultJSON = createEmptyPaginatedData();

    if (type == 'vn') {
        opUrl = opUri + fqn + opUriQuery;
    } else if (type == 'project') {
        //For type project, we will get all networks under project by appending :* to fqn
        opUrl = opUri + fqn + ":*" + opUriQuery;
    }

    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }

    if (RESPONSE_DATA_STORE.has(reqId)) {
        var opVMCachedList = RESPONSE_DATA_STORE.get(reqId);
        var data = nwMonUtils.makeUVEList(opVMCachedList, 'VMUUID');
        console.log("UUID from cache..!", opVMCachedList);

        processInstanceReqByLastUUID(lastUUID, count, 'VMUUID', data, filtUrl, appData, function (err, data) {
            callback(err, data);
        });
    } else {
        opApiServer.apiGet(opUrl, appData, function(err, response) {
            if (err || (null == response)) {
                callback(err, resultJSON);
                return;
            }
            var opVMList = [];
            if (type == 'vn') {
                if (response.hasOwnProperty('UveVirtualNetworkAgent')) {
                    opVMList = opVMList.concat(response['UveVirtualNetworkAgent']['virtualmachine_list']);
                }
            } else if (type == 'project') {
                if (response['value'].length > 0) {
                    for (var i = 0; i < response['value'].length; i++) {
                        if (response['value'][i]['value'].hasOwnProperty('UveVirtualNetworkAgent')) {
                            opVMList = opVMList.concat(response['value'][i]['value']['UveVirtualNetworkAgent']['virtualmachine_list']);
                        }
                    }
                }
            }
            if (opVMList.length != 0) {
                //Sorting the UUID list so the order remains the same always.
                opVMList.sort(function (s1, s2) {
                    return (s1 > s2) - (s1 < s2)
                });

                RESPONSE_DATA_STORE.push(reqId, opVMList);

                var data = nwMonUtils.makeUVEList(opVMList, 'VMUUID');
                processInstanceReqByLastUUID(lastUUID, count, 'VMUUID', data, filtUrl, appData, function (err, data) {
                    callback(err, data);
                });
            }

        });
    }
}

/**
 * Main handler for getting instances via Analytics. req with FQN or without FQN(based on domain)
 * Request without FQN will get the list of instances for all the project under domain and proceed with request
 * to Analytics. Instance list is pushed to Queue, which can be processed either by non-empty response from first project
 * request or wait for all project requests to complete.
 * @param req
 * @param appData
 * @param callback
 */
function getInstancesForUserFromAnalytics(req, appData, callback) {
    var count = req.query['count'];
    var type = req.query['type'];
    var reqObjArr = [];
    var filtUrl = null;
    var filtData = nwMonUtils.buildBulkUVEUrls(req.body, appData);
    var resultJSON = createEmptyPaginatedData();

    var reqId = req.body['id'];
    var domainFQN = commonUtils.getValueByJsonPath(appData, 'authObj;req;cookies;domain', null, false);
    var fqn = req.body['FQN'];
    var opUrl, opUri = '/analytics/uves/virtual-network/', opUriQuery = '?cfilt=UveVirtualNetworkAgent:virtualmachine_list';

    if (filtData && filtData[0]) {
        filtUrl = filtData[0]['reqUrl'];
    }

    /**
     * when we have FQN, straight away get the VM UUIDs from Analytics and paginated requests
     * will be processed with using lastkey.
     * For request without FQN, we will get the VM UUIDs for all projects under domain.
     * VM UUIDs per project will be processed using a Queue which is loaded asynchronously.
     */
    if (null != fqn) {
        if (null == type) {
            var err = new appErrors.RESTServerError('type is required');
            callback(err, resultJSON)
            return;
        }
        console.log("Getting instance details by FQN");
        getInstancesByFqnFromAnalytics(req, appData, callback);
        return;
    } else {
        //Case all-projects:all-networks under breadcrumb.
        //First check if the request ID was processed already and the UUID list is present.
        //Proceed with processing the Queue.
        if (RESPONSE_DATA_STORE.has(reqId)) {
            console.log("UUID from cache..!");
            processReqFromQueue(OPSERVER_PROCESS_QUEUE.get(reqId), REQ_STATUS_QUEUE.get(reqId), count, 'virtual-machine', filtUrl, appData, callback);

        }
        else { //else proceed with FQN or by requesting all the projects under the domain.
            //Should we wait for response from all the projects? or proceed with chunks? default is true : proceed.
            var originResponseChunk = true;
            //Number of active async requests
            var originConcurrentLimit = 5;

            if (null != req.body['originResponseChunk']) {
                originResponseChunk = typeof req.body['originResponseChunk'] == "string" ? req.body['originResponseChunk'].toLowerCase() : req.body['originResponseChunk'];
            }

            if (null != req.body['originConcurrentLimit']) {
                originConcurrentLimit = typeof req.body['originResponseChunk'] == "string" ? parseInt(req.body['originConcurrentLimit']) : req.body['originConcurrentLimit'];
            }

            authApi.getTenantList(req, appData, function (err, tenantList) {
                var projectsLen = (tenantList['tenants'] != null) ? (tenantList['tenants'].length) : 0;

                for (var i = 0; i < projectsLen; i++) {
                    opUrl = opUri + domainFQN + ':' + tenantList['tenants'][i]['name'] + ':*' + opUriQuery;
                    commonUtils.createReqObj(reqObjArr, opUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
                }

                if (originResponseChunk || originResponseChunk == 'true') {
                    console.log("async.each!");
                    function getProjectVms (reqObj, finalCB) {
                        //Call rest api for each request object.
                        commonUtils.getServerResponseByRestApi(opApiServer, true, reqObj, function (err, response) {
                            if (err) {
                                finalCB(err, resultJSON);
                                return;
                            }
                            var opVMList = [];

                            if (response['value'].length > 0) {
                                for (var i = 0; i < response['value'].length; i++) {
                                    if (response['value'][i]['value'].hasOwnProperty('UveVirtualNetworkAgent')) {
                                        opVMList = opVMList.concat(response['value'][i]['value']['UveVirtualNetworkAgent']['virtualmachine_list']);
                                    }
                                }
                            }

                            if (opVMList.length != 0) {

                                OPSERVER_PROCESS_QUEUE.push(reqId, opVMList);

                                var opVMCachedList = RESPONSE_DATA_STORE.get(reqId);
                                console.log(opVMCachedList, opVMList);
                                if (opVMCachedList.length > 0) {
                                    opVMList = opVMCachedList.concat(opVMList);
                                }
                                //Sorting the UUID list so the order remains the same always.
                                opVMList.sort(function (s1, s2) {
                                    return (s1 > s2) - (s1 < s2)
                                });

                                RESPONSE_DATA_STORE.insert(reqId, opVMList);

                                if (!REQ_STATUS_QUEUE.has(reqId)) {
                                    REQ_STATUS_QUEUE.insert(reqId, "started");
                                    processReqFromQueue(OPSERVER_PROCESS_QUEUE.get(reqId), REQ_STATUS_QUEUE.get(reqId), count, 'virtual-machine', filtUrl, appData, callback);
                                }
                            }

                            finalCB();

                        });
                    };

                    async.forEachLimit(reqObjArr, originConcurrentLimit, getProjectVms, function(err) {
                        if (err) {
                            callback(err, resultJSON);
                        }

                        REQ_STATUS_QUEUE.insert(reqId, "complete");

                    });
                } else { //wait for response from all the projects under domain.

                    console.log("async.map!");
                    async.map(reqObjArr, commonUtils.getAPIServerResponse(opApiServer.apiGet, true),
                        function (err, response) {
                            if (err || (null == response)) {
                                callback(err, null);
                                return;
                            }
                            var opVMList = [];
                            if (response.length > 0) {
                                for (var i = 0; i < response.length; i++) {
                                    if (response[i].hasOwnProperty('value') && response[i]['value'].length > 0) {
                                        for (var j = 0; j < response[i]['value'].length; j++) {
                                            if (response[i]['value'][j]['value'].hasOwnProperty('UveVirtualNetworkAgent')) {
                                                opVMList = opVMList.concat(response[i]['value'][j]['value']['UveVirtualNetworkAgent']['virtualmachine_list']);
                                            }
                                        }
                                    }
                                }
                                if (opVMList.length != 0) {
                                    //Sorting the UUID list so the order remains the same always.
                                    opVMList.sort(function (s1, s2) {
                                        return (s1 > s2) - (s1 < s2)
                                    });
                                    OPSERVER_PROCESS_QUEUE.push(reqId, opVMList);
                                    RESPONSE_DATA_STORE.push(reqId, opVMList);

                                    if (!REQ_STATUS_QUEUE.has(reqId)) {
                                        REQ_STATUS_QUEUE.insert(reqId, "complete");
                                    }
                                    processReqFromQueue(OPSERVER_PROCESS_QUEUE.get(reqId), REQ_STATUS_QUEUE.get(reqId), count, 'virtual-machine', filtUrl, appData, callback);

                                } else {
                                    callback(err, resultJSON);
                                    return;
                                }
                            }
                        });
                }

            });
        }
    }
};

/**
 *
 * @param req
 * @param res
 * @param appData
 */
function getInstances(req, res, appData) {
    var getVMCB = instanceDetailsMap[req.session.loggedInOrchestrationMode];
    if (null != getVMCB) {
        getVMCB(req, appData, function (err, instDetails) {
            commonUtils.handleJSONResponse(err, res, instDetails);
            return;
        });
        return;
    }
    if (req.query['via']) {
        if (req.query['via'] == "analytics") {
            console.log("via analytics>>>>>>>>");
            getInstancesForUserFromAnalytics(req, appData, function (err, instDetails) {
                commonUtils.handleJSONResponse(err, res, instDetails);
                return;
            });
        } else if (req.query['via'] == "config") {
            getInstancesForUserFromConfig(req, appData, function (err, instDetails) {
                commonUtils.handleJSONResponse(err, res, instDetails);
                return;
            });
        }
    } else {
        getInstancesForUserFromConfig(req, appData, function (err, instDetails) {
            commonUtils.handleJSONResponse(err, res, instDetails);
            return;
        });
    }
};

/*End of getInstances*/

/*Run NM Query*/


function formatQueryString(table, whereClauseObjArr, selectFieldObjArr, timeObj, noSortReqd, limit, dir, AndClause) {
    var queryJSON = {};
    var whereClauseLen = 0;
    queryJSON = global.QUERY_JSON[table];
    var selectLen = selectFieldObjArr.length;
    queryJSON['select_fields'] = [];
    for (var i = 0; i < selectLen; i++) {
        /* Every array element is one object */
        queryJSON['select_fields'][i] = selectFieldObjArr[i];
    }
    
    queryJSON['start_time'] = timeObj['start_time'];
    queryJSON['end_time'] = timeObj['end_time'];
    if ((null == noSortReqd) || (false == noSortReqd) ||
        (typeof noSortReqd === 'undefined')) {
        queryJSON['sort_fields'] = ['sum(bytes)'];
        queryJSON['sort'] = global.QUERY_STRING_SORT_DESC;
    }
    if ((limit != null) && (typeof limit != undefined) && (-1 != limit)) {
        queryJSON['limit'] = limit;
    }
    queryJSON['where'] = [];
    whereClauseLen = whereClauseObjArr.length;
    if ((null == AndClause) || (typeof AndClause === 'undefined')) {
        for (i = 0; i < whereClauseLen; i++) {
            for (var key in whereClauseObjArr[i]) {
                queryJSON['where'][i] =
                    [
                        {"name": key, "value": whereClauseObjArr[i][key], "op": 1}
                    ];
            }
        }
    } else {
        queryJSON['where'][0] = [];
        for (i = 0; i < whereClauseLen; i++) {
            for (key in whereClauseObjArr[i]) {
                queryJSON['where'][0][i] =
                {"name": key, "value": whereClauseObjArr[i][key], "op": 1};
            }
        }
    }
    if ((dir == null) || (typeof dir === 'undefined')) {
        queryJSON['dir'] = global.TRAFFIC_DIR_INGRESS;
    } else {
        queryJSON['dir'] = dir;
    }
    return commonUtils.cloneObj(queryJSON);
}

function updateQueryObjByType(queryObj, type) {
    if ('virtual-machine' == type) {
        queryObj.table = 'StatTable_UveVMInterfaceAgent_if_stats';
        queryObj.context = 'vm';
        queryObj.whereFieldName = 'vm_uuid';
    } else if ('virtual-network' == type) {
        queryObj.table = 'StatTable_UveVirtualNetworkAgent_vn_stats';
        queryObj.context = 'vn';
    } else if ('virtual-machine-interface' == type) {
        queryObj.table = 'StatTable_UveVMInterfaceAgent_if_stats';
        queryObj.context = 'vm';
    }
    return queryObj;
}

function createQueryJSON(queryObj) {
    var minSince = queryObj['minSince'],
        useServerTime = queryObj['userServerTime'],
        timeObj = nwMonJobs.createTimeQueryJsonObjByServerTimeFlag(minSince, useServerTime),
        whereClauseArray = [], whereClause;

    queryObj.whereFieldName = "name";

    updateQueryObjByType(queryObj, queryObj.type);

    //To support passing UUID via req. This support will be taken off in future.
    var UUIDList = queryObj['uuids']
    if (UUIDList.indexOf(',') > -1) {
        UUIDList = UUIDList.split(',');
        for (var i = 0; i < UUIDList.length; i++) {
            whereClause = {};
            whereClause[queryObj.whereFieldName] = UUIDList[i];
            whereClauseArray.push(whereClause);
        }
    } else {
        whereClause = {};
        whereClause[queryObj.whereFieldName] = UUIDList;
        whereClauseArray.push(whereClause);
    }
    
    var props = global.STATS_PROP[queryObj.context],
        selectArr = [props['inBytes'], props['outBytes'], props['inPkts'], props['outPkts'], queryObj.whereFieldName],
        queryJSON = formatQueryString(queryObj.table, whereClauseArray, selectArr, timeObj, true, null);

    queryObj.queryJSON = queryJSON;
    
    return queryJSON;
    
}

function executeQuery (queryJSONList, appData, callback) {
    var dataObjArr = [];

    for (var i = 0; i < queryJSONList.length; i++) {
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL, global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(queryJSONList[i]), null, null, appData);
    }
    logutils.logger.debug("Query1 executing:" + JSON.stringify((dataObjArr[0] != null) ? dataObjArr[0]['data'] : ""));

    async.map(dataObjArr, commonUtils.getAPIServerResponse(opApiServer.apiPost, true), function(err, data) {
        callback(err, data);
    });
}

function runQuery (req, res, appData) {
    
    var reqQueryObj = req.body,
        queryJSON = [];

    if( Object.prototype.toString.call( reqQueryObj ) === '[object Array]' ) {
        for (var i = 0; i < reqQueryObj.length; i++) {
            queryJSON.push(createQueryJSON(reqQueryObj[i]));
        }    
    } else {
        queryJSON.push(createQueryJSON(reqQueryObj));
    }
    
    
    //logutils.logger.debug("Query json is " + JSON.stringify(queryJSON));

    executeQuery(queryJSON, null, appData, function (err, data) {
        //logutils.logger.debug(JSON.stringify(data));
        commonUtils.handleJSONResponse(err, res, data);
    });
}

function runPOSTQuery (req, res, appData) {

    runQuery(req, res, appData);
    
}


/*End of NM Query/

/* List all public functions */
exports.getFlowSeriesByVN = getFlowSeriesByVN;
exports.getProjectSummary = getProjectSummary;
exports.getNetworkStats = getNetworkStats;
exports.getVNStatsSummary = getVNStatsSummary;
exports.getFlowSeriesByVM = getFlowSeriesByVM;
exports.getVMStatsSummary = getVMStatsSummary;
exports.getNetworkStatsSummary = getNetworkStatsSummary;
exports.getVirtualNetworksSummary = getVirtualNetworksSummary;
exports.getVirtualMachine = getVirtualMachine;
exports.getVirtualMachinesSummary = getVirtualMachinesSummary;
exports.getVirtualInterfacesSummary = getVirtualInterfacesSummary;
exports.getVMDetails = getVMDetails;
exports.getInstanceDetails = getInstanceDetails;
exports.getVirtualNetworksDetails = getVirtualNetworksDetails;
exports.isAllowedVN = isAllowedVN;
exports.getVNListByProject = getVNListByProject;
exports.getStats = getStats;
exports.getVirtualNetworksList = getVirtualNetworksList;
exports.getProjects = getProjects;
exports.getVNetworks = getVNetworks;
exports.getNetworkDomainSummary = getNetworkDomainSummary;
exports.getNetworkDetails = getNetworkDetails;
exports.getInstanceDetailsForVRouter = getInstanceDetailsForVRouter;
//Instances
exports.getInstancesList = getInstancesList;
exports.getInstances = getInstances;
//Query
exports.runPOSTQuery = runPOSTQuery;
