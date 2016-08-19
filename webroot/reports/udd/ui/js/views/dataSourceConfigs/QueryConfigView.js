/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var cowc = require("core-constants");
    var cowl = require("core-labels");
    var qewu = require("core-basedir/js/common/qe.utils");
    var ko = require("knockout");
    var Knockback = require("knockback");
    var kbValidation = require("validation");
    var QueryFormView = require("query-form-view");

    var QueryConfigView = QueryFormView.extend({
        render: function () {
            var self = this;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), cowc.KEY_RUN_QUERY_VALIDATION, null, null, function () {
                Knockback.applyBindings(self.model, self.$el[0]);
                kbValidation.bind(self);
            });
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
                                    elementId: "time_range", view: "FormDropdownView",
                                    viewConfig: {
                                        path: "time_range",
                                        dataBindValue: "time_range",
                                        class: "col-xs-6",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "id",
                                            data: cowc.TIMERANGE_DROPDOWN_VALUES_WO_CUSTOM,
                                        },
                                    },
                                }
                            ],
                        },
                        {
                            columns: [
                                {
                                    elementId: "table_type", view: "FormDropdownView",
                                    viewConfig: {
                                        path: "table_type",
                                        dataBindValue: "table_type",
                                        class: "col-xs-6",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "id",
                                            data: cowc.TABLE_TYPES,
                                        },
                                    },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'isAttrAvailable("table_type") && table_type() === "STAT"',
                            },
                            columns: [
                                {
                                    elementId: "table_name", view: "FormComboboxView",
                                    viewConfig: {
                                        label: cowl.TITLE_QE_ACTIVE_TABLE,
                                        path: "table_name",
                                        dataBindValue: "table_name",
                                        dataBindOptionList: "table_name_data_object",
                                        class: "col-xs-12",
                                        elementConfig: {
                                            defaultValueId: 0,
                                            allowClear: false,
                                            placeholder: cowl.QE_SELECT_STAT_TABLE,
                                            dataTextField: "name",
                                            dataValueField: "name"
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
                                    elementId: "log_level", view: "FormDropdownView",
                                    viewConfig: {
                                        path: "log_level",
                                        dataBindValue: "log_level",
                                        class: "col-xs-6",
                                        elementConfig: {
                                            dataTextField: "name",
                                            dataValueField: "value",
                                            data: cowc.QE_LOG_LEVELS,
                                        },
                                    },
                                }, {
                                    elementId: "keywords", view: "FormInputView",
                                    viewConfig: {
                                        path: "keywords",
                                        dataBindValue: "keywords",
                                        class: "col-xs-6",
                                        placeholder: cowl.TITLE_QE_KEYWORDS_PLACEHOLDER,
                                    },
                                },
                            ],
                        }, {
                            viewConfig: {
                                visible: 'isAttrAvailable("table_name")',
                            },
                            columns: [
                                {
                                    elementId: "select", view: "FormTextAreaView",
                                    viewConfig: {
                                        path: "select",
                                        dataBindValue: "select",
                                        class: "col-xs-12",
                                        editPopupConfig: {
                                            renderEditFn: function () {
                                                var tableName = self.model.table_name();
                                                self.renderSelect({className: qewu.getModalClass4Table(tableName)});
                                            },
                                        },
                                    },
                                }, {
                                    elementId: "time-granularity-section", view: "FormCompositeView",
                                    viewConfig: {
                                        class: "col-xs-6",
                                        style: "display: none;",
                                        path: "time_granularity",
                                        label: cowl.TITLE_QE_TIME_GRANULARITY,
                                        visible: "isSelectTimeChecked()",
                                        childView: [
                                            {
                                                elementId: "time_granularity", view: "FormNumericTextboxView",
                                                viewConfig: {
                                                    label: false,
                                                    path: "time_granularity",
                                                    dataBindValue: "time_granularity",
                                                    class: "col-xs-6",
                                                    elementConfig: {min: 1},
                                                },
                                            }, {
                                                elementId: "time_granularity_unit", view: "FormDropdownView",
                                                viewConfig: {
                                                    label: false,
                                                    path: "time_granularity_unit",
                                                    dataBindValue: "time_granularity_unit",
                                                    dataBindOptionList: "getTimeGranularityUnits()",
                                                    class: "col-xs-6",
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
                                    elementId: "where", view: "FormTextAreaView",
                                    viewConfig: {
                                        path: "where",
                                        dataBindValue: "where",
                                        class: "col-xs-12",
                                        placeHolder: "*",
                                        editPopupConfig: {
                                            renderEditFn: function () {
                                                self.renderWhere({className: cowc.QE_MODAL_CLASS_700});
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
                                    elementId: "filters", view: "FormTextAreaView",
                                    viewConfig: {
                                        path: "filters",
                                        dataBindValue: "filters",
                                        class: "col-xs-12",
                                        label: cowl.TITLE_QE_FILTER,
                                        editPopupConfig: {
                                            renderEditFn: function () {
                                                self.renderFilters({className: cowc.QE_MODAL_CLASS_700});
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
                                    elementId: "advanced_options", view: "FormTextView",
                                    viewConfig: {
                                        text: "getAdvancedOptionsText()",
                                        class: "col-xs-6 margin-0-0-10",
                                        elementConfig: {
                                            class: "advanced-options-link",
                                        },
                                        click: "toggleAdvancedFields"
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        },

        remove: function () {
            var self = this;
            Knockback.release(self.model, self.$el[0]);
            kbValidation.unbind(self);
            self.$el.empty().off(); // off to unbind the events
            ko.cleanNode(self.$el[0]);
            self.stopListening();
            return self;
        },
    });

    return QueryConfigView;
});
