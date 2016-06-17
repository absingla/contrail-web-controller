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
                introspectNode = hashParams['type'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectFormId = '#introspect-' + introspectNode + '-' + introspectType + '-form',
                introspectPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_INTROSPECT_PAGE),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            self['primary'] = {};
            self['primary']['model'] = new IntrospectPrimaryFormModel({port: introspectPort, node: introspectNode}, self);
            self.$el.append(introspectPageTmpl({type: introspectType, feature: introspectNode}));

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
                introspectNode = hashParams['type'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectPrimaryFormId = '#introspect-' + introspectNode + '-' + introspectType + '-primary-form',
                introspectPrimaryId = 'introspect-' + introspectNode + '-' + introspectType + '-primary-container';

            self.renderView4Config($(introspectPrimaryFormId), self['primary']['model'], getIntrospectPrimaryFormViewConfig(), 'runIntrospectValidation', null, modelMap, function () {
                self['primary']['model'].showErrorAttr(introspectPrimaryId, false);
                Knockback.applyBindings(self['primary']['model'], document.getElementById(introspectPrimaryId));
                kbValidation.bind(self['primary']);
            });
        },

        renderIntrospectSecondaryForm: function(moduleIntrospectFormData) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['type'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectSecondaryFormId = '#introspect-' + introspectNode + '-' + introspectType + '-secondary-form',
                introspectSecondaryId = 'introspect-' + introspectNode + '-' + introspectType + '-secondary-container',
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
                introspectNode = hashParams['type'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectFormId = '#introspect-' + introspectNode + '-' + introspectType + '-form',
                introspectResultId = '#introspect-' + introspectNode + '-' + introspectType + '-results',
                primaryModelAttributes = self['primary']['model'].model()['attributes'],
                secondaryModelAttributes = self['secondary']['model'].model()['attributes'],
                ipAddress = primaryModelAttributes.ip_address,
                moduleIntrospect = primaryModelAttributes.module_introspect;

            if (widgetConfig !== null) {
                $(introspectFormId).parents('.widget-box').data('widget-action').collapse();
            }

            self.renderView4Config($(introspectResultId), self.model,
                getIntrospectResultTabViewConfig(ipAddress, introspectPort, moduleIntrospect, introspectType, secondaryModelAttributes), null, null, modelMap, null);

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
                                    path: 'ip_address', class: "span4",
                                    dataBindValue: 'ip_address',
                                    dataBindOptionList: "ip_address_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: 'Select IP Address'
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
                    }
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
                        label: 'Submit',
                        elementConfig: {
                            btnClass: 'btn-primary'
                        }
                    }
                }
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