/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var Knockback = require('knockback')
    var QueryFormView = require('query-form-view')
    var qewu = require('core-basedir/js/common/qe.utils')

    var QueryConfigView = QueryFormView.extend({
        events: {
            //TODO: this method results in double event subscription after select field change
            //'click #save_query': 'onChange',
        },

        render: function () {
            var self = this

            var elementId = self.attributes.elementId
            self.renderView4Config(self.$el, self.model, self.getViewConfig(), null,null,null, function () {
                Knockback.applyBindings(self.model, self.$el[0])
                //TODO remove this in favor of Backbone delegated events
                $("#save_query").on('click', function() {
                    self.onChange()
                })
            })
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
                                        path: 'time_range', dataBindValue: 'time_range', class: "span6",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: cowc.TIMERANGE_DROPDOWN_VALUES}}
                                }, {
                                    elementId: 'from_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time', dataBindValue: 'from_time', class: "span3",
                                        elementConfig: qewu.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                }, {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time', dataBindValue: 'to_time', class: "span3",
                                        elementConfig: qewu.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'table_name', view: "FormComboboxView",
                                    viewConfig: {
                                        label: 'Active Table',
                                        path: 'table_name',
                                        dataBindValue: 'table_name',
                                        dataBindOptionList: 'table_name_data_object',
                                        elementConfig: {
                                            defaultValueId: 0, allowClear: false, placeholder: cowl.QE_SELECT_STAT_TABLE,
                                            dataTextField: "name", dataValueField: "name",
                                        }
                                    }
                                }
                            ]
                        }, {
                            viewConfig: {
                                visible: 'isTableNameAvailable()'
                            },
                            columns: [
                                {
                                    elementId: 'select', view: "FormTextAreaView",
                                    viewConfig: {
                                        path: 'select', dataBindValue: 'select', class: "span6",
                                        editPopupConfig: {
                                            renderEditFn: function(event) {
                                                var tableName = self.model.table_name();
                                                self.renderSelect({className: qewu.getModalClass4Table(tableName)});
                                            }
                                        }
                                    }
                                },
                                {
                                    elementId: 'time-granularity-section',
                                    view: "FormCompositeView",
                                    viewConfig: {
                                        class: "span6",
                                        style: 'display: none;',
                                        path: 'time_granularity',
                                        label: 'Time Granularity',
                                        visible: 'isSelectTimeChecked()',
                                        childView: [
                                            {
                                                elementId: 'time_granularity', view: "FormNumericTextboxView",
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity',
                                                    dataBindValue: 'time_granularity',
                                                    class: "span4",
                                                    elementConfig: {min: 1}
                                                }
                                            }, {
                                                elementId: 'time_granularity_unit', view: "FormDropdownView",
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity_unit',
                                                    dataBindValue: 'time_granularity_unit',
                                                    dataBindOptionList: 'getTimeGranularityUnits()',
                                                    class: "span4",
                                                    elementConfig: {}
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'save_query', view: "FormButtonView", label: "Save Query",
                                    viewConfig: {
                                        class: 'display-inline-block margin-5-10-0-0',
                                        disabled: 'is_request_in_progress()',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                }, {
                                    elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                                    viewConfig: {
                                        label: "Reset",
                                        class: 'display-inline-block margin-5-10-0-0',
                                        elementConfig: {
                                            onClick: "reset"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        },

        onChange: function () {
            var self = this
            if (self.model.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) {
                self.trigger('change')
            }
        }
    });

    return QueryConfigView;
});
