/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-constants',
    'co-test-runner',
    'ct-test-messages',
], function (_, cotu, cotc, cotr, cttm) {

    var testSuiteClass = function (viewObj, suiteConfig) {

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            gridData = $(el).data('contrailGrid'),
            gridItems = gridData._dataView.getItems();

        var viewConfigHeader = viewConfig.elementConfig.header,
            viewConfigColHeader = viewConfig.elementConfig.columnHeader,
            viewConfigBody = viewConfig.elementConfig.body,
            viewConfigFooter = viewConfig.elementConfig.footer;

        module(cotu.formatTestModuleMessage(cttm.NETWORK_LIST_VIEW_CUSTOM_TEST, el.id));

        var gridViewCustomTestSuite = cotr.createTestSuite('GridViewCustomTestSuite');

        /**
         * Grid Body group Custom test cases
         */

        var bodyTestGroup = gridViewCustomTestSuite.createTestGroup('body');


        /**
         * This is a sample custom test for network list grid.
         * In this testcase, we'll check for second row Traffic in/out value (5th Column).
         */

        bodyTestGroup.registerTest(cotr.test(cttm.NETWORKS_GRID_COLUMN_VALUE_CHECK, function() {
            expect(1);
            equal($($(el).find('.grid-body .slick_row_id_1 .slick-cell')[4]).text(), "12 MB / 9 MB",
                "Custom test to assert 2nd row 5th col value");

        }, cotc.SEVERITY_MEDIUM));

        //Search
        bodyTestGroup.registerTest(cotr.test("Search scenario", function () {
            expect(2);
            //find the search box
            var searchBox = $(el).find('.link-searchbox');

            $(searchBox).trigger('click');
            var inputBox = $(el).find('.input-grid-search');
            inputBox.val('default-domain:admin:frontend');
            inputBox.keyup();

            stop();
            setTimeout(function(){
                equal($($(el).find('.grid-body .slick-cell')).text().trim().includes("default-domain:admin:frontend"), true,
                "Custom test to assert 2nd if default-domain:admin:frontend exists");
                equal($($(el).find('.grid-body .slick-cell')).text().trim().includes("default-domain:admin:backend"), false,
                    "Custom test to assert 2nd if default-domain:admin:backend should not exist");
                console.log("the grid is"+$(el).find('.grid-body .slick-cell').text().trim());
                start();
            },3000);
            console.log("Search the box");

        }, cotc.SEVERITY_HIGH));

        gridViewCustomTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});