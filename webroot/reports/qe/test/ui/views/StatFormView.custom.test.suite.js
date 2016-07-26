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

        module(cotu.formatTestModuleMessage(cttm.STAT_FORM_CUSTOM_TEST, el.id));

        var statFormView = cotr.createTestSuite('statFormView');
        var testGroup = statFormView.createTestGroup('error');
        /**
         *  Custom test case to see the presence of error messages
         */
        testGroup.registerTest(cotr.test(cttm.STAT_FORM_CUSTOM_TEST, function (assert) {

            var done2 = assert.async();

            expect(2);
            //click flow series tab.
            $('a[href$="query_stat_query"]').trigger('click');

            var isPresent = false;
            //  Run query without selecting any table.
            setTimeout(function () {
                $('#run_query').trigger('click');
                isPresent = $("span.help-block").text().trim().indexOf("Table Name is required") > -1 ? true : false;
                equal(isPresent, true,
                    "Custom test to assert the error message when no field is selected");

            }, cotc.ASSERT_TIMEOUT * 2);

            //select the table and run query without selecting fields.
            $($('span.add-on')[0]).trigger('click');
            $($('.ui-menu-item')[0]).trigger('click');
            $($('.add-on .icon-pencil')[0]).trigger('click');

            setTimeout(function () {
                //clear all fields
                $('.selectAllLink').trigger('click');
                $('.btnSave').trigger('click');

                $('#run_query').trigger('click');
                isPresent = $("span.help-block").text().trim().indexOf("Select is required") > -1 ? true : false;
                equal(isPresent, true,
                    "Custom test to assert the error message when no field is selected");
                done2();
            }, cotc.ASSERT_TIMEOUT * 2);

        }, cotc.SEVERITY_MEDIUM));

        statFormView.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});