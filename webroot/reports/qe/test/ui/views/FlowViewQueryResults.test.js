/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'reports/qe/test/ui/views/FlowQueryQueueView.mock.data',
    'co-grid-view-test-suite'
], function (cotc,cotr, cttu, cttm, TestMockdata, GridViewTestSuite) {

    var moduleId = cttm.FLOW_QUERY_QUEUE_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse({
            method:"GET",
            url: cttu.getRegExForUrl('/api/qe/query/queue?queryQueue=fqq'),
            body: JSON.stringify(TestMockdata.viewQueryQueueMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: ctwc.URL_QUERY_RESULT,
            body: JSON.stringify(TestMockdata.flowViewQuery)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'query_flow_queue',
        q: {
            label: 'Query Queue'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: qePageLoader.qeView,
            tests: [
                {
                    viewId: cowl.QE_QUERY_QUEUE_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
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
            console.log("now......");
            },
            // Add necessary timeout for the tab elements to load properly and resolve the promise
            cotc.PAGE_INIT_TIMEOUT * 10
        );
        $('.grid-action-dropdown').trigger('click');
        $('.tooltip-success').click();
        return;
    };

   //  var viewDropDown = $(el).find('.grid-action-dropdown');

   //  $(viewDropDown).trigger('click');
   // var inputBox = $(el).find('.input-grid-search');
   // inputBox.val('default-domain:admin:frontend');
   // inputBox.keyup();
    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);

    cotr.startTestRunner(pageTestConfig);


});
