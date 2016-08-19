/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-details-view-test-suite'
], function (cotc, cotr, cttu, cttm, DetailsViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;
    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function() {

        var responses = [];

        responses.push({
            url: cttu.getRegExForUrl('/api/tenants/config/domains').toString(),
            fnName: 'domainsMockData'
        });

        responses.push({
            url: cttu.getRegExForUrl('/api/tenants/config/projects').toString(),
            fnName: 'projectMockData'
        });

        responses.push({
            url: cttu.getRegExForUrl('/api/tenants/projects/default-domain').toString(),
            fnName: 'projectMockData'
        });

        responses.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenants/networks/default-domain:admin').toString(),
            fnName: 'networksForAdminProjectMockData'
        });

        responses.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend').toString(),
            fnName: 'networkSummaryForFrontEndNetworkMockData'
        });

        responses.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend').toString(),
            fnName: 'flowSeriesForFrontendVNMockData'
        });

        responses.push({
            url: cttu.getRegExForUrl('/api/tenants/get-project-role').toString(),
            fnName: 'empty'
        });
        
        responses.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend').toString(),
            fnName: 'networkStatsForFrontendVNMockData'
        });

        responses.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend').toString(),
            fnName: 'networkConnectedGraphForFrontEndNetworkMockData'
        });

        responses.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend').toString(),
            fnName: 'networkConfigGraphForFrontEndNetworkMockData'
        });

        responses.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn').toString(),
            fnName: 'virtualMachineDetailsByUUIDMockData'
        });

        responses.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/summary').toString(),
            fnName: 'virtualMachinesSummaryMockData'
        });

        responses.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary').toString(),
            fnName: 'virtualMachinesInterfacesMockData'
        });

        responses.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/stats').toString(),
            fnName: 'virtualMachinesStatsMockData'
        });
        return responses;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'monitor/networking/test/ui/views/NetworkView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            view: 'details',
            type: 'network',
            "focusedElement": {
                "fqName": "default-domain:admin:frontend",
                "type": "virtual-network"
            },
            "reload": "false",
            "tab": {
                "network-tabs": "network-details"
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function () {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.NETWORK_DETAILS_ID,
                    suites: [
                        {
                            class: DetailsViewTestSuite,
                            groups: ['all'],
                            modelConfig: {
                                dataGenerator: cttu.commonDetailsDataGenerator
                            }
                        }
                    ]
                }
            ]
        };

    };

    var testInitFn = function (defObj, onAllViewsRenderComplete) {
        setTimeout(function () {
                onAllViewsRenderComplete.notify();
                defObj.resolve();
            },
            // Add necessary timeout for the tab elements to load properly and resolve the promise
            cotc.PAGE_INIT_TIMEOUT * 10
        );

        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;

});
