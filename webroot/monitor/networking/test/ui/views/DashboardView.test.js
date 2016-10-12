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
], function (ctConstants, cotc, cotr, cttu, cttm, TabsViewTestSuite) {

    var moduleId = cttm.PROJECTS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles : {
                dashboardViewMockDataFile: "monitor/networking/test/ui/views/DashboardView.mock.data.js"
            },
            routes: []
        };

        /*
         /api/tenants/config/domains                      done
         /api/tenants/config/projects                     done
         /api/tenant/networking/virtual-networks/details  done
         /api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin&useServerTime=true&type=port&_=1442526971361  done
         /api/tenant/monitoring/project-connected-graph?fqName=default-domain:admin&_=1442526971867 done
         /api/tenant/monitoring/project-config-graph?fqName=default-domain:admin&_=1442869670788 done
         /api/tenant/networking/virtual-networks/details?count=25&fqn=default-domain:admin&startAt=1442869670641 done
         /api/tenant/networking/virtual-machines/details?fqnUUID=ba710bf3-922d-4cda-bbb4-a2e2e76533bf&count=10&type=project  done
         /api/tenant/networking/virtual-machine-interfaces/summary  done
         /api/tenant/networking/stats done
         */

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_DOMAINS),
            response: { data: 'dashboardViewMockDataFile.domainsMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_PROJECTS),
            response: { data: 'dashboardViewMockDataFile.projectMockData'}
        });
        routesConfig.routes.push( {
            urlRegex: '/\/api\/tenants\/projects\/default-domain.*$/',
            response: { data: 'dashboardViewMockDataFile.projectMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
            response: { data: "{}"}
        });
        routesConfig.routes.push({
            method: "GET",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top'),
            response: { data: 'dashboardViewMockDataFile.portDistributionMockData'}
        });
        routesConfig.routes.push({
            method: "GET",
            urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-connected-graph'),
            response: { data: 'dashboardViewMockDataFile.projectConnectedGraph'}
        });
        routesConfig.routes.push({
            method: "GET",
            urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-config-graph'),
            response: { data: 'dashboardViewMockDataFile.projectConfigGraph'}
        });
        routesConfig.routes.push({
            method:"POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details'),
            response: { data: 'dashboardViewMockDataFile.networksMockData'}
        });
        routesConfig.routes.push({
            method:"POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
            response: { data: 'dashboardViewMockDataFile.virtualMachinesDetailsMockData'}
        });
        routesConfig.routes.push({
            method:"POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
            response: { data: 'dashboardViewMockDataFile.networksMockStatData'}
        });
        // how to differentiate between this POST request and the one for networks above
        //routesConfig.routes.push({
        //    method:"POST",
        //    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
        //    response: { data: 'dashboardViewMockDataFile.virtualMachinesStatsMockData) }
        //}));
        routesConfig.routes.push({
            method:"POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
            response: { data: 'dashboardViewMockDataFile.virtualMachinesSummaryMockData'}
        });

        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_dashboard',
        q: {
            view: 'details',
            type: 'project'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    /**
     * Test cases for components in each project tab will be tested in their respective tab pages.
     */
    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_TABS_ID,
                    suites: [
                        {
                            class: TabsViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        } ;

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
