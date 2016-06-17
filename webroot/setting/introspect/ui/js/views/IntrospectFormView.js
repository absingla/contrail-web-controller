/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'controller-basedir/setting/introspect/ui/js/models/IntrospectPrimaryFormModel',
    'controller-basedir/setting/introspect/ui/js/models/IntrospectSecondaryFormModel'
], function (_, Knockback, ContrailView, IntrospectPrimaryFormModel, IntrospectSecondaryFormModel) {
    var IntrospectFormView = ContrailView.extend({
        el: $(contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectType = hashParams['type'],
                introspectFormId = '#introspect-' + introspectType + '-form',
                introspectPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_INTROSPECT_PAGE),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            self['primary'] = {};
            self['primary']['model'] = new IntrospectPrimaryFormModel(hashParams, self);
            self.$el.append(introspectPageTmpl({introspectPrefix: introspectType}));

            self.renderIntrospectPrimaryForm();

            if (widgetConfig !== null) {
                self.renderView4Config($(introspectFormId), self['primary']['model'], widgetConfig, null, null, null);
            }

        },

        renderIntrospectPrimaryForm: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectType = hashParams['type'],
                introspectPrimaryFormId = '#introspect-' + introspectType + '-primary-form',
                introspectPrimaryId = 'introspect-' + introspectType + '-primary-container';

            self.renderView4Config($(introspectPrimaryFormId), self['primary']['model'], getIntrospectPrimaryFormViewConfig(), 'runIntrospectValidation', null, modelMap, function () {
                self['primary']['model'].showErrorAttr(introspectPrimaryId, false);
                Knockback.applyBindings(self['primary']['model'], document.getElementById(introspectPrimaryId));
                kbValidation.bind(self['primary']);
            });
        },

        renderIntrospectSecondaryForm: function(moduleIntrospectFormData) {
            var self = this,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectType = hashParams['type'],
                introspectSecondaryFormId = '#introspect-' + introspectType + '-secondary-form',
                introspectSecondaryId = 'introspect-' + introspectType + '-secondary-container',
                secondaryModelData = getSecondaryModelData(moduleIntrospectFormData);

            self['secondary'] = {};
            self['secondary']['model'] = new IntrospectSecondaryFormModel(secondaryModelData);

            self.renderView4Config($(introspectSecondaryFormId), self['secondary']['model'],
                getIntrospectSecondaryFormViewConfig(moduleIntrospectFormData), null, null, modelMap, function () {

                if(contrail.checkIfKnockoutBindingExist(introspectSecondaryId)) {
                    ko.cleanNode(document.getElementById(introspectSecondaryId));
                    kbValidation.unbind(self['secondary']);
                }

                Knockback.applyBindings(self['secondary']['model'], document.getElementById(introspectSecondaryId));
                kbValidation.bind(self['secondary']);

                $("#submit_introspect").on('click', function() {
                    // if (self['primary']['model'].model().isValid(true, 'runIntrospectValidation')) {
                        self.renderIntrospectResult();
                    // }
                });
            });
        },

        renderIntrospectResult: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectType = hashParams['type'],
                introspectFormId = '#introspect-' + introspectType + '-form',
                introspectResultId = '#introspect-' + introspectType + '-results',
                primaryModelAttributes = self['primary']['model'].model()['attributes'],
                secondaryModelAttributes = self['secondary']['model'].model()['attributes'],
                ipAddress = primaryModelAttributes.ip_address,
                port = primaryModelAttributes.port,
                moduleIntrospect = primaryModelAttributes.module_introspect;

            if (widgetConfig !== null) {
                $(introspectFormId).parents('.widget-box').data('widget-action').collapse();
            }

            self.renderView4Config($(introspectResultId), self.model,
                getIntrospectResultTabViewConfig(ipAddress, port, moduleIntrospect, introspectType, secondaryModelAttributes), null, null, modelMap, null);

        }
    });

    function getIntrospectPrimaryFormViewConfig() {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'ip_address', view: "FormDropdownView",
                                viewConfig: {
                                    path: 'ip_address', dataBindValue: 'ip_address', class: "span4",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: 'Select IP Address',
                                        data: [{id: '10.84.11.2', text: '10.84.11.2'}]
                                    }}
                            },
                            {
                                elementId: 'module', view: "FormDropdownView",
                                viewConfig: {
                                    path: 'module', class: "span4",
                                    dataBindValue: 'module', dataBindOptionList: "module_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: 'Select Module'
                                    },
                                    visible: "ip_address() !== null"

                                }
                            },
                            {
                                elementId: 'module_introspect', view: "FormDropdownView",
                                viewConfig: {
                                    path: 'module_introspect', class: "span4",
                                    dataBindValue: 'module_introspect', dataBindOptionList: "module_introspect_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: 'Select Module Introspect'
                                    },
                                    visible: "module() !== null"

                                }
                            }
                        ]
                    },
                    // {
                    //     columns: [
                    //         {
                    //             elementId: 'submit_introspect', view: "FormButtonView", label: "Submit",
                    //             viewConfig: {
                    //                 class: 'display-inline-block margin-5-10-0-0',
                    //                 // disabled: 'is_request_in_progress()',
                    //                 elementConfig: {
                    //                     btnClass: 'btn-primary'
                    //                 }
                    //             }
                    //         },
                    //         // {
                    //         //     elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                    //         //     viewConfig: {
                    //         //         label: "Reset",
                    //         //         class: 'display-inline-block margin-5-10-0-0',
                    //         //         elementConfig: {
                    //         //             onClick: "reset"
                    //         //         }
                    //         //     }
                    //         // }
                    //     ]
                    // }
                ]
            }
        };
    }

    function getIntrospectSecondaryFormViewConfig(moduleIntrospectFormData) {
        var row, columns, i = 0,
            isNewRow, elementName,
            secondaryFormConfig = [];

        _.each(moduleIntrospectFormData, function(value, key) {
            if (['type', 'errors', 'locks'].indexOf(key) === -1) {
                isNewRow = ((i % 3) == 0) ? true : false;
                elementName = key;
                if (isNewRow) {
                    row = {columns: []};
                    secondaryFormConfig.push(row);
                }
                row['columns'].push({
                    elementId: elementName, view: "FormInputView",
                    viewConfig: {path: elementName, dataBindValue: elementName, class: "span4"}
                });

                i++;
            }
        });

        secondaryFormConfig.push({
            columns: [
                {
                    elementId: 'submit_introspect', view: "FormButtonView", label: "Submit",
                    viewConfig: {
                        class: 'display-inline-block margin-5-10-0-0',
                        // disabled: 'is_request_in_progress()',
                        elementConfig: {
                            btnClass: 'btn-primary'
                        }
                    }
                },
                // {
                //     elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                //     viewConfig: {
                //         label: "Reset",
                //         class: 'display-inline-block margin-5-10-0-0',
                //         elementConfig: {
                //             onClick: "reset"
                //         }
                //     }
                // }
            ]
        });

        return {
            view: "SectionView",
            viewConfig: {
                rows: secondaryFormConfig
            }
        };
    }

    function getSecondaryModelData(moduleIntrospectFormData) {
        var modelData = {};

        _.each(moduleIntrospectFormData, function(value, key) {
            if (['type', 'errors', 'locks'].indexOf(key) === -1) {
                modelData[key] = null;
            }
        });

        return modelData;
    }

    function getIntrospectResultTabViewConfig(ipAddress, port, moduleIntrospect, introspectType, secondaryModelAttributes) {
        return {
            elementId: 'introspect-' + introspectType + '-results',
            view: "IntrospectTabsView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                ip_address: ipAddress,
                port: port,
                module_introspect: moduleIntrospect,
                params: formatParams(secondaryModelAttributes)
            }
        };
    }

    function formatParams(params) {
        var paramsData = {};

        _.each(params, function(value, key) {
            if (['type', 'errors', 'locks'].indexOf(key) === -1) {
                paramsData[key] = value;
            }
        });

        return paramsData;
    }

    return IntrospectFormView;
});