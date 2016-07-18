/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineBarWithFocusChartView
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var ko = require('knockout')
    var Knockback = require('knockback')
    var kbValidation = require('validation')

    var LineBarChartConfigView = ContrailView.extend({
        render: function () {
            var self = this

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), 'validation', null, null, function () {
                Knockback.applyBindings(self.model, self.$el[0])
                kbValidation.bind(self)
            })
        },

        getViewConfig: function () {
            return {
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'barColor', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Bar Color',
                                        path: 'barColor',
                                        dataBindValue: 'barColor',
                                        class: 'span6',
                                    },
                                }, {
                                    elementId: 'lineColor', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Line Color',
                                        path: 'lineColor',
                                        dataBindValue: 'lineColor',
                                        class: 'span6',
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: 'barLabel', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Bar Label',
                                        path: 'barLabel',
                                        dataBindValue: 'barLabel',
                                        class: 'span6',
                                    },
                                }, {
                                    elementId: 'lineLabel', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Line Label',
                                        path: 'lineLabel',
                                        dataBindValue: 'lineLabel',
                                        class: 'span6',
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: 'barValue', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'Bar Value',
                                        path: 'barValue',
                                        dataBindValue: 'barValue',
                                        dataBindOptionList: 'yAxisValues',
                                        class: 'span6',
                                        elementConfig: {
                                            placeholder: 'Select Bar Value',
                                            defaultValueId: 0,
                                        },
                                    },
                                }, {
                                    elementId: 'lineValue', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'Line Value',
                                        path: 'lineValue',
                                        dataBindValue: 'lineValue',
                                        dataBindOptionList: 'yAxisValues',
                                        class: 'span6',
                                        elementConfig: {
                                            placeholder: 'Select Bar Value',
                                            defaultValueId: 1,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        },

        remove: function () {
            var self = this
            Knockback.release(self.model, self.$el[0])
            ko.cleanNode(self.$el[0])
            kbValidation.unbind(self)
            self.$el.empty().off() // off to unbind the events
            self.stopListening()
            return self
        },
    })
    return LineBarChartConfigView;
})
