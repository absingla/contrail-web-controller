/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-view',
    'knockback',
    'reports/qe/ui/js/models/StatQueryFormModel'
], function (_, QueryFormView, Knockback, StatQueryFormModel) {

    var StatQueryFormView = QueryFormView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_PAGE),
                statQueryFormModel = new StatQueryFormModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                queryFormId = "#qe-" + qewc.STAT_QUERY_PREFIX + "-form";

            self.model = statQueryFormModel;
            self.$el.append(queryPageTmpl({queryPrefix: qewc.STAT_QUERY_PREFIX }));

            self.renderView4Config($(self.$el).find(queryFormId), this.model, self.getViewConfig(), null, null, null, function () {
                self.model.showErrorAttr(ctwl.QE_STAT_QUERY_ID, false);
                Knockback.applyBindings(self.model, document.getElementById(ctwl.QE_STAT_QUERY_ID));
                kbValidation.bind(self);
                $("#run_query").on('click', function() {
                    self.renderQueryResult();
                });
            });

            if (widgetConfig !== null) {
                self.renderView4Config($(self.$el).find(queryFormId), self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function() {
            var self = this,
                queryResultId = "#qe-" + qewc.STAT_QUERY_PREFIX + "-results",
                responseViewConfig = {
                    view: "StatQueryResultView",
                    viewPathPrefix: "reports/qe/ui/js/views/",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {}
                };

            self.renderView4Config($(self.$el).find(queryResultId), this.model, responseViewConfig);
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
                                    elementId: 'table_name', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'table_name', dataBindValue: 'table_name', class: "span3",
                                        elementConfig: {
                                            defaultValueId: 0, allowClear: false, placeholder: ctwl.QE_SELECT_STAT_TABLE,
                                            dataTextField: "name", dataValueField: "name",
                                            dataSource: {
                                                type: 'remote', url: qewc.URL_TABLES, parse: function (response) {
                                                    var parsedOptionList = [];
                                                    for(var i = 0; i < response.length; i++) {
                                                        if(response[i].type == 'STAT') {
                                                            parsedOptionList.push(response[i]);
                                                        }
                                                    }
                                                    return parsedOptionList;
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        },
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
                                        style: 'display: none;',
                                        path: 'from_time', dataBindValue: 'from_time', class: "span3",
                                        elementConfig: qewu.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                },
                                {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time', dataBindValue: 'to_time', class: "span3",
                                        elementConfig: qewu.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
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
                                },
                                {
                                    elementId: 'time-granularity-section',
                                    view: "FormCompositeView",
                                    viewConfig: {
                                        class: "span3",
                                        style: 'display: none;',
                                        path: 'time_granularity',
                                        label: 'Time Granularity',
                                        visible: 'select_data_object().checked_fields.indexOf("T=") != -1 ',
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
                                            },
                                            {
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
                                        label: "Reset",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            onClick: "reset"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });

    return StatQueryFormView;
});