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
    /*
     /api/tenants/config/domains                                                                                                     [done]
     /api/tenants/config/projects                                                                                                    [done]
     /api/tenant/networking/virtual-networks/details                                                                                 [done]
     /api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin&useServerTime=true&type=port&_=1442526971361  [done]
     /api/tenant/monitoring/project-connected-graph?fqName=default-domain:admin&_=1442526971867                                      [done]
     /api/tenant/monitoring/project-config-graph?fqName=default-domain:admin&_=1442869670788                                         [done]
     /api/tenant/networking/virtual-networks/details?count=25&fqn=default-domain:admin&startAt=1442869670641                         [done]
     /api/tenant/networking/virtual-machines/details?fqnUUID=ba710bf3-922d-4cda-bbb4-a2e2e76533bf&count=10&type=project              [done]
     /api/tenant/networking/virtual-machine-interfaces/summary                                                                       [done]
     /api/tenant/networking/stats                                                                                                    [done]
     /api/tenants/get-project-role                                                                                                   [done]
     */
    testServerConfig.getRoutesConfig = function () {
        var routesConfig = {
            mockDataFiles: {
                projectViewMockData: 'monitor/networking/test/ui/views/ProjectView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/domains'),
                    response: {data: 'projectViewMockData.domainsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/projects'),
                    response: {data: 'projectViewMockData.projectsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/projects/default-domain'),
                    response: {data: 'projectViewMockData.projectsMockData'}
                },

                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
                    response: {data: '{}'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top'),
                    response: {data: 'projectViewMockData.portDistributionMockData'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-connected-graph'),
                    response: {data: 'projectViewMockData.projectConnectedGraph'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-config-graph'),
                    response: {data: 'projectViewMockData.projectConfigGraph'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details'),
                    response: {data: 'projectViewMockData.networksMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
                    response: {data: 'projectViewMockData.virtualMachinesDetailsMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
                    response: {data: 'projectViewMockData.networksMockStatData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
                    response: {data: 'projectViewMockData.virtualMachinesSummaryMockData'}
                }
            ]
        };

        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_projects',
        q: {
            view: 'details',
            type: 'project',
            "focusedElement": {
                "fqName": "default-domain:admin",
                "type": "project"
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
                    viewId: ctwl.PROJECT_TABS_ID,
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
