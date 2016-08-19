/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-tabs-view-test-suite'
], function (cotc, cotr, cttu, cttm, TabsViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function() {

        var routes = [];
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

        routes.push({
            url: '/api/tenants/config/domains',
            fnName: 'domainsMockData'
        });

        routes.push({
            url: '/api/tenants/config/projects',
            fnName: 'projectMockData'
        });

        routes.push({
            url: '/api/tenants/projects/default-domain',
            fnName: 'projectMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenants/networks/default-domain:admin',
            fnName: 'networksForAdminProjectMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend',
            fnName: 'networkSummaryForFrontEndNetworkMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend',
            fnName: 'flowSeriesForFrontendVNMockData'
        });
        routes.push({
            url: '/api/tenants/get-project-role',
            fnName: 'empty'
        });
        
        routes.push({
            method: "GET",
            url: '/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend',
            fnName: 'networkStatsForFrontendVNMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend',
            fnName: 'networkConnectedGraphForFrontEndNetworkMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend',
            fnName: 'networkConfigGraphForFrontEndNetworkMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn',
            fnName: 'virtualMachineDetailsByUUIDMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machines/summary',
            fnName: 'virtualMachinesSummaryMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machine-interfaces/summary',
            fnName: 'virtualMachinesInterfacesMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/stats',
            fnName: 'virtualMachinesStatsMockData'
        });
        return routes;
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;

});
