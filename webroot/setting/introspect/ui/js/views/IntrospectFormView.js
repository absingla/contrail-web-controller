/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'controller-basedir/setting/introspect/ui/js/models/IntrospectFormModel'
], function (_, Knockback, ContrailView, IntrospectFormModel) {
    var IntrospectFormView = ContrailView.extend({
        el: $(contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectType = hashParams['type'],
                introspectFormId = '#introspect-' + introspectType + '-form',
                introspectId = 'introspect-' + introspectType,
                introspectPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_INTROSPECT_PAGE),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            self.model = new IntrospectFormModel(hashParams);
            self.$el.append(introspectPageTmpl({introspectPrefix: introspectType}));

            self.renderView4Config($(introspectFormId), self.model, getIntrospectFormViewConfig(), 'runIntrospectValidation', null, modelMap, function () {
                self.model.showErrorAttr(introspectId, false);
                Knockback.applyBindings(self.model, document.getElementById(introspectId));
                kbValidation.bind(self);
                $("#submit_introspect").on('click', function() {
                    if (self.model.model().isValid(true, 'runIntrospectValidation')) {
                        self.renderIntrospectResult();
                    }
                });
            });

            if (widgetConfig !== null) {
                self.renderView4Config($(introspectFormId), self.model, widgetConfig, null, null, null);
            }

        },

        renderIntrospectResult: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectType = hashParams['type'],
                introspectFormModel = self.model,
                introspectFormId = '#introspect-' + introspectType + '-form',
                introspectResultId = '#introspect-' + introspectType + '-results',
                modelAttributes = introspectFormModel.model().attributes,
                ipAddress = modelAttributes.ip_address,
                port = modelAttributes.port,
                moduleIntrospect = modelAttributes.module_introspect;

            if (widgetConfig !== null) {
                $(introspectFormId).parents('.widget-box').data('widget-action').collapse();
            }

            self.renderView4Config($(introspectResultId), self.model,
                getIntrospectResultTabViewConfig(ipAddress, port, moduleIntrospect, introspectType), null, null, modelMap, null);

        }


    });

    function getIntrospectFormViewConfig() {
        var self = this;

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
                    {
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
                    }
                ]
            }
        };
    }

    function getIntrospectResultTabViewConfig(ipAddress, port, moduleIntrospect, introspectType) {
        return {
            elementId: 'introspect-' + introspectType + '-results',
            view: "IntrospectTabsView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                ip_address: ipAddress,
                port: port,
                module_introspect: moduleIntrospect
            }
        };
    }

    return IntrospectFormView;
});