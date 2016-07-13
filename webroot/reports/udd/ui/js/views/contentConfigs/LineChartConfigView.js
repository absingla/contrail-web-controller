/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineWithFocusChartView
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var ko = require('knockout')
    var Knockback = require('knockback')
    var kbValidation = require('validation')

    var LineChartConfigView = ContrailView.extend({
        events: {
            'click .update-widget': 'onChange',
        },

        render: function () {
            var self = this

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), 'validation', null, null, function () {
                Knockback.applyBindings(self.model, self.$el[0])
                kbValidation.bind(self);
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
                                    elementId: 'color', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Line Color',
                                        path: 'color',
                                        dataBindValue: 'color',
                                        class: 'span9',
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: 'yAxisLabel', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'y Axis Label',
                                        path: 'yAxisLabel',
                                        dataBindValue: 'yAxisLabel',
                                        class: 'span9',
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: 'yAxisValue', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'y Axis Value',
                                        path: 'yAxisValue',
                                        dataBindValue: 'yAxisValue',
                                        dataBindOptionList: 'yAxisValues',
                                        class: 'span9',
                                        elementConfig: {
                                            placeholder: 'Select Y Axis Value',
                                            defaultValueId: 0,
                                        },
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: 'update_widget', view: 'FormButtonView', label: 'Update Widget',
                                    viewConfig: {
                                        class: 'update-widget display-inline-block margin-5-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        },

        onChange: function () {
            var self = this
            if (self.model.model().isValid(true, 'validation')) {
                self.trigger('change')
            }
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
    return LineChartConfigView;
})
