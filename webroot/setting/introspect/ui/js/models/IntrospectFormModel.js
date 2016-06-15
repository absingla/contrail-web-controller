/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'contrail-model'
], function (_, Knockout, ContrailModel) {
    var IntrospectFormModel = ContrailModel.extend({

        constructor: function (modelData) {
            var defaultConfig = {
                ip_address: null,
                port: 8083,
                module: null,
                module_introspect: null,

                module_option_list: [],
                module_introspect_option_list: []
            };

            modelData = $.extend(true, {}, defaultConfig, modelData);
            ContrailModel.prototype.constructor.call(this, modelData);

            this.model().on("change:ip_address", this.onChangeIpAddress, this);
            this.model().on("change:module", this.onChangeModule, this);

            return this;
        },

        onChangeIpAddress: function() {
            var self = this,
                model = self.model(),
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                modules = [];

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
        },

        onChangeModule: function() {
            var self = this,
                model = self.model(),
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                module = model.attributes.module,
                moduleIntrospects = [];

            $.ajax({
                url: '/proxy?proxyURL=http://' + ipAddress + ':' + port + '/' + module + '.xml',
                dataType: 'xml',
                success: function (xml) {
                    var json = $.xml2json(xml);
                    _.each(json, function(jsonValue, jsonKey){
                        moduleIntrospects.push({id: jsonKey, text: jsonKey})
                    });

                    self.module_introspect_option_list(moduleIntrospects);
                },
                error: function(error) {
                    if (error.status === 404) {
                        //TODO
                    }
                }
            });

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

    return IntrospectFormModel;
});
