/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineWithFocusChartView
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var Knockback = require('knockback')

    var LineChartConfigView = ContrailView.extend({
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
                                    elementId: 'color', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Line Color',
                                        path: 'color',
                                        dataBindValue: 'color',
                                        class: 'span9',
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'yAxisLabel', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'y Axis Label',
                                        path: 'yAxisLabel',
                                        dataBindValue: 'yAxisLabel',
                                        class: 'span9',
                                    }
                                }
                            ]
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
                                            defaultValueId: 0
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
        // TODO move to LineWithFocusChartModel
        getParserOptions: function () {
            var self = this
            return {
                parserName: 'timeSeriesParser',
                yAxixDataField: self.model.yAxisValue(),
            }
        },

        // TODO move to LineWithFocusChartModel
        getViewOptions: function () {
            var self = this
            return {
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabel: self.model.yAxisLabel(),
                    colors: [self.model.color()],
                    //yAxixDataField: self.model.yAxisValue(),
                    forceY: [0, 10],
                    yFormatter: function (d) {
                        return d;
                    }
                }
            }
        },

        onChange: function () {
            var self = this
            self.trigger('change')
        }
    })
    return LineChartConfigView;
})
