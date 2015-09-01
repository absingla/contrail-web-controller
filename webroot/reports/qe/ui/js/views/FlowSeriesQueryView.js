/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-view',
    'knockback',
    'reports/qe/ui/js/models/FlowSeriesQueryModel'
], function (_, QueryFormView, Knockback, FlowSeriesQueryModel) {

    var FlowSeriesQueryView = QueryFormView.extend({
        render: function (options) {
            var self = this, viewConfig = self.attributes.viewConfig,
                flowSeriesQueryModel = new FlowSeriesQueryModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            self.model = flowSeriesQueryModel;

            self.renderView4Config(self.$el, this.model, self.getViewConfig(), null, null, null, function () {
                self.model.showErrorAttr(ctwl.QE_FLOW_SERIES_FORM_ID, false);
                Knockback.applyBindings(self.model, document.getElementById(ctwl.QE_FLOW_SERIES_FORM_ID));
                kbValidation.bind(self);
            });

            if (widgetConfig !== null) {
                self.renderView4Config(self.$el, self.model, widgetConfig, null, null, null);
            }
        },

        getViewConfig: function () {
            var self = this;

            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'time_range', view: "FormDropdownView",
                                    viewConfig: {path: 'time_range', dataBindValue: 'time_range', class: "span3", elementConfig: {dataTextField: "text", dataValueField: "id", data: qewc.TIMERANGE_DROPDOWN_VALUES}}
                                },
                                {
                                    elementId: 'from_time', view: "FormInputView",
                                    viewConfig: {path: 'from_time', dataBindValue: 'from_time', class: "span3"},
                                    visible: "custom_time_visible"
                                },
                                {
                                    elementId: 'to_time', view: "FormInputView",
                                    viewConfig: {path: 'to_time', dataBindValue: 'to_time', class: "span3"},
                                    visible: "custom_time_visible"
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'select', view: "FormTextAreaView",
                                    viewConfig: {path: 'select', dataBindValue: 'select', class: "span9", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderSelect();
                                        }
                                    }}
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'where', view: "FormTextAreaView",
                                    viewConfig: {path: 'where', dataBindValue: 'where', class: "span9", placeHolder: "*", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderWhere();
                                        }
                                    }}
                                },
                                {
                                    elementId: 'direction', view: "FormDropdownView",
                                    viewConfig: {path: 'direction', dataBindValue: 'direction', class: "span3",
                                                 elementConfig: {dataTextField: "text", dataValueField: "id", data: qewc.DIRECTION_DROPDOWN_VALUES}
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'filter', view: "FormTextAreaView",
                                    viewConfig: {path: 'filter', dataBindValue: 'filter', class: "span9", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderFilter();
                                        }
                                    }}
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'run_query', view: "FormButtonView", label: "Run Query"
                                },
                                {
                                    elementId: 'reset_query', view: "FormButtonView", label: "Reset"
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });

    return FlowSeriesQueryView;
});