/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'xml2json'
], function (_, ContrailView, xml2json) {
    var IntrospectResultTabsView = ContrailView.extend({
        el: $(contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                node = viewConfig.node,
                ipAddress = viewConfig.ip_address,
                port = viewConfig.port,
                moduleIntrospect = viewConfig.module_introspect,
                params = viewConfig.params,
                url = '/proxy?proxyURL=http://' + ipAddress + ':' + port + '/Snh_' +
                    moduleIntrospect + '?' + $.param(params);

                self.fetchIntrospect(url);

        },

        fetchIntrospect: function(url) {
            var self = this;

            $.ajax({
                url: url,
                cache: true,
                dataType: 'xml',
                success: function (xml) {
                    var x2js = new xml2json(),
                        json = x2js.xml2json(xml),
                        data = { xml: xml, json: json };

                    self.renderIntrospectTabs(data);
                },
                error: function(error) {
                    if (error.status === 404) {
                        //TODO
                    }
                }
            });
        },

        renderIntrospectTabs: function(data) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                node = viewConfig.node,
                ipAddress = viewConfig.ip_address,
                moduleIntrospect = viewConfig.module_introspect,
                port = viewConfig.port,
                modelMap = contrail.handleIfNull(self.modelMap, {});

            self.renderView4Config(self.$el, self.model, getIntrospectTabViewConfig(data, node, port), null, null, modelMap, function() {
                var json = data.json,
                    jsonKeys = _.keys(json),
                    moduleItemName =jsonKeys[0];

                if (contrail.checkIfExist(json[moduleItemName]['next_batch'])) {
                    $('#introspect-result-' + node + '-' + port + '-next-batch-tab-extra-link')
                        .parent('li').show()
                        .off('click')
                        .on('click', function() {
                            var url = '/proxy?proxyURL=http://' + ipAddress + ':' + port + '/Snh_' +
                                json[moduleItemName]['next_batch']['_link'] + '?x=' + json[moduleItemName]['__text'];

                            self.fetchIntrospect(url)
                        });
                }
            });
        }
    });

    function getIntrospectTabViewConfig(data, node, port) {
        return {
            elementId: 'introspect-result-' + node + '-' + port + 'tabs',
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                active: 0,
                tabs: [
                    getIntrospectJSGridTabViewConfig(data, node, port),
                    getIntrospectXSLGridTabViewConfig(data, node, port),
                    getIntrospectJSONTabViewConfig(data, node, port)
                ],
                extra_links: [
                    {
                        elementId: 'introspect-result-' + node + '-' + port + '-next-batch',
                        title: 'Next Batch',
                        events: {
                            click: function() {
                                console.log('here')
                            }
                        }
                    }
                ]
            }
        }
    }

    function getIntrospectJSGridTabViewConfig(data, node, port) {
        var json = data.json,
            gridId = 'introspect-result-' + node + '-' + port + '-js-grid';

        return {
            elementId: gridId,
            title: 'Grid',
            view: 'IntrospectJSGridView',
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            tabConfig: {
                activate: function (event, ui) {
                    if ($('#' + gridId).data('contrailGrid')) {
                        $('#' + gridId).data('contrailGrid').refreshView();
                    }
                }
            },
            viewConfig: {
                jsonData: json
            }
        }
    }

    function getIntrospectXSLGridTabViewConfig(data, node, port) {
        var xml = data.xml,
            gridId = 'introspect-result-' + node + '-' + port + '-xsl-grid';

        return {
            elementId: gridId,
            title: 'XSL',
            view: 'IntrospectXSLGridView',
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                xmlData: xml
            }
        }
    }

    function getIntrospectJSONTabViewConfig(data, node, port) {
        var json = data.json,
            jsonId = 'introspect-result-' + node + '-' + port + '-json';

        return {
            elementId: jsonId,
            title: 'JSON',
            view: 'IntrospectJSONView',
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                jsonData: json
            }
        }
    }

    return IntrospectResultTabsView;
});