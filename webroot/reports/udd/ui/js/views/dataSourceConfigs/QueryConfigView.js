/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var cowc = require('core-constants')
    var cowl = require('core-labels')
    var qewu = require('core-basedir/js/common/qe.utils')
    var ko = require('knockout')
    var Knockback = require('knockback')
    var kbValidation = require('validation')
    var QueryFormView = require('query-form-view')

    var QueryConfigView = QueryFormView.extend({
        events: {
            // TODO: this method results in double event subscription after select field change
            'click #save_query': 'onChange',
        },

        render: function () {
            var self = this

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), cowc.KEY_RUN_QUERY_VALIDATION, null, null, function () {
                Knockback.applyBindings(self.model, self.$el[0])
                kbValidation.bind(self);
            })
        },

        getViewConfig: function () {
            var self = this;
            return {
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'table_type', view: 'FormDropdownView',
                                    viewConfig: {
                                        path: 'table_type',
                                        dataBindValue: 'table_type',
                                        class: 'span6',
                                        elementConfig: {
                                            dataTextField: 'text',
                                            dataValueField: 'id',
                                            data: _.keys(cowc.TABLE_QUERY_PREFIXES),
                                        },
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: 'time_range', view: 'FormDropdownView',
                                    viewConfig: {
                                        path: 'time_range',
                                        dataBindValue: 'time_range',
                                        class: 'span6',
                                        elementConfig: {
                                            dataTextField: 'text',
                                            dataValueField: 'id',
                                            data: cowc.TIMERANGE_DROPDOWN_VALUES,
                                        },
                                    },
                                }, {
                                    elementId: 'from_time', view: 'FormDateTimePickerView',
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time',
                                        dataBindValue: 'from_time',
                                        class: 'span3',
                                        elementConfig: qewu.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: 'time_range() == -1',
                                    },
                                }, {
                                    elementId: 'to_time', view: 'FormDateTimePickerView',
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time',
                                        dataBindValue: 'to_time',
                                        class: 'span3',
                                        elementConfig: qewu.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: 'time_range() == -1',
                                    },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'isAttrAvailable("table_type") && table_type() === "STAT"',
                            },
                            columns: [
                                {
                                    elementId: 'table_name', view: 'FormComboboxView',
                                    viewConfig: {
                                        label: 'Active Table',
                                        path: 'table_name',
                                        dataBindValue: 'table_name',
                                        dataBindOptionList: 'table_name_data_object',
                                        class: 'span6',
                                        elementConfig: {
                                            defaultValueId: 0,
                                            allowClear: false,
                                            placeholder: cowl.QE_SELECT_STAT_TABLE,
                                            dataTextField: 'name',
                                            dataValueField: 'name',
                                        },
                                    },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'isAttrAvailable("table_type") && table_type() === "LOG"',
                            },
                            columns: [
                                {
                                    elementId: 'log_level', view: 'FormDropdownView',
                                    viewConfig: { path: 'log_level',
                                        dataBindValue: 'log_level',
                                        class: 'span3',
                                        elementConfig: {
                                            dataTextField: 'name',
                                            dataValueField: 'value',
                                            data: cowc.QE_LOG_LEVELS,
                                        },
                                    },
                                }, {
                                    elementId: 'keywords', view: 'FormInputView',
                                    viewConfig: { path: 'keywords',
                                        dataBindValue: 'keywords',
                                        class: 'span6',
                                        placeholder: 'Comma separated keywords' },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'isAttrAvailable("table_name")',
                            },
                            columns: [
                                {
                                    elementId: 'select', view: 'FormTextAreaView',
                                    viewConfig: {
                                        path: 'select',
                                        dataBindValue: 'select',
                                        class: 'span6',
                                        editPopupConfig: {
                                            renderEditFn: function () {
                                                var tableName = self.model.table_name();
                                                self.renderSelect({className: qewu.getModalClass4Table(tableName)})
                                            },
                                        },
                                    },
                                }, {
                                    elementId: 'time-granularity-section', view: 'FormCompositeView',
                                    viewConfig: {
                                        class: 'span6',
                                        style: 'display: none;',
                                        path: 'time_granularity',
                                        label: 'Time Granularity',
                                        visible: 'isSelectTimeChecked()',
                                        childView: [
                                            {
                                                elementId: 'time_granularity', view: 'FormNumericTextboxView',
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity',
                                                    dataBindValue: 'time_granularity',
                                                    class: 'span4',
                                                    elementConfig: {min: 1},
                                                },
                                            }, {
                                                elementId: 'time_granularity_unit', view: 'FormDropdownView',
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity_unit',
                                                    dataBindValue: 'time_granularity_unit',
                                                    dataBindOptionList: 'getTimeGranularityUnits()',
                                                    class: 'span4',
                                                    elementConfig: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'show_advanced_options() && isAttrAvailable("table_name")',
                            },
                            columns: [
                                {
                                    elementId: 'where', view: 'FormTextAreaView',
                                    viewConfig: {
                                        path: 'where',
                                        dataBindValue: 'where',
                                        class: 'span9',
                                        placeHolder: '*',
                                        editPopupConfig: {
                                            renderEditFn: function () {
                                                self.renderWhere({className: cowc.QE_MODAL_CLASS_700})
                                            },
                                        },
                                    },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'show_advanced_options() && isAttrAvailable("table_name")',
                            },
                            columns: [
                                {
                                    elementId: 'filters', view: 'FormTextAreaView',
                                    viewConfig: {
                                        path: 'filters',
                                        dataBindValue: 'filters',
                                        class: 'span9',
                                        label: cowl.TITLE_QE_FILTER,
                                        editPopupConfig: {
                                            renderEditFn: function () {
                                                self.renderFilters({className: cowc.QE_MODAL_CLASS_700})
                                            },
                                        },
                                    },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'isAttrAvailable("table_name")',
                            },
                            columns: [
                                {
                                    elementId: 'advanced_options', view: 'FormTextView',
                                    viewConfig: {
                                        text: 'getAdvancedOptionsText()',
                                        class: 'advanced-options-link',
                                        click: 'toggleAdvancedFields',
                                    },
                                },
                            ],
                        }, {
                            columns: [
                                {
                                    elementId: 'save_query', view: 'FormButtonView', label: 'Save Query',
                                    viewConfig: {
                                        class: 'save-query display-inline-block margin-5-10-0-0',
                                        disabled: 'is_request_in_progress()',
                                        elementConfig: {
                                            btnClass: 'btn-primary',
                                        },
                                    },
                                }, {
                                    elementId: 'reset_query', view: 'FormButtonView', label: 'Reset',
                                    viewConfig: {
                                        label: 'Reset',
                                        class: 'display-inline-block margin-5-10-0-0',
                                        elementConfig: {
                                            onClick: 'reset',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            }
        },

        remove: function () {
            var self = this
            Knockback.release(self.model, self.$el[0])
            kbValidation.unbind(self)
            self.$el.empty().off() // off to unbind the events
            ko.cleanNode(self.$el[0])
            self.stopListening()
            return self
        },

        onChange: function () {
            var self = this
            if (self.model.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) {
                self.trigger('change')
            }
        },
    })

    return QueryConfigView
})
