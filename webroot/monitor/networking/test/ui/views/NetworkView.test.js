/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'controller-constants',
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-tabs-view-test-suite'
], function (ctwc, cotc, cotr, cttu, cttm, TabsViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function () {
        /*
         /tenants/config/domains                                                                                                     done
         /tenants/config/projects                                                                                                    done
         /tenants/networks/default-domain:admin                                                                                      done
         /tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend                                       done
         /tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend&sampleCnt=120                          done
         /tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend                                      done
         /tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend                                             done
         /tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend                                                done
         /tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&type=vn                   done
         /tenant/networking/virtual-machines/summary                                                                                 done
         /tenant/networking/virtual-machine-interfaces/summary                                                                       done
         /tenant/networking/stats                                                                                                    done
         */
        var routesConfig = {
            mockDataFiles: {
                networkViewMockData: 'monitor/networking/test/ui/views/NetworkView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
                    response: {data: 'networkViewMockData.domainsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
                    response: {data: 'networkViewMockData.projectsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/projects/default-domain'),
                    response: {data: 'networkViewMockData.projectsMockData'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenants/networks/default-domain:admin'),
                    response: {data: 'networkViewMockData.networksForAdminProjectMockData'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend'),
                    response: {data: 'networkViewMockData.networkSummaryForFrontEndNetworkMockData'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend'),
                    response: {data: 'networkViewMockData.flowSeriesForFrontendVNMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
                    response: {data: '{}'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend'),
                    response: {data: 'networkViewMockData.networkStatsForFrontendVNMockData'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend'),
                    response: {data: 'networkViewMockData.networkConnectedGraphForFrontEndNetworkMockData'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend'),
                    response: {data: 'networkViewMockData.networkConfigGraphForFrontEndNetworkMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn'),
                    response: {data: 'networkViewMockData.virtualMachineDetailsByUUIDMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/summary'),
                    response: {data: 'networkViewMockData.virtualMachinesSummaryMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
                    response: {data: 'networkViewMockData.virtualMachinesInterfacesMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
                    response: {data: 'networkViewMockData.virtualMachinesStatsMockData'}
                }
            ]
        };
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            view: 'details',
            type: 'network',
            "focusedElement": {
                "fqName": "default-domain:admin:frontend",
                "type": "virtual-network"
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    /**
     * Test cases for components in each project tab will be tested in their respective tab pages.
     */
    var getTestConfig = function () {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.NETWORK_TABS_ID,
                    suites: [
                        {
                            class: TabsViewTestSuite,
                            groups: ['all']
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;
});
