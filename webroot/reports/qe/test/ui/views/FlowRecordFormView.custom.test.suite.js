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

        module(cotu.formatTestModuleMessage(cttm.FLOW_RECORDS_FORM_CUSTOM_TEST));

        var flowRecordFormView = cotr.createTestSuite('flowRecordFormView');

        var flowRecordFormTestGroup = flowRecordFormView.createTestGroup('error');

        /**
         *  Custom test case to see the presence of error messages
         */
        flowRecordFormTestGroup.registerTest(cotr.test(cttm.FLOW_RECORDS_FORM_CUSTOM_TEST, function (assert) {

            var done2 = assert.async();
            expect(1);
            // Click expand button.
            cotu.triggerClickOnElement('.widget-body-collapsed');
            cotu.triggerClickOnElement($('.add-on .icon-pencil')[0]);
            setTimeout(function () {
                //clear all fields
                cotu.triggerClickOnElement('.selectAllLink');
                cotu.triggerClickOnElement('.btnSave');

                cotu.triggerClickOnElement('#run_query');
                var isPresent = cotu.compareIfMessageExists($("span.help-block").text().trim(), "Select is required");
                equal(isPresent, true,
                    "Custom test to assert the error message when no field is selected");

                done2();
            }, cotc.FORM_ACTIONS_TIMEOUT * 2);

        }, cotc.SEVERITY_MEDIUM));

        flowRecordFormView.run(suiteConfig.groups, suiteConfig.severity);
    };

    return testSuiteClass;
});