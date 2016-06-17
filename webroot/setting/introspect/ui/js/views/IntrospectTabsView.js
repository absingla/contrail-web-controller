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
                ipAddress = viewConfig.ip_address,
                port = viewConfig.port,
                moduleIntrospect = viewConfig.module_introspect,
                params = viewConfig.params,
                url = '/proxy?proxyURL=http://' + ipAddress + ':' + port + '/Snh_' +
                    moduleIntrospect + '?' + $.param(params);

            $.ajax({
                url: url,
                cache: true,
                dataType: 'xml',
                success: function (xml) {
                    var x2js = new xml2json(),
                        json = x2js.xml2json(xml);

                    self.renderIntrospectTabs(xml, json);
                },
                error: function(error) {
                    if (error.status === 404) {
                        //TODO
                    }
                }
            });
        },

        renderIntrospectTabs: function(xml, json) {
            var self = this,
                modelMap = contrail.handleIfNull(self.modelMap, {});

            self.renderView4Config(self.$el, self.model,
                getIntrospectTabViewConfig(xml, json), null, null, modelMap, null);
        }
    });

    function getIntrospectTabViewConfig(xml, json) {
        return {
            elementId: 'introspect-result-tabs',
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                active: 0,
                tabs: [
                    getIntrospectJSGridTabViewConfig(json),
                    getIntrospectXSLGridTabViewConfig(xml),
                    getIntrospectJSONTabViewConfig(json)
                ]
            }
        }
    }

    function getIntrospectJSGridTabViewConfig(json) {
        var gridId = 'tabs-grid';

        return {
            elementId: gridId,
            title: 'JS Grid',
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

    function getIntrospectXSLGridTabViewConfig(xml) {
        var gridId = 'tabs-xsl-grid';

        return {
            elementId: gridId,
            title: 'XSL Grid',
            view: 'IntrospectXSLGridView',
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                xmlData: xml
            }
        }
    }

    function getIntrospectJSONTabViewConfig(json) {
        var gridId = 'tabs-json-grid';

        return {
            elementId: gridId,
            title: 'JSON Grid',
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