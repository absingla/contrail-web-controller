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
                node: null,
                ip_address: null,
                port: null,
                module: null,
                module_introspect: null,

                ip_address_option_list: [],
                module_option_list: [],
                module_introspect_option_list: [],

                ui_added_parameters: {}
            };

            modelData = $.extend(true, {}, defaultConfig, modelData);
            ContrailModel.prototype.constructor.call(this, modelData);

            this.getIpAddressOptionList();

            this.model().on("change:ip_address", this.onChangeIpAddress, this);
            this.model().on("change:module", this.onChangeModule, this);
            this.model().on("change:module_introspect", function() {
                this.onChangeModuleIntrospect(IntrospectFormView)
            }, this);

            return this;
        },

        getIpAddressOptionList: function() {
            var self = this,
                model = self.model(),
                node = model.attributes.node,
                port = model.attributes.port,
                uiAddedParameters = model.attributes.ui_added_parameters,
                ipAddressOptionList = [];

            if (!contrail.checkIfExist(uiAddedParameters[node])) {
                uiAddedParameters[node] = {};

                if (!contrail.checkIfExist(uiAddedParameters[node][port])) {
                    uiAddedParameters[node][port] = {};

                    if (node === 'control') {
                        $.ajax({
                            url: '/api/admin/monitor/infrastructure/controlnodes/summary',
                            success: function (response) {
                                _.each(response, function(value, key) {
                                    var ipAddress = value['value']['ConfigData']['bgp-router']['bgp_router_parameters']['address'];
                                    uiAddedParameters[node][port][ipAddress] = {};
                                    ipAddressOptionList.push({id: ipAddress, text: ipAddress});
                                });

                                self.ip_address_option_list(ipAddressOptionList);
                            }
                        });
                    
                    } else if (node === 'vrouter') {

                        $.ajax({
                            url: '/api/admin/monitor/infrastructure/vrouters/summary',
                            success: function (response) {
                                _.each(response, function(value, key) {
                                    var ipAddress = value['value']['ConfigData']['virtual-router']['virtual_router_ip_address'];
                                    uiAddedParameters[node][port][ipAddress] = {};
                                    ipAddressOptionList.push({id: ipAddress, text: ipAddress});
                                });

                                self.ip_address_option_list(ipAddressOptionList);
                            }
                        });

                    } else if (node === 'config') {

                        $.ajax({
                            url: '/api/admin/monitor/infrastructure/confignodes/summary',
                            success: function (response) {
                                _.each(response, function(value, key) {
                                    var ipAddress = value['value']['derived-uve']['ConfigData']['config_node_ip_address'];
                                    uiAddedParameters[node][port][ipAddress] = {};
                                    ipAddressOptionList.push({id: ipAddress, text: ipAddress});
                                });

                                self.ip_address_option_list(ipAddressOptionList);
                            }
                        });

                    } else if (node === 'analytics') {

                        $.ajax({
                            url: '/api/admin/monitor/infrastructure/analyticsnodes/summary',
                            success: function (response) {
                                _.each(response, function(value, key) {
                                    var ipAddress = value['value']['derived-uve']['ConfigData']['analytics-node']['analytics_node_ip_address'];
                                    uiAddedParameters[node][port][ipAddress] = {};
                                    ipAddressOptionList.push({id: ipAddress, text: ipAddress});
                                });

                                self.ip_address_option_list(ipAddressOptionList);
                            }
                        });
                    }
                }
            } else {
                _.each(uiAddedParameters[node][port], function(value, key) {
                    ipAddressOptionList.push({id: key, text: key})
                });
                self.ip_address_option_list(ipAddressOptionList);
            }
        },

        onChangeIpAddress: function() {
            var self = this,
                model = self.model(),
                node = model.attributes.node,
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                uiAddedParameters = model.attributes.ui_added_parameters,
                modules = [];

            if (!contrail.checkIfExist(uiAddedParameters[node][port])) {
                uiAddedParameters[node][port] = {};
            }

            if (!contrail.checkIfExist(uiAddedParameters[node][port][ipAddress])) {
                uiAddedParameters[node][port][ipAddress] = {};
            }

            if (!$.isEmptyObject(uiAddedParameters[node][port][ipAddress])) {

                _.each(uiAddedParameters[node][port][ipAddress], function(value, key) {
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

                                uiAddedParameters[node][port][ipAddress][moduleText] = {};
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
                node = model.attributes.node,
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                module = model.attributes.module,
                uiAddedParameters = model.attributes.ui_added_parameters,
                moduleIntrospects = [];

            if (!$.isEmptyObject(uiAddedParameters[node][port][ipAddress][module])) {

                _.each(uiAddedParameters[node][port][ipAddress][module], function(value, key) {
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
                            uiAddedParameters[node][port][ipAddress][module][jsonKey] = jsonValue;
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
                node = model.attributes.node,
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                module = model.attributes.module,
                moduleIntrospect = model.attributes.module_introspect,
                uiAddedParameters = model.attributes.ui_added_parameters;

            IntrospectFormView.renderIntrospectSecondaryForm(uiAddedParameters[node][port][ipAddress][module][moduleIntrospect]);

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
