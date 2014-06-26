/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @projectconfig.api.js
 *     - Handlers for Project Configuration
 *     - Interfaces with config api server
 */

var ctrlerConfig     = require('../../../common/js/controller.config.global');
var rest             = require(ctrlerConfig.core_path +
                               '/src/serverroot/common/rest.api');
var projectconfigapi = module.exports;
var logutils         = require(ctrlerConfig.core_path +
                               '/src/serverroot/utils/log.utils');
var commonUtils      = require(ctrlerConfig.core_path + '/src/serverroot/utils/common.utils');
var config           = require(ctrlerConfig.core_path + '/config/config.global.js');
var messages         = require(ctrlerConfig.core_path + '/src/serverroot/common/messages');
var global           = require(ctrlerConfig.core_path + '/src/serverroot/common/global');
var appErrors        = require(ctrlerConfig.core_path + '/src/serverroot/errors/app.errors.js');
var util             = require('util');
var url              = require('url');
var authApi          = require(ctrlerConfig.core_path + '/src/serverroot/common/auth.api');
var configApiServer  = require(ctrlerConfig.core_path + '/src/serverroot/common/configServer.api');

/**
 * Bail out if called directly as "nodejs projectconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listProjectsCb
 * private function
 * 1. Munges data from Keystone to api server equivalent output
 */
function listProjectsCb (error, apiProjects, projectLists, response)
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    authApi.formatTenantList (projectLists, apiProjects, 
                              function(projects) {
        commonUtils.handleJSONResponse(error, response, projects);
    });
}

/**
 * @listProjectsAPIServer
 * private function
 * 1. Gets list of projects from API server
 */
function listProjectsAPIServer (error, projectLists, response, appData)
{
    var projects   = {'projects':[]};
    var projectURL = '/projects';
 
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    /*configApiServer.apiGet(projectURL, appData,
                         function(error, data) {
                         listProjectsCb(error, data,
                                        projectLists, response)
                         });
    */
    if(projectLists && projectLists.hasOwnProperty("tenants")) {
        var projects = {};
        projects["projects"] = [];
        var tenantLen = projectLists['tenants'].length;
        for(var i=0; i<tenantLen; i++) {
            var tenant = projectLists['tenants'][i];
            projects["projects"].push({
                "uuid"    : convertKeystoneUuidToAPIServerUUID(tenant["id"]),
                "fq_name" : [
                    "default-domain",
                    tenant["name"]
                ]
            });
        }
        commonUtils.handleJSONResponse(error, response, projects);
    } else {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
}

/**
 * @listProjects
 * public function
 * 1. URL /api/tenants/config/projects
 * 2. Gets list of projects for the user, domain support
 *    to be added
 * 3. Plumbed with Keystone for now
 */
function listProjects (request, response, appData)
{

    authApi.getTenantList(request,
                         function(error, data) {
                         listProjectsAPIServer(error, data, response, appData);
                         });

}

/**
 * @listDomainsCb
 * private function
 */
function listDomainsCb (error, domainList, response)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, domainList);
    }
}

/**
 * @listDomains
 * public function
 * 1. URL /api/tenants/config/domains
 * 2. Gets list of domains for the user, domain support
 *    to be added
 * 3. Keystone doesn't support domains as of now so we
 *    pick up domain from api server
 */
function listDomains (request, response, appData)
{
    var domainsURL = '/domains';

    configApiServer.apiGet(domainsURL, appData,
                         function(error, data) {
                         listDomainsCb(error, data, response)
                         });
}

/**
 * @getProjectByParameterCb
 * private function
 * 1. Callback for getProjectByParameter
 * 2. Reads the response of project get from config api server
 *    and sends it back to the client.
 */
function getProjectByParameterCb(error, projectConfig, callback) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    callback(error, projectConfig);
}

/**
 * @getProjectByParameter
 * public function
 * 1. URL /api/tenants/config/project/:id
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Calls getProjectByParameterCb that process data from config
 *    api server and sends back the http response.
 */
function getProjectByParameter (request, response, appData) 
{
    var projectId = null;
    var requestParams    = url.parse(request.url, true);
    var params = {};
    if(null !== request.param("exclude_children") && 
        typeof request.param("exclude_children") !== "undefined")
        params.exclude_children = request.param("exclude_children");
    
    if(null !== request.param("exclude_back_refs") && 
        typeof request.param("exclude_back_refs") !== "undefined")
        params.exclude_back_refs = request.param("exclude_back_refs");

    if ((projectId = request.param('id'))) {
        getProjectAsync({uuid:projectId, appData:appData, params: params},
                       function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
}

function getProjectAsync (projectObj, callback)
{
    var projectId = projectObj['uuid'];
    var appData   = projectObj['appData'];
    var params    = projectObj['params'];

    var reqUrl = '/project/' + projectId;
    reqUrl = getUrlWithParameters(reqUrl, params);
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        getProjectByParameterCb(err, data, callback);
    });
}

function getUrlWithParameters(baseURL, params) {
    var reqUrl = baseURL;
    if(!isEmpty(params)) {
        reqUrl += "?";
        if(params.hasOwnProperty("exclude_back_refs")) {
            reqUrl += "exclude_back_refs=" + params["exclude_back_refs"];
            delete params["exclude_back_refs"];
        }
        if(!isEmpty(params)) {
            reqUrl += "&";
            if(params.hasOwnProperty("exclude_children")) {
                
                reqUrl += "exclude_children=" + params["exclude_children"];
                delete params["exclude_children"];
            }
        }
    }
    return reqUrl;
}

function isEmpty(obj) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}
/**
* @convertKeystoneUuidToAPIServerUUID
* Keystone UUID doesnt contain dashes '-'
* API server UUID contains dashes in the 8-4-4-4-12 format
* This function takes keystone UUID and converts to API Server UUID format.
*/
function convertKeystoneUuidToAPIServerUUID(keystone_uuid) {
    var api_uuid_format = "";
    api_uuid_format =
        keystone_uuid.substr(0, 8) + '-' +
        keystone_uuid.substr(8, 4) + '-' +
        keystone_uuid.substr(12, 4) + '-' + 
        keystone_uuid.substr(16, 4) + '-' + 
        keystone_uuid.substr(20, 12);
    return api_uuid_format;
}

exports.listDomains  = listDomains;
exports.listProjects = listProjects;
exports.getProjectByParameter   = getProjectByParameter;
