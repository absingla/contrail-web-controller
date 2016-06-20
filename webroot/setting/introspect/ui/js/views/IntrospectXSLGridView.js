/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var IntrospectXSLGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                xmlData = viewConfig.xmlData;

            $.ajax({
                url: 'xsl/main.xsl',
                dataType: 'xml',
                success: function(xsl) {
                    var xsltProcessor = new XSLTProcessor(),
                        resultDocument;

                    xsltProcessor.importStylesheet(xsl);
                    resultDocument = xsltProcessor.transformToFragment(xmlData, document);

                    $(self.$el).html(resultDocument)
                }
            });
        }
    });

    return IntrospectXSLGridView;
});