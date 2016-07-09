/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/FlowGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-error-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridViewErrorTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];


        responses.push(cotr.createFakeServerResponse({
            statusCode: 404,
            method: "GET",
            url: cttu.getRegExForUrl('/api/admin/error'),
            body: JSON.stringify(TestMockdata.flowsMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            "fqName": "default-domain:admin:frontend",
            "port": "9110",
            "portType": "dst",
            "type": "flow",
            "view": "details"
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_FLOW_GRID_ID,
                    suites: [
                        {
                            class: GridViewErrorTestSuite,
                            groups: ['body']
                        }
                    ]
                },
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});
