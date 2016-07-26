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

        module(cotu.formatTestModuleMessage(cttm.LOGS_FORM_CUSTOM_TEST, el.id));

        var logsFormView = cotr.createTestSuite('logsFormView');

        var testGroup = logsFormView.createTestGroup('error');

        /**
         *  Custom test case to see the presence of error messages
         */
        testGroup.registerTest(cotr.test(cttm.LOGS_FORM_CUSTOM_TEST, function (assert) {

            var done2 = assert.async();
            expect(1);
            // Click expand button.
            $('.widget-body-collapsed').trigger('click');
            $($('.add-on .icon-pencil')[0]).trigger('click');
            setTimeout(function () {
                //clear all fields
                $('.selectAllLink').trigger('click');
                $('.btnSave').trigger('click');

                $('#run_query').trigger('click');
                var isPresent = $("span.help-block").text().trim().indexOf("Select is required") > -1 ? true : false;
                equal(isPresent, true,
                    "Custom test to assert the error message when no field is selected");

                done2();
            }, cotc.FORM_ACTIONS_TIMEOUT * 2);

        }, cotc.SEVERITY_MEDIUM));

        logsFormView.run(suiteConfig.groups, suiteConfig.severity);
    };

    return testSuiteClass;
});