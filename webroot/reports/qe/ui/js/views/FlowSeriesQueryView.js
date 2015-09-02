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
                                    viewConfig: {
                                        path: 'time_range', dataBindValue: 'time_range', class: "span3",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: qewc.TIMERANGE_DROPDOWN_VALUES}}
                                },
                                {
                                    elementId: 'from_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        path: 'from_time', dataBindValue: 'from_time', class: "span3",
                                        elementConfig: getFromTimeElementConfig('from_time', 'to_time')
                                    },
                                    visible: "time_range() == -1"
                                },
                                {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        path: 'to_time', dataBindValue: 'to_time', class: "span3",
                                        elementConfig: getToTimeElementConfig('from_time', 'to_time')
                                    },
                                    visible: "time_range() == -1"
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
                                    viewConfig: {
                                        path: 'direction', dataBindValue: 'direction', class: "span3",
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
                                    elementId: 'run_query', view: "FormButtonView", label: "Run Query",
                                    viewConfig: {
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                                    viewConfig: {
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {}
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });

    function getFromTimeElementConfig(fromTimeId, toTimeId) {
        return {
            onShow: function(cdt) {
                this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
            },
            onClose: function(cdt) {
                this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
            },
            onSelectDate: function(cdt) {
                this.setOptions(getFromTimeSelectOptions(toTimeId, cdt));
            }
        };
    }

    function getToTimeElementConfig(fromTimeId, toTimeId) {
        return {
            onShow: function(cdt) {
                this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
            },
            onClose: function(cdt) {
                this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
            },
            onSelectDate: function(cdt) {
                this.setOptions(getToTimeSelectOptions(fromTimeId, cdt));
            }
        };
    }

    function getFromTimeShowOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            maxDate: dateString ? dateString : false,
            maxTime: timeString ? timeString : false
        };
    }

    function getFromTimeSelectOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            toDateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A'),
            fromDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            maxDate: toDateString ? toDateString : false,
            maxTime: (fromDateString == toDateString) ? timeString : false
        };
    }

    function getToTimeShowOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            minDate: dateString ? dateString : false,
            minTime: timeString ? timeString : false
        };
    }

    function getToTimeSelectOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            fromDateString = moment(d).format('MMM dd, yyyy'),
            timeString = moment(d).format('hh:mm:ss A'),
            toDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            minDate: fromDateString ? fromDateString : false,
            minTime: (toDateString == fromDateString) ? timeString : false
        };
    }


    return FlowSeriesQueryView;
});