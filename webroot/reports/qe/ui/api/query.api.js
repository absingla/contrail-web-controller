/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * API for communication with Query Engine.
 */

var qeapi = module.exports,
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    config = process.mainModule.exports["config"],
    redisReadStream = require('redis-rstream'),
    qs = require('querystring'),
    _ = require('underscore');

var redis = require("redis"),
    redisServerPort = (config.redis_server_port) ? config.redis_server_port : global.DFLT_REDIS_SERVER_PORT,
    redisServerIP = (config.redis_server_ip) ? config.redis_server_ip : global.DFLT_REDIS_SERVER_IP,
    redisClient = redis.createClient(redisServerPort, redisServerIP);

redisClient.select(global.QE_DFLT_REDIS_DB, function (error) {
    if (error) {
        logutils.logger.error('Redis DB ' + global.QE_DFLT_REDIS_DB + ' Select Error:' + error);
    }
});

var opServer = rest.getAPIServer({apiName: global.label.OPS_API_SERVER, server: config.analytics.server_ip, port: config.analytics.server_port});

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

function runGETQuery(req, res) {
    var reqQuery = req.query;
    runQuery(req, res, reqQuery);
}

function runPOSTQuery(req, res) {
    var queryReqObj = req.body;
    runQuery(req, res, queryReqObj);
}

// Handle request to get list of all tables.
function getTables(req, res) {
    var opsUrl = global.GET_TABLES_URL;
    sendCachedJSON4Url(opsUrl, res, 3600);
};

// Handle request to get table schema.
function getTableSchema(req, res) {
    var opsUrl = global.GET_TABLE_INFO_URL + '/' + req.param('tableName') + '/schema';
    sendCachedJSON4Url(opsUrl, res, 3600);
};

// Handle request to get columns values.
function getTableColumnValues(req, res, appData) {
    var reqQueryObj = req.body,
        tableName = reqQueryObj['table_name'],
        selectFields = reqQueryObj['select'],
        where = reqQueryObj['where'],
        objectQuery, startTime, endTime, queryOptions;

    startTime = reqQueryObj['fromTimeUTC'];
    endTime = reqQueryObj['toTimeUTC'];

    if(tableName == null) {
        commonUtils.handleJSONResponse(null, res, {});
    } else {
        objectQuery = {"start_time": startTime, "end_time": endTime, "select_fields": selectFields, "table": tableName, "where": where};
        setMicroTimeRange(objectQuery, startTime, endTime);
        queryOptions = {queryId: null, async: false, status: "run", queryJSON: objectQuery, errorMessage: ""};

        executeQuery(res, queryOptions);
    }
};

// Handle request to get query queue.
function getQueryQueue(req, res) {
    var queryQueue = req.param('queryQueue');
    redisClient.hvals(queryQueue, function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i] = JSON.parse(results[i])
            }
            commonUtils.handleJSONResponse(error, res, results);
        }
    });
};

// Handle request to get unique flow classes for a flow-series query.
function getChartGroups(req, res) {
    var queryId = req.param('queryId');
    redisClient.get(queryId + ':chartgroups', function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
};

// Handle request to get chart data for a flow-series query.
function getChartData(req, res) {
    var queryId = req.param('queryId');
    redisClient.get(queryId + ':chartdata', function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
};

// Handle request to delete redis cache for given query ids.
function deleteQueryCache4Ids(req, res) {
    var queryIds = req.body.queryIds;
    var queryQueue = req.body.queryQueue;
    for (var i = 0; i < queryIds.length; i++) {
        redisClient.hdel(queryQueue, queryIds[i]);
        redisClient.keys(queryIds[i] + "*", function (error, keysArray) {
            if (!error && keysArray.length > 0) {
                redisClient.del(keysArray, function (error) {
                    if (error) {
                        logutils.logger.error('Error in delete cache of query key: ' + error);
                    }
                });
            } else {
                logutils.logger.error('Error in delete cache of query id: ' + error);
            }
        });
    }
    commonUtils.handleJSONResponse(null, res, {});
};

// Handle request to delete redis cache for QE.
function deleteQueryCache4Queue(req, res) {
    var queryQueue = req.body.queryQueue;
    redisClient.hkeys(queryQueue, function (error, results) {
        if (!error) {
            redisClient.del(queryQueue, function (error) {
                if (error) {
                    logutils.logger.error('Error in delete cache of query queue: ' + error);
                    commonUtils.handleJSONResponse(error, res, null);
                } else {
                    logutils.logger.debug('Redis Query Queue ' + queryQueue + ' flush complete.');
                    commonUtils.handleJSONResponse(null, res, {message: 'Redis Query Queue ' + queryQueue + ' flush complete.'});
                }
            });
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
};

// Handle request to delete redis cache for QE.
function flushQueryCache(req, res) {
    redisClient.flushdb(function (error) {
        if (error) {
            logutils.logger.error("Redis QE FlushDB Error: " + error);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            logutils.logger.debug("Redis QE FlushDB Complete.");
            commonUtils.handleJSONResponse(null, res, {message: 'Redis QE FlushDB Complete.'});
        }
    });
};

// Handle request to get current time of server
function getCurrentTime(req, res) {
    var currentTime = new Date().getTime();
    commonUtils.handleJSONResponse(null, res, {currentTime: currentTime});
};

function runQuery(req, res, queryReqObj) {
    var queryId = queryReqObj['queryId'],
        chunk = queryReqObj['chunk'], sort = queryReqObj['sort'],
        chunkSize = parseInt(queryReqObj['chunkSize']), options;

    options = {"queryId": queryId, "chunk": chunk, "sort": sort, "chunkSize": chunkSize, "toSort": true};

    logutils.logger.debug('Query Request: ' + JSON.stringify(queryReqObj));

    if (queryId != null) {
        redisClient.exists(queryId + ':chunk1', function (err, exists) {
            if (err) {
                logutils.logger.error(err.stack);
                commonUtils.handleJSONResponse(err, res, null);
            } else if (exists == 1) {
                returnCachedQueryResult(res, options, handleQueryResponse);
            } else {
                runNewQuery(req, res, queryId, queryReqObj);
            }
        });
    } else {
        runNewQuery(req, res, null, queryReqObj);
    }
};

function runNewQuery(req, res, queryId, queryReqObj) {
    var queryOptions = getQueryOptions(queryReqObj),
        queryJSON = getQueryJSON4Table(queryReqObj);

    queryOptions.queryJSON = queryJSON;
    executeQuery(res, queryOptions);
};

function getQueryOptions(queryReqObj) {
    var formModelAttrs = queryReqObj['formModelAttrs'],
        tableType = formModelAttrs['table_type'],
        queryId = queryReqObj['queryId'], chunkSize = parseInt(queryReqObj['chunkSize']),
        async = (queryReqObj['async'] != null && queryReqObj['async'] == "true") ? true : false,
        reRunTimeRange = queryReqObj['reRunTimeRange'], reRunQuery = queryReqObj, engQueryStr = queryReqObj['engQueryStr'],
        saveQuery = queryReqObj['saveQuery'];

    var queryOptions = {
        queryId: queryId, chunkSize: chunkSize, counter: 0, status: "run", async: async, count: 0, progress: 0, errorMessage: "",
        reRunTimeRange: reRunTimeRange, reRunQuery: reRunQuery, opsQueryId: "", engQueryStr: engQueryStr, saveQuery: saveQuery,
        tableType: tableType
    };

    if (formModelAttrs['select'].indexOf('T=') != -1) {
        queryOptions.tg = formModelAttrs['time_granularity'];
        queryOptions.tgUnit = formModelAttrs['time_granularity_unit'];
    } else {
        queryOptions.tg = '';
        queryOptions.tgUnit = '';
    }

    if (tableType == 'LOG' || tableType == 'OBJECT') {
        queryOptions.queryQueue = 'lqq';
    } else if (tableType == 'FLOW') {
        queryOptions.queryQueue = 'fqq';
    } else if (tableType == 'STAT') {
        queryOptions.queryQueue = 'sqq';
    }

    return queryOptions;
};

function executeQuery(res, queryOptions) {
    var queryJSON = queryOptions.queryJSON,
        async = queryOptions.async, asyncHeader = {"Expect": "202-accepted"};

    opServer.authorize(function () {
        logutils.logger.debug("Query sent to Opserver at " + new Date() + ' ' + JSON.stringify(queryJSON));
        queryOptions['startTime'] = new Date().getTime();
        opServer.api.post(global.RUN_QUERY_URL, queryJSON, function (error, jsonData) {
            if (error) {
                logutils.logger.error('Error Run Query: ' + error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (async) {
                initPollingConfig(queryOptions, queryJSON.start_time, queryJSON.end_time)
                queryOptions['url'] = jsonData['href'];
                queryOptions['opsQueryId'] = parseOpsQueryIdFromUrl(jsonData['href']);
                setTimeout(fetchQueryResults, 3000, res, jsonData, queryOptions);
                queryOptions['intervalId'] = setInterval(fetchQueryResults, queryOptions.pollingInterval, res, jsonData, queryOptions);
                queryOptions['timeoutId'] = setTimeout(stopFetchQueryResult, queryOptions.pollingTimeout, queryOptions);
            } else {
                processQueryResults(res, jsonData, queryOptions);
            }
        }, async ? asyncHeader : {});
    });
};

function initPollingConfig(options, fromTime, toTime) {
    var timeRange = null;
    if (true == isNaN(fromTime)) {
        var str = 'now-';
        /* Check if we have keyword now in that */
        var pos = fromTime.indexOf(str);
        if (pos != -1) {
            var mins = fromTime.slice(pos + str.length);
            mins = mins.substr(0, mins.length - 1);
            mins = parseInt(mins);
        } else {
            assert(0);
        }
        timeRange = mins;
    } else {
        timeRange = (toTime - fromTime) / 60000000;
    }
    if (timeRange <= 720) {
        options.pollingInterval = 10000;
        options.maxCounter = 1;
        options.pollingTimeout = 3600000;
    } else if (timeRange > 720 && timeRange <= 1440) {
        options.pollingInterval = 30000;
        options.maxCounter = 1;
        options.pollingTimeout = 5400000;
    } else {
        options.pollingInterval = 60000;
        options.maxCounter = 1;
        options.pollingTimeout = 7200000;
    }
};

function fetchQueryResults(res, jsonData, options) {
    var queryId = options['queryId'], chunkSize = options['chunkSize'],
        queryJSON = options['queryJSON'], progress;

    opServer.authorize(function () {
        opServer.api.get(jsonData['href'], function (error, queryResults) {
            progress = queryResults['progress'];
            options['counter'] += 1;
            if (error) {
                logutils.logger.error(error.stack);
                clearInterval(options['intervalId']);
                clearTimeout(options['timeoutId']);
                options['progress'] = progress;
                if (options.status == 'run') {
                    commonUtils.handleJSONResponse(error, res, null);
                } else if (options.status == 'queued') {
                    options.status = 'error';
                    options.errorMessage = error;
                    updateQueryStatus(options);
                }
            } else if (progress == 100) {
                clearInterval(options['intervalId']);
                clearTimeout(options['timeoutId']);
                options['progress'] = progress;
                options['count'] = queryResults.chunks[0]['count'];
                jsonData['href'] = queryResults.chunks[0]['href'];
                fetchQueryResults(res, jsonData, options);
            } else if (progress == null || progress === 'undefined') {
                processQueryResults(res, queryResults, options);
                if (options.status == 'queued') {
                    options['endTime'] = new Date().getTime();
                    options['status'] = 'completed';
                    updateQueryStatus(options);
                }
            } else if (options['counter'] == options.maxCounter) {
                options['progress'] = progress;
                options['status'] = 'queued';
                updateQueryStatus(options);
                commonUtils.handleJSONResponse(null, res, {status: "queued", data: []});
            }
        });
    });
};

function sendCachedJSON4Url(opsUrl, res, expireTime) {
    redisClient.get(opsUrl, function (error, cachedJSONStr) {
        if (error || cachedJSONStr == null) {
            opServer.authorize(function () {
                opServer.api.get(opsUrl, function (error, jsonData) {
                    if (!jsonData) {
                        jsonData = [];
                    }
                    redisClient.setex(opsUrl, expireTime, JSON.stringify(jsonData));
                    commonUtils.handleJSONResponse(error, res, jsonData);
                });
            });
        } else {
            commonUtils.handleJSONResponse(null, res, JSON.parse(cachedJSONStr));
        }
    });
};


function returnCachedQueryResult(res, options, callback) {
    var queryId = options.queryId, sort = options.sort,
        statusJSON;
    if (sort != null) {
        redisClient.get(queryId + ':sortStatus', function (error, result) {
            var sort = options.sort;
            if (error) {
                logutils.logger.error(error.stack);
            } else if (result != null) {
                statusJSON = JSON.parse(result);
                if (statusJSON[0]['field'] == sort[0]['field'] && statusJSON[0]['dir'] == sort[0]['dir']) {
                    options.toSort = false;
                }
            }
            callback(res, options);
        });
    } else {
        options.toSort = false;
        callback(res, options);
    }
};

function handleQueryResponse(res, options) {
    var toSort = options.toSort, queryId = options.queryId,
        chunk = options.chunk, chunkSize = options.chunkSize,
        sort = options.sort;
    if (chunk == null || toSort) {
        redisClient.exists(queryId, function (err, exists) {
            if (exists) {
                var stream = redisReadStream(redisClient, queryId),
                    chunkedData, accumulatedData = [], dataBuffer, resultJSON;
                stream.on('error', function (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                }).on('readable', function () {
                    while ((chunkedData = stream.read()) !== null) {
                        accumulatedData.push(chunkedData)
                    }
                }).on('end', function () {
                    dataBuffer = Buffer.concat(accumulatedData);
                    resultJSON = JSON.parse(dataBuffer);
                    if (toSort) {
                        sortJSON(resultJSON['data'], sort, function () {
                            var startIndex, endIndex, total, responseJSON
                            total = resultJSON['total'];
                            startIndex = (chunk - 1) * chunkSize;
                            endIndex = (total < (startIndex + chunkSize)) ? total : (startIndex + chunkSize);
                            responseJSON = resultJSON['data'].slice(startIndex, endIndex);
                            commonUtils.handleJSONResponse(null, res, {data: responseJSON, total: total, queryJSON: resultJSON['queryJSON']});
                            saveQueryResult2Redis(resultJSON['data'], total, queryId, chunkSize, sort, resultJSON['queryJSON']);
                        });
                    } else {
                        commonUtils.handleJSONResponse(null, res, resultJSON);
                    }
                });
            } else {
                commonUtils.handleJSONResponse(null, res, {data: [], total: 0});
            }
        });
    } else {
        redisClient.get(queryId + ":chunk" + chunk, function (error, result) {
            var resultJSON = result ? JSON.parse(result) : {data: [], total: 0};
            if (error) {
                logutils.logger.error(error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (toSort) {
                sortJSON(resultJSON['data'], sort, function () {
                    var startIndex, endIndex, total, responseJSON
                    total = resultJSON['total'];
                    startIndex = (chunk - 1) * chunkSize;
                    endIndex = (total < (startIndex + chunkSize)) ? total : (startIndex + chunkSize);
                    responseJSON = resultJSON['data'].slice(startIndex, endIndex);
                    commonUtils.handleJSONResponse(null, res, {data: responseJSON, total: total, queryJSON: resultJSON['queryJSON']});
                    saveQueryResult2Redis(resultJSON['data'], total, queryId, chunkSize, sort, resultJSON['queryJSON']);
                });
            } else {
                commonUtils.handleJSONResponse(null, res, resultJSON);
            }
        });
    }
};

function exportQueryResult(req, res) {
    var queryId = req.query['queryId'];
    redisClient.exists(queryId, function (err, exists) {
        if (exists) {
            var stream = redisReadStream(redisClient, queryId)
            res.writeHead(global.HTTP_STATUS_RESP_OK, {'Content-Type': 'application/json'});
            stream.on('error', function (err) {
                logutils.logger.error(err.stack);
                var errorJSON = {error: err.message};
                res.write(JSON.stringify(errorJSON));
                res.end();
            }).on('readable', function () {
                var data;
                while ((data = stream.read()) !== null) {
                    res.write(data);
                }
            }).on('end', function () {
                res.end();
            });
        } else {
            commonUtils.handleJSONResponse(null, res, {data: [], total: 0});
        }
    });
};

function quickSortPartition(array, left, right, sort) {
    var sortField = sort[0]['field'],
        sortDir = sort[0]['dir'] == 'desc' ? 0 : 1,
        rightFieldValue = array[right - 1][sortField],
        min = left, max;
    for (max = left; max < right - 1; max += 1) {
        if (sortDir && array[max][sortField] <= rightFieldValue) {
            quickSortSwap(array, max, min);
            min += 1;
        } else if (!sortDir && array[max][sortField] >= rightFieldValue) {
            quickSortSwap(array, max, min);
            min += 1;
        }
    }
    quickSortSwap(array, min, right - 1);
    return min;
}

function quickSortSwap(array, max, min) {
    var temp = array[max];
    array[max] = array[min];
    array[min] = temp;
    return array;
}

function quickSort(array, left, right, sort, qsStatus) {
    if (left < right) {
        var p = quickSortPartition(array, left, right, sort);
        qsStatus.started++;
        process.nextTick(function () {
            quickSort(array, left, p, sort, qsStatus);
        });
        qsStatus.started++;
        process.nextTick(function () {
            quickSort(array, p + 1, right, sort, qsStatus)
        });
    }
    qsStatus.ended++
}

function sortJSON(resultArray, sortParams, callback) {
    var qsStatus = {started: 1, ended: 0},
        sortField = sortParams[0]['field'], sortBy = [{}];
    sortField = sortField.replace(/([\"\[\]])/g, '');
    sortBy[0]['field'] = sortField;
    sortBy[0]['dir'] = sortParams[0]['dir'];
    quickSort(resultArray, 0, resultArray.length, sortBy, qsStatus);
    qsStatus['intervalId'] = setInterval(function (qsStatus, callback) {
        if (qsStatus.started == qsStatus.ended) {
            callback();
            clearInterval(qsStatus['intervalId']);
        }
    }, 2000, qsStatus, callback);
};

function parseOpsQueryIdFromUrl(url) {
    var opsQueryId = "",
        urlArray;
    if (url != null) {
        urlArray = url.split('/');
        opsQueryId = urlArray[urlArray.length - 1];
    }
    return opsQueryId;
};

function stopFetchQueryResult(options) {
    clearInterval(options['intervalId']);
    options['status'] = 'timeout';
    updateQueryStatus(options);
};

function updateQueryStatus(options) {
    var queryStatus = {
        startTime: options.startTime, queryId: options.queryId,
        url: options.url, queryJSON: options.queryJSON, progress: options.progress, status: options.status,
        tableName: options.queryJSON['table'], count: options.count, timeTaken: -1, errorMessage: options.errorMessage,
        reRunTimeRange: options.reRunTimeRange, reRunQueryString: getReRunQueryString(options.reRunQuery, options.reRunTimeRange),
        opsQueryId: options.opsQueryId, engQueryStr: options['engQueryStr']
    };
    if (queryStatus.tableName == 'FlowSeriesTable' || queryStatus.tableName.indexOf('StatTable.') != -1) {
        queryStatus.tg = options.tg;
        queryStatus.tgUnit = options.tgUnit;
    }
    if (options.progress == 100) {
        queryStatus.timeTaken = (options.endTime - queryStatus.startTime) / 1000;
    }
    redisClient.hmset(options.queryQueue, options.queryId, JSON.stringify(queryStatus));
};

function getReRunQueryString(reRunQuery, reRunTimeRange) {
    var reRunQueryString;
    delete reRunQuery['queryId'];
    delete reRunQuery['skip'];
    delete reRunQuery['take'];
    delete reRunQuery['chunk'];
    delete reRunQuery['chunkSize'];
    if (reRunTimeRange != null && reRunTimeRange != '0') {
        delete reRunQuery['fromTime'];
        delete reRunQuery['fromTimeUTC'];
        delete reRunQuery['toTime'];
        delete reRunQuery['toTimeUTC'];
        delete reRunQuery['reRunTimeRange'];
    }
//   reRunQueryString = qs.stringify(reRunQuery);
    return reRunQuery;
};

function processQueryResults(res, queryResults, queryOptions) {
    var startDate = new Date(), startTime = startDate.getTime(),
        queryId = queryOptions.queryId, chunkSize = queryOptions.chunkSize,
        queryJSON = queryOptions.queryJSON, endDate = new Date(),
        table = queryJSON.table, tableType = queryOptions.tableType,
        endTime, total, responseJSON, resultJSON;

    endTime = endDate.getTime();
    resultJSON = (queryResults && !isEmptyObject(queryResults)) ? queryResults.value : [];
    logutils.logger.debug("Query results (" + resultJSON.length + " records) received from opserver at " + endDate + ' in ' + ((endTime - startTime) / 1000) + 'secs. ' + JSON.stringify(queryJSON));
    total = resultJSON.length;

    if (queryOptions.status == 'run') {
        if (queryId == null || total <= chunkSize) {
            responseJSON = resultJSON;
            chunkSize = total;
        } else {
            responseJSON = resultJSON.slice(0, chunkSize);
        }
        commonUtils.handleJSONResponse(null, res, {data: responseJSON, total: total, queryJSON: queryJSON, chunk: 1, chunkSize: chunkSize, serverSideChunking: true});
    }

    if ((null != queryOptions['saveQuery']) && ((false == queryOptions['saveQuery']) || ('false' == queryOptions['saveQuery']))) {
        return;
    }

    saveQueryResult2Redis(resultJSON, total, queryId, chunkSize, getSortStatus4Query(queryJSON), queryJSON);

    if (table == 'FlowSeriesTable') {
        saveData4Chart2Redis(queryId, resultJSON, queryJSON['select_fields'], 'flow_class_id');
    } else if (tableType = "STAT") {
        saveData4Chart2Redis(queryId, resultJSON, queryJSON['select_fields'], 'CLASS(T=)');
    }
};

function saveQueryResult2Redis(resultData, total, queryId, chunkSize, sort, queryJSON) {
    var endRow;
    if (sort != null) {
        redisClient.set(queryId + ":sortStatus", JSON.stringify(sort));
    }
    // TODO: Should we need to save every chunk?
    redisClient.set(queryId, JSON.stringify({data: resultData, total: total, queryJSON: queryJSON}));
    if (total == 0) {
        redisClient.set(queryId + ':chunk1', JSON.stringify({data: [], total: 0, queryJSON: queryJSON}));
    } else {
        for (var j = 0, k = 1; j < total; k++) {
            endRow = k * chunkSize;
            if (endRow > resultData.length) {
                endRow = resultData.length;
            }
            var spliceData = resultData.slice(j, endRow);
            redisClient.set(queryId + ':chunk' + k, JSON.stringify({data: spliceData, total: total, queryJSON: queryJSON, chunk: k, chunkSize: chunkSize, serverSideChunking: true}));
            j = endRow;
        }
    }
};

function getSortStatus4Query(queryJSON) {
    var sortFields, sortDirection, sortStatus;
    sortFields = queryJSON['sort_fields'];
    sortDirection = queryJSON['sort'];

    if (sortFields != null && sortFields.length > 0 && sortDirection != null) {
        sortStatus = [{"field": sortFields[0], "dir": sortDirection == 2 ? 'desc' : 'asc'}];
    }
    return sortStatus;
};

function saveData4Chart2Redis(queryId, dataJSON, selectFields, groupFieldName) {
    var resultData = {}, uniqueChartGroupArray = [], charGroupArray = [],
        result, i, k, chartGroupId, chartGroup, secTime;

    if (selectFields.length != 0) {
        for (i = 0; i < dataJSON.length; i++) {
            chartGroupId = dataJSON[i][groupFieldName];

            if (uniqueChartGroupArray.indexOf(chartGroupId) == -1) {
                chartGroup = getGroupRecord4Chart(dataJSON[i], groupFieldName);
                uniqueChartGroupArray.push(chartGroupId);
                charGroupArray.push(chartGroup);
            }

            secTime = Math.floor(dataJSON[i]['T'] / 1000);
            result = {'date': new Date(secTime)};
            result[groupFieldName] = chartGroupId;

            for (k = 0; k < selectFields.length; k++) {
                result[selectFields[k]] = dataJSON[i][selectFields[k]];
            }

            if (resultData[chartGroupId] == null) {
                resultData[chartGroupId] = {};
                resultData[chartGroupId][secTime] = result;
            } else {
                resultData[chartGroupId][secTime] = result;
            }
        }
    }

    redisClient.set(queryId + ':chartgroups', JSON.stringify(charGroupArray));
    redisClient.set(queryId + ':chartdata', JSON.stringify(resultData));
};

function getGroupRecord4Chart(row, groupFieldName) {
    var groupRecord = _.extend({}, row);
    //TODO: Don't send aggregated fields
    groupRecord['chart_group_id'] = row[groupFieldName];
    return groupRecord;
};

function setMicroTimeRange(query, fromTime, toTime) {
    if (true == isNaN(fromTime)) {
        query.start_time = fromTime;
    } else {
        query.start_time = fromTime * 1000;
    }
    if (true == isNaN(toTime)) {
        query.end_time = toTime;
    } else {
        query.end_time = toTime * 1000;
    }
};

function getQueryJSON4Table(queryReqObj) {
    var formModelAttrs = queryReqObj['formModelAttrs'],
        tableName = formModelAttrs['table_name'], tableType = formModelAttrs['table_type'],
        queryJSON = {"table": tableName, "start_time": "", "end_time": "", "select_fields": [], "filter": [], "limit": 150000};

    var fromTimeUTC = formModelAttrs['from_time_utc'], toTimeUTC = formModelAttrs['to_time_utc'],
        select = formModelAttrs['select'], where = formModelAttrs['where'], filters = formModelAttrs['filter'],
        autoLimit = queryReqObj['autoLimit'], autoSort = queryReqObj['autoSort'],
        direction = formModelAttrs['direction'];

    autoLimit = (autoLimit != null && autoLimit == "true") ? true : false;
    autoSort = (autoSort != null && autoSort == "true") ? true : false;

    if (tableType == 'LOG') {
        queryJSON = _.extend({}, queryJSON, {
            "select_fields": ["MessageTS", "Type", "Source", "ModuleId", "Messagetype", "Xmlmessage", "Level", "Category"],
            "filter": [[{"name": "Type", "value": "1", "op": 1}], [{"name": "Type", "value": "10", "op": 1}]],
            "sort_fields": ['MessageTS'],
            "sort": 2,
            "limit": 150000
        });
    } else if (tableName == 'FlowSeriesTable') {
        autoSort = (select.indexOf('T=') == -1 && select.indexOf('T') == -1) ? false : autoSort;

        queryJSON = _.extend({}, queryJSON, {"select_fields": ['flow_class_id', 'direction_ing']});

        if (autoSort) {
            if(select.indexOf('T=') != -1) {
                queryJSON['select_fields'].push('T');
            }
            queryJSON['sort_fields'] = ['T'];
            queryJSON['sort'] = 2;
        }

        if (autoLimit) {
            queryJSON['limit'] = 150000;
        }
    } else if (tableName == 'FlowRecordTable') {
        queryJSON = _.extend({}, queryJSON, {
            "select_fields": ['vrouter', 'sourcevn', 'sourceip', 'sport', 'destvn', 'destip', 'dport', 'protocol', 'direction_ing', 'UuidKey', 'action', 'sg_rule_uuid', 'nw_ace_uuid', 'vrouter_ip', 'other_vrouter_ip', 'underlay_proto', 'underlay_source_port']
        });
        if (autoLimit) {
            queryJSON['limit'] = 150000;
        } else if (formModelAttrs['limit'] != null) {
            queryJSON['limit'] = parseInt(formModelAttrs['limit']);
        }
    } else if (tableType == "OBJECT") {
        autoSort = (select.indexOf('MessageTS') == -1) ? false : autoSort;

        if (autoSort) {
            queryJSON['sort_fields'] = ['MessageTS'];
            queryJSON['sort'] = 2;
        }

        if (autoLimit) {
            queryJSON['limit'] = 50000;
        }

    } else if (tableType == "STAT") {
        queryJSON = _.extend({}, queryJSON, {
            "where": [[{"name": "name", "value": "", "op": 7}]],
        });
    };

    setMicroTimeRange(queryJSON, fromTimeUTC, toTimeUTC);
    parseSelect(queryJSON, formModelAttrs);
    parseWhere(queryJSON, where);
    //parseFSFilter(queryJSON, filters);

    if (direction != "" && parseInt(direction) >= 0) {
        queryJSON['dir'] = parseInt(direction);
    }

    return queryJSON;
};

function parseSelect(query, formModelAttrs) {
    var select = formModelAttrs['select'],
        tgValue = formModelAttrs['time_granularity'],
        tgUnit = formModelAttrs['time_granularity_unit'],
        queryPrefix = formModelAttrs['query_prefix'],
        selectArray = splitString2Array(select, ','),
        classTEqualToIndex = selectArray.indexOf('T=');


    if (classTEqualToIndex != -1) {
        selectArray[classTEqualToIndex] = 'T=' + getTGSecs(tgValue, tgUnit);
    }

    query['select_fields'] = query['select_fields'].concat(selectArray);

    // CLASS(T=) should be added to the select fields only if user has selected T= for stat queries
    if (classTEqualToIndex > -1 && queryPrefix == 'stat') {
        query['select_fields'] = query['select_fields'].concat('CLASS(T=)');
    }
};

function parseWhere(query, where) {
    if (where != null && where.trim() != '') {
        var whereORArray = where.split(' OR '),
            whereORLength = whereORArray.length,
            i;
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            whereORArray[i] = parseWhereANDClause(whereORArray[i]);
        }
        query['where'] = whereORArray;
    }
};


function parseFilter(query, filters) {
    var filtersArray, filtersLength, filterClause = [], i, filterObj;
    if (filters != null && filters.trim() != '') {
        filtersArray = filters.split(' AND ');
        filtersLength = filtersArray.length;
        for (i = 0; i < filtersLength; i += 1) {
            filtersArray[i] = filtersArray[i].trim();
            filterObj = getFilterObj(filtersArray[i]);
            filterClause.push(filterObj);
        }
        query['filter'] = query['filter'].concat(filterClause);
    }
};

function parseFilterObj(filter, operator) {
    var filterObj, filterArray;
    filterArray = splitString2Array(filter, operator);
    if (filterArray.length > 1 && filterArray[1] != '') {
        filterObj = {"name": "", value: "", op: ""};
        filterObj.name = filterArray[0];
        filterObj.value = filterArray[1];
        filterObj.op = getOperatorCode(operator);
    }
    return filterObj
};

function parseWhereANDClause(whereANDClause) {
    var whereANDArray = whereANDClause.replace('(', '').replace(')', '').split(' AND '),
        whereANDLength = whereANDArray.length, i, whereANDClause, whereANDClauseArray, operator = '',
        whereANDClauseWithSuffixArrray, whereANDTerm;

    for (i = 0; i < whereANDLength; i += 1) {
        whereANDArray[i] = whereANDArray[i].trim();
        whereANDClause = whereANDArray[i];
        if (whereANDClause.indexOf('&') == -1) {
            if (whereANDClause.indexOf('Starts with') != -1) {
                operator = 'Starts with';
                whereANDClauseArray = whereANDClause.split(operator);
            } else if (whereANDClause.indexOf('=') != -1) {
                operator = '=';
                whereANDClauseArray = whereANDClause.split(operator);
            }
            whereANDClause = {"name": "", value: "", op: ""};
            populateWhereANDClause(whereANDClause, whereANDClauseArray[0].trim(), whereANDClauseArray[1].trim(), operator);
            whereANDArray[i] = whereANDClause;
        } else {
            whereANDClauseWithSuffixArrray = whereANDClause.split('&');
            // Treat whereANDClauseWithSuffixArrray[0] as a normal AND term and
            // whereANDClauseWithSuffixArrray[1] as a special suffix term
            if (whereANDClauseWithSuffixArrray != null && whereANDClauseWithSuffixArrray.length != 0) {
                var tempWhereANDClauseWithSuffix;
                for (var j = 0; j < whereANDClauseWithSuffixArrray.length; j++) {
                    if (whereANDClauseWithSuffixArrray[j].indexOf('Starts with') != -1) {
                        operator = 'Starts with';
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    } else if (whereANDClauseWithSuffixArrray[j].indexOf('=') != -1) {
                        operator = '=';
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    }
                    whereANDClause = {"name": "", value: "", op: ""};
                    populateWhereANDClause(whereANDClause, whereANDTerm[0].trim(), whereANDTerm[1].trim(), operator);
                    if (j == 0) {
                        tempWhereANDClauseWithSuffix = whereANDClause;
                    } else if (j == 1) {
                        tempWhereANDClauseWithSuffix.suffix = whereANDClause;
                    }
                }
                whereANDArray[i] = tempWhereANDClauseWithSuffix;
            }
        }
    }
    return whereANDArray;
};

function populateWhereANDClause(whereANDClause, fieldName, fieldValue, operator) {
    var validLikeOPRFields = global.VALID_LIKE_OPR_FIELDS,
        validRangeOPRFields = global.VALID_RANGE_OPR_FIELDS,
        splitFieldValues;
    whereANDClause.name = fieldName;
    if (validLikeOPRFields.indexOf(fieldName) != -1 && fieldValue.indexOf('*') != -1) {
        whereANDClause.value = fieldValue.replace('*', '');
        whereANDClause.op = 7;
    } else if (validRangeOPRFields.indexOf(fieldName) != -1 && fieldValue.indexOf('-') != -1) {
        splitFieldValues = splitString2Array(fieldValue, '-');
        whereANDClause.value = splitFieldValues[0];
        whereANDClause['value2'] = splitFieldValues[1];
        whereANDClause.op = 3;
    } else {
        whereANDClause.value = fieldValue;
        whereANDClause.op = getOperatorCode(operator);
    }
};

function splitString2Array(strValue, delimiter) {
    var strArray = strValue.split(delimiter),
        count = strArray.length;
    for (var i = 0; i < count; i++) {
        strArray[i] = strArray[i].trim();
    }
    return strArray;
};

function getTGSecs(tg, tgUnit) {
    if (tgUnit == 'secs') {
        return tg;
    } else if (tgUnit == 'mins') {
        return tg * 60;
    } else if (tgUnit == 'hrs') {
        return tg * 3600;
    } else if (tgUnit == 'days') {
        return tg * 86400;
    }
};

function getFilterObj(filter) {
    var filterObj;
    if (filter.indexOf('!=') != -1) {
        filterObj = parseFilterObj(filter, '!=');
    } else if (filter.indexOf(" RegEx= ") != -1) {
        filterObj = parseFilterObj(filter, 'RegEx=');
    } else if (filter.indexOf("=") != -1) {
        filterObj = parseFilterObj(filter, '=');
    }
    return filterObj;
};

function getOperatorCode(operator) {
    if (operator == '=') {
        return 1;
    } else if (operator == '!=') {
        return 2;
    } else if (operator == 'RegEx=') {
        return 8;
    } else if (operator == 'Starts with') {
        return 7;
    } else {
        return -1
    }
};

function isEmptyObject(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
};

exports.runGETQuery = runGETQuery;
exports.runPOSTQuery = runPOSTQuery;
exports.getTables = getTables;
exports.getTableColumnValues = getTableColumnValues;
exports.getTableSchema = getTableSchema;
exports.getQueryQueue = getQueryQueue;
exports.getChartGroups = getChartGroups;
exports.getChartData = getChartData;
exports.deleteQueryCache4Ids = deleteQueryCache4Ids;
exports.deleteQueryCache4Queue = deleteQueryCache4Queue;
exports.flushQueryCache = flushQueryCache;
exports.exportQueryResult = exportQueryResult;
exports.getQueryJSON4Table = getQueryJSON4Table;
exports.getCurrentTime = getCurrentTime;


/*
function parseStatsQuery(reqQuery) {
    var select, where, fromTimeUTC, toTimeUTC, statQuery, filters, table, tg, tgUnit, filtersArray;
    table = reqQuery['table'];
    statQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    select = reqQuery['select'];
    where = reqQuery['where'];
    filters = reqQuery['filters'];
    tg = reqQuery['tgValue'];
    tgUnit = reqQuery['tgUnits'];
    setMicroTimeRange(statQuery, fromTimeUTC, toTimeUTC);
    if (select != "") {
        parseSelect(statQuery, select, tg, tgUnit);
    }
    parseStatWhere(statQuery, where);
    if (filters != null && filters != '') {
        // splitting the filters and using parseFilter for the [name, value, operator] and parseFSFilter for
        // [sortfields, sortby, limit]
        filtersArray = filters.split(',');
        parseFilter(statQuery, filtersArray[0].toString().replace("filter: ", ""));
        filtersArray.shift();
        parseFSFilter(statQuery, filtersArray.toString());
    }
    return statQuery;
};

function parseFRQuery(reqQuery) {
    var select, where, fromTimeUTC, toTimeUTC, frQuery, table, direction, filters;
    table = reqQuery['table'];
    frQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    select = reqQuery['select'];
    where = reqQuery['where'];
    filters = reqQuery['filters'];
    direction = parseInt(reqQuery['direction']);
    if (reqQuery['limit'] != null) {
        frQuery['limit'] = reqQuery['limit'];
    }
    setMicroTimeRange(frQuery, fromTimeUTC, toTimeUTC);
    if (select != "") {
        parseSelect(frQuery, select);
    }
    parseWhere(frQuery, where);
    if (direction >= 0) {
        frQuery['dir'] = direction;
    }
    if (filters != null) {
        parseFSFilter(frQuery, filters);
    }
    return frQuery;
};

function parseFSFilter(query, filters) {
    var arrayStart, arrayEnd, sortFieldsStr, sortFieldsArray,
        limitSortOrderStr, limitSortOrderArray, count, sortOrder, limitArray, limit;
    if (filters != null && filters.trim() != '') {
        try {
            arrayStart = filters.indexOf('[');
            arrayEnd = filters.indexOf(']');
            if (arrayStart != -1 && arrayEnd != -1) {
                sortFieldsStr = filters.slice(arrayStart + 1, arrayEnd);
                sortFieldsArray = splitString2Array(sortFieldsStr, ',');
                limitSortOrderStr = filters.slice(arrayEnd + 1);
            } else {
                limitSortOrderStr = filters;
            }
            limitSortOrderArray = splitString2Array(limitSortOrderStr, ',');
            count = limitSortOrderArray.length;
            for (var i = 0; i < count; i++) {
                if (limitSortOrderArray[i] == '') {
                    continue;
                } else if (limitSortOrderArray[i].indexOf('sort') != -1) {
                    sortOrder = splitString2Array(limitSortOrderArray[i], ':');
                    if (sortOrder.length > 1 && sortOrder[1] != '') {
                        if (sortOrder[1].toLowerCase() == 'asc') {
                            query['sort'] = 1;
                        } else {
                            query['sort'] = 2;
                        }
                        query['sort_fields'] = sortFieldsArray;
                    }
                } else if (limitSortOrderArray[i].indexOf('limit') != -1) {
                    limitArray = splitString2Array(limitSortOrderArray[i], ':');
                    if (limitArray.length > 1 && limitArray[1] != '') {
                        try {
                            limit = parseInt(limitArray[1]);
                            if (limit > 0) {
                                query['limit'] = limit;
                            }
                        } catch (err) {
                            logutils.logger.error(err.stack);
                        }
                    }
                }
            }
        } catch (error) {
            logutils.logger.error(error.stack);
        }
    }
};

function getJSONClone(json) {
    var newJSONStr = JSON.stringify(json);
    return JSON.parse(newJSONStr);
};

function parseStatWhere(query, where) {
    if (where != null && where.trim() != '') {
        var whereORArray = where.split(' OR '),
            whereORLength = whereORArray.length,
            i;
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            whereORArray[i] = parseWhereANDClause(whereORArray[i]);
        }
        query['where'] = whereORArray;
    } else {
        if (where == '') {
            //set value to '' and op to 7 when a where * is entered
            query['where'] = [[{name: 'name', value: '', op: 7}]];
        }
    }
};
function parseSLFilter(query, filters) {
    var filtersArray, filtersLength, filterClause = [], i, filterObj;
    if (filters != null && filters.trim() != '') {
        filtersArray = filters.split(' AND ');
        filtersLength = filtersArray.length;
        for (i = 0; i < filtersLength; i += 1) {
            filtersArray[i] = filtersArray[i].trim();
            filterObj = getFilterObj(filtersArray[i]);
            filterClause.push(filterObj);
        }
        for (var i = 0; i < query['filter'].length; i++) {
            query['filter'][i] = query['filter'][i].concat(filterClause);
        }
    }
};


function parseSLWhere(query, where, keywords) {
    var keywordsArray = keywords.split(',');
    if (keywords != null && keywords.trim() != '') {
        for (var i = 0; i < keywordsArray.length; i++) {
            keywordsArray[i] = keywordsArray[i].trim();
        }
    }
    if (where != null && where.trim() != '') {
        var whereORArray = where.split(' OR '),
            whereORLength = whereORArray.length, i,
            newWhereOR, newWhereORArray = [];
        var keywordsStr = getKeywordsStrFromArray(keywordsArray), where = [];
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            newWhereOR = whereORArray[i].substr(0, whereORArray[i].length - 1);
            where[i] = newWhereOR.concat(" AND " + keywordsStr + " )");
            where[i] = parseWhereANDClause(where[i]);
        }
        query['where'] = where;
    } else {
        if (keywords != null && keywords.trim() != '') {
            var where = [];
            query['where'] = parseKeywordsObj(keywordsArray);
        }
    }
}


function parseOTQuery(requestQuery) {
    var reqQuery = parseFilterAndLimit(requestQuery),
        objTraceQuery, fromTimeUTC, toTimeUTC, where, filters, objectType, select, objectId, limit;

    select = reqQuery['select'];
    objectType = reqQuery['objectType'];
    objTraceQuery = createOTQueryJSON(objectType);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    objectId = reqQuery['objectId'];
    filters = reqQuery['filters'];
    where = reqQuery['where'];
    limit = parseInt(reqQuery['limit']);

    setMicroTimeRange(objTraceQuery, fromTimeUTC, toTimeUTC);
    parseOTWhere(objTraceQuery, where, objectId);

    if (select != null && select.trim() != '') {
        parseOTSelect(objTraceQuery, select);
    } else {
        objTraceQuery['select_fields'] = objTraceQuery['select_fields'].concat(['ObjectLog', 'SystemLog']);
    }

    if (limit > 0) {
        objTraceQuery['limit'] = limit;
    }

    if (filters != null && filters != '') {
        parseFilter(objTraceQuery, filters);
    }

    return objTraceQuery;
};

function createOTQueryJSON(objectType) {
    var queryJSON = getQueryJSON4Table(objectType);
    if (queryJSON != null) {
        return getQueryJSON4Table(objectType);
    } else {
        queryJSON = getQueryJSON4Table('ObjectTableQueryTemplate');
    }
    queryJSON['table'] = objectType;
    return queryJSON;
}

function parseOTSelect(objTraceQuery, select) {
    var selectArray = select.split(','),
        selectLength = selectArray.length;
    for (var i = 0; i < selectLength; i++) {
        selectArray[i] = selectArray[i].trim();
    }
    objTraceQuery['select_fields'] = objTraceQuery['select_fields'].concat(selectArray);
};

function parseOTWhere(otQuery, where, objectId) {
    parseWhere(otQuery, where);
    var whereClauseArray, whereClauseLength, i;
    if (otQuery.where != null) {
        whereClauseArray = otQuery.where;
        whereClauseLength = whereClauseArray.length;
        for (i = 0; i < whereClauseLength; i += 1) {
            if (objectId != null && objectId != "") {
                whereClauseArray[i].push(createClause('ObjectId', objectId, 1));
            }
        }
        otQuery.where = whereClauseArray;
    } else if (objectId != null && objectId != "") {
        whereClauseArray = [
            []
        ];
        whereClauseArray[0].push(createClause('ObjectId', objectId, 1));
        otQuery.where = whereClauseArray;
    }
};


function createSLWhere(msgQuery, moduleId, messageType, source, category) {
    var whereClauseArray = [];
    if (moduleId != null && moduleId != "") {
        whereClauseArray.push(createClause('ModuleId', moduleId, 1));
    }
    if (messageType != null && messageType != "") {
        whereClauseArray.push(createClause('Messagetype', messageType, 1));
    }
    if (source != null && source != "") {
        whereClauseArray.push(createClause('Source', source, 1));
    }
    if (category != null && category != "") {
        whereClauseArray.push(createClause('Category', category, 1));
    }
    msgQuery.where = [whereClauseArray];
};

function createSLFilter(msgQuery, level) {
    var filterClauseArray = [];
    filterClauseArray.push(createClause('Level', level, 5));
    for (var i = 0; i < msgQuery.filter.length; i++) {
        msgQuery.filter[i] = msgQuery.filter[i].concat(filterClauseArray);
    }
};


function parseSLQuery(requestQuery) {
    var reqQuery = parseFilterAndLimit(requestQuery),
        msgQuery, fromTimeUTC, toTimeUTC, where, filters, table, level, category, moduleId, source, messageType, limit, keywords;

    table = reqQuery['table'];
    msgQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    limit = parseInt(reqQuery['limit']);
    where = reqQuery['where'];
    filters = reqQuery['filters'];
    level = reqQuery['level'];
    category = reqQuery['category'];
    setMicroTimeRange(msgQuery, fromTimeUTC, toTimeUTC);
    keywords = reqQuery['keywords'];
    if (where != null) {
        if (keywords != null && keywords != '') {
            parseSLWhere(msgQuery, where, keywords);
        }
        else {
            parseWhere(msgQuery, where);
        }
    } else {
        moduleId = reqQuery['moduleId'];
        source = reqQuery['source'];
        messageType = reqQuery['messageType'];
        createSLWhere(msgQuery, moduleId, messageType, source, category);
    }
    if (limit > 0) {
        msgQuery['limit'] = limit;
    }
    if (level != null && level != '') {
        createSLFilter(msgQuery, level);
    }
    if (filters != null && filters != '') {
        parseSLFilter(msgQuery, filters);
    }
    return msgQuery;
};


function parseQueryTime(queryId) {
    var splitQueryIds = splitString2Array(queryId, '-'),
        timeStr = splitQueryIds[splitQueryIds.length - 1];
    return parseInt(timeStr);
};

function createKey4StatChart(statGroupFields) {
    var key = statGroupFields[0] + "-";
    for (var i = 1; i < statGroupFields.length - 1; i++) {
        key = key.concat(statGroupFields[i] + "-");
    }
    key = key.concat(statGroupFields[statGroupFields.length - 1]);
    return key;
};

function getKeywordsStrFromArray(keywords) {
    var tempStr = "";
    for (var i = 1; i < keywords.length; i++) {
        tempStr = tempStr.concat("AND Keyword = " + keywords[i] + " ");
    }
    var final = ("Keyword = " + keywords[0] + " ").concat(tempStr);
    return final;
}

function parseKeywordsObj(keywordsArray) {
    var keywordObj = [], keywordArray = [], finalkeywordArray = [];
    for (var i = 0; i < keywordsArray.length; i++) {
        keywordObj[i] = {"name": "", value: "", op: ""};
        keywordObj[i].name = "Keyword";
        keywordObj[i].value = keywordsArray[i];
        keywordObj[i].op = 1;
        keywordArray.push(keywordObj[i]);
    }
    finalkeywordArray.push(keywordArray);
    return finalkeywordArray;
};

function createClause(fieldName, fieldValue, operator) {
    var whereClause = {};
    if (fieldValue != null) {
        whereClause = {};
        whereClause.name = fieldName;
        whereClause.value = fieldValue;
        whereClause.op = operator;
    }
    return whereClause;
};

function parseFilterAndLimit(reqObject) {
    var filters, filterWithLimit, filter, limit;
    filters = reqObject['filters'];
    if (null == filters || "" == filters) {
        return reqObject;
    }
    filterWithLimit = filters.split(',');
    filter = filterWithLimit[0];
    limit = filterWithLimit[1];
    if (filter != null && filter.trim() != '') {
        filter = filter.split(':');
        reqObject['filters'] = filter[1].trim();
    }
    if (limit != null && limit.trim() != '') {
        limit = limit.split(':');
        reqObject['limit'] = limit[1].trim();
    }
    return reqObject;
}

function saveStatsData4Chart2Redis(queryId, dataJSON, queryOptions) {
    var resultData = {}, result,
        secTime, uniqueFlowClassArray = [],
        flowClassArray = [];

    var statPlotFields = queryOptions.statPlotFields,
        statGroupFields = queryOptions.statGroupFields;

    if (statPlotFields != undefined && statPlotFields.length != 0) {
        for (var i = 0; i < dataJSON.length; i++) {
            if (dataJSON[i]['T'] !== undefined) {
                secTime = Math.floor(dataJSON[i]['T'] / 1000);
            } else if (dataJSON[i]['T='] !== undefined) {
                secTime = Math.floor(dataJSON[i]['T='] / 1000);
            }
            var resultStatGroupFields = [], resultStatGroupFieldsKey;

            for (var x = 0; x < statPlotFields.length; x++) {
                if (statGroupFields[x] in dataJSON[i]) {
                    resultStatGroupFields.push(dataJSON[i][statGroupFields[x]]);
                }
            }
            result = {'date': new Date(secTime)};
            //CLASS(T=) is used as the stat_class_id and is used to store data in redis.
            resultStatGroupFieldsKey = dataJSON[i]['CLASS(T=)'];
            if (uniqueFlowClassArray.indexOf(resultStatGroupFieldsKey) == -1) {
                uniqueFlowClassArray.push(resultStatGroupFieldsKey);
                var statFlowClassRecord = getStatClassRecord(resultStatGroupFieldsKey, resultStatGroupFields, dataJSON[i]);
                flowClassArray.push(statFlowClassRecord);
            }

            if (resultData[resultStatGroupFieldsKey] == null) {
                resultData[resultStatGroupFieldsKey] = {};
                dataJSON[i]['date'] = new Date(secTime);
                dataJSON[i] = getStatClassRecord(resultStatGroupFieldsKey, resultStatGroupFields, dataJSON[i]);
                resultData[resultStatGroupFieldsKey][secTime] = dataJSON[i];
            } else {
                dataJSON[i]['date'] = new Date(secTime);
                dataJSON[i] = getStatClassRecord(resultStatGroupFieldsKey, resultStatGroupFields, dataJSON[i]);
                resultData[resultStatGroupFieldsKey][secTime] = dataJSON[i];
            }
        }
    }

    redisClient.set(queryId + ':flowclasses', JSON.stringify(flowClassArray));
    redisClient.set(queryId + ':chartdata', JSON.stringify(resultData));
};


function getStatClassRecord(key, resultStatGroupFields, row) {
    row['stat_flow_class_id'] = key;
    return row;
};
*/