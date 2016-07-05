/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineBarWithFocusChartView
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var Knockback = require('knockback')

    var LineBarChartConfigView = ContrailView.extend({
        events: {
            'click .update-widget': 'onChange'
        },

        initialize: function () {
            var self = this
        },

        render: function () {
            var self = this

            var elementId = self.attributes.elementId

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), null,null,null, function () {
                Knockback.applyBindings(self.model, self.$el[0])
            })
        },

        getViewConfig: function () {
            var self = this
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
                                    }
                                }, {
                                    elementId: 'lineColor', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Line Color',
                                        path: 'lineColor',
                                        dataBindValue: 'lineColor',
                                        class: 'span6',
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'barLabel', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Bar Label',
                                        path: 'barLabel',
                                        dataBindValue: 'barLabel',
                                        class: 'span6',
                                    }
                                }, {
                                    elementId: 'lineLabel', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Line Label',
                                        path: 'lineLabel',
                                        dataBindValue: 'lineLabel',
                                        class: 'span6',
                                    }
                                }
                            ]
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
                                            defaultValueId: 0
                                        }
                                    }
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
                                            defaultValueId: 1
                                        }
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'update_widget', view: 'FormButtonView', label: 'Update Widget',
                                    viewConfig: {
                                        class: 'update-widget display-inline-block margin-5-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        },
        // TODO move to LineBarChartModel
        getParserOptions: function () {
            var self = this
            return {
                parserName: 'timeSeriesParser',
                dataFields: [self.model.barValue(), self.model.lineValue()],
            }
        },

        // TODO move to LineBarChartModel
        getViewOptions: function () {
            var self = this
            return {
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabels: [self.model.barLabel(), self.model.lineLabel()],
                    colors: [self.model.barColor(), self.model.lineColor()],
                    forceY: [0, 10],
                    y1Formatter: function (d) {
                        return d;
                    },
                    y2Formatter: function (d) {
                        return d;
                    },
                }
            }
        },

        onChange: function () {
            var self = this
            self.trigger('change')
        }
    })
    return LineBarChartConfigView;
})
