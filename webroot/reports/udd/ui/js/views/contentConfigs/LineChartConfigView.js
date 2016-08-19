/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineWithFocusChartView
 */
define(function (require) {
    var ContrailView = require("contrail-view");
    var ko = require("knockout");
    var Knockback = require("knockback");
    var kbValidation = require("validation");

    var LineChartConfigView = ContrailView.extend({
        render: function () {
            var self = this;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), "validation", null, null, function () {
                Knockback.applyBindings(self.model, self.$el[0]);
                kbValidation.bind(self);
            });
        },

        getViewConfig: function () {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: "yAxisValue", view: "FormDropdownView",
                                    viewConfig: {
                                        label: cowl.CHART_Y_AXIS_VALUE,
                                        path: "yAxisValue",
                                        dataBindValue: "yAxisValue",
                                        dataBindOptionList: "yAxisValues",
                                        class: "col-xs-6",
                                        elementConfig: {
                                            placeholder: cowl.CHART_Y_AXIS_VALUE_PLACEHOLDER,
                                            defaultValueId: 0,
                                        },
                                    },
                                },
                                {
                                    elementId: "yAxisLabel", view: "FormInputView",
                                    viewConfig: {
                                        label: cowl.CHART_Y_AXIS_LABEL,
                                        path: "yAxisLabel",
                                        dataBindValue: "yAxisLabel",
                                        class: "col-xs-6",
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: "color", view: "FormInputView",
                                    viewConfig: {
                                        label: cowl.CHART_LINE_COLOR,
                                        path: "color",
                                        dataBindValue: "color",
                                        class: "col-xs-6",
                                    },
                                }
                            ],
                        },
                    ],
                },
            };
        },

        remove: function () {
            var self = this;
            Knockback.release(self.model, self.$el[0]);
            ko.cleanNode(self.$el[0]);
            kbValidation.unbind(self);
            self.$el.empty().off(); // off to unbind the events
            self.stopListening();
            return self;
        },
    });
    return LineChartConfigView;
});
