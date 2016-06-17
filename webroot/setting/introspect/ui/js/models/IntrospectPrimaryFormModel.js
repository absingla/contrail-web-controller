/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'contrail-model'
], function (_, Knockout, ContrailModel) {
    var IntrospectPrimaryFormModel = ContrailModel.extend({

        constructor: function (modelData, IntrospectFormView) {
            var defaultConfig = {
                ip_address: null,
                port: null,
                module: null,
                module_introspect: null,

                module_option_list: [],
                module_introspect_option_list: [],

                ui_added_parameters: {}
            };

            modelData = $.extend(true, {}, defaultConfig, modelData);
            ContrailModel.prototype.constructor.call(this, modelData);

            this.model().on("change:ip_address", this.onChangeIpAddress, this);
            this.model().on("change:module", this.onChangeModule, this);
            this.model().on("change:module_introspect", function() {
                this.onChangeModuleIntrospect(IntrospectFormView)
            }, this);

            return this;
        },

        onChangeIpAddress: function() {
            var self = this,
                model = self.model(),
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                uiAddedParameters = model.attributes.ui_added_parameters,
                modules = [];

            if (!contrail.checkIfExist(uiAddedParameters[port])) {
                uiAddedParameters[port] = {};
            }

            if (!contrail.checkIfExist(uiAddedParameters[port][ipAddress])) {
                uiAddedParameters[port][ipAddress] = {};
            }

            if (!$.isEmptyObject(uiAddedParameters[port][ipAddress])) {

                _.each(uiAddedParameters[port][ipAddress], function(value, key) {
                    modules.push({id: key, text: key});
                });
                self.module_option_list(modules);

            } else {
                $.ajax({
                    url: '/proxy?proxyURL=http://' + ipAddress + ':' + port,
                    dataType: 'html',
                    success: function (html) {
                        var moduleText;

                        $(html).each(function (key, value) {
                            if ($(value).is('a')) {
                                moduleText = $(value).text();
                                moduleText = moduleText.replace('.xml', '');
                                modules.push({id: moduleText, text: moduleText});

                                uiAddedParameters[port][ipAddress][moduleText] = {};
                            }
                        });

                        self.module_option_list(modules);
                    },
                    error: function(error) {
                        if (error.status === 404) {
                            //TODO
                        }
                    }
                });
            }
        },

        onChangeModule: function() {
            var self = this,
                model = self.model(),
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                module = model.attributes.module,
                uiAddedParameters = model.attributes.ui_added_parameters,
                moduleIntrospects = [];

            if (!$.isEmptyObject(uiAddedParameters[port][ipAddress][module])) {

                _.each(uiAddedParameters[port][ipAddress][module], function(value, key) {
                    moduleIntrospects.push({id: key, text: key});
                });
                self.module_introspect_option_list(moduleIntrospects);

            } else {
                $.ajax({
                    url: '/proxy?proxyURL=http://' + ipAddress + ':' + port + '/' + module + '.xml',
                    dataType: 'xml',
                    success: function (xml) {
                        var json = $.xml2json(xml);
                        _.each(json, function (jsonValue, jsonKey) {
                            moduleIntrospects.push({id: jsonKey, text: jsonKey})
                            uiAddedParameters[port][ipAddress][module][jsonKey] = jsonValue;
                        });

                        self.module_introspect_option_list(moduleIntrospects);
                    },
                    error: function (error) {
                        if (error.status === 404) {
                            //TODO
                        }
                    }
                });
            }
        },

        onChangeModuleIntrospect: function(IntrospectFormView) {
            var self = this,
                model = self.model(),
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                module = model.attributes.module,
                moduleIntrospect = model.attributes.module_introspect,
                uiAddedParameters = model.attributes.ui_added_parameters;

            IntrospectFormView.renderIntrospectSecondaryForm(uiAddedParameters[port][ipAddress][module][moduleIntrospect]);

        },

        validations: {
            runIntrospectValidation: {
                'ip_address': {
                    required: true,
                    msg: ctwm.getRequiredMessage('ip address')
                }
            }
        }
    });

    return IntrospectPrimaryFormModel;
});
