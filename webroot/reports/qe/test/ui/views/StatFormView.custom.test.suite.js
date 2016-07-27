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

        module(cotu.formatTestModuleMessage(cttm.STAT_FORM_CUSTOM_TEST));

        var statFormView = cotr.createTestSuite('statFormView');
        var statFormTestGroup = statFormView.createTestGroup('error');
        /**
         *  Custom test case to see the presence of error messages
         */
        statFormTestGroup.registerTest(cotr.test(cttm.STAT_FORM_CUSTOM_TEST, function (assert) {

            var done2 = assert.async();

            expect(2);
            //click flow series tab.
            cotu.triggerClickOnElement('a[href$="query_stat_query"]');

            var isPresent = false;
            //  Run query without selecting any table.
            setTimeout(function () {
                cotu.triggerClickOnElement('#run_query');
                isPresent = cotu.compareIfMessageExists(cotu.getTextInElement("span.help-block"), "Table Name is required");
                equal(isPresent, true,
                    "Custom test to assert the error message when no field is selected");

            }, cotc.ASSERT_TIMEOUT * 2);

            //select the table and run query without selecting fields.
            cotu.triggerClickOnElement($('span.add-on')[0]);
            cotu.triggerClickOnElement($('.ui-menu-item')[0]);
            cotu.triggerClickOnElement($('.add-on .icon-pencil')[0]);

            setTimeout(function () {
                //clear all fields
                cotu.triggerClickOnElement('.selectAllLink');
                cotu.triggerClickOnElement('.btnSave');

                cotu.triggerClickOnElement('#run_query');
                isPresent = cotu.compareIfMessageExists(cotu.getTextInElement("span.help-block"),"Select is required");
                equal(isPresent, true,
                    "Custom test to assert the error message when no field is selected");
                done2();
            }, cotc.ASSERT_TIMEOUT * 2);

        }, cotc.SEVERITY_MEDIUM));

        statFormView.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});