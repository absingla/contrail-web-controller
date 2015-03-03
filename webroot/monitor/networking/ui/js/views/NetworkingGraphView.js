/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-graph-model',
    'joint',
    'graph-view'
], function (_, Backbone, ContrailGraphModel, Joint, GraphView) {
    var NetworkingGraphView = Backbone.View.extend({
        render: function () {
            var graphTemplate = contrail.getTemplate4Id(cowc.TMPL_NETWORKING_GRAPH_VIEW),
                viewConfig = this.attributes.viewConfig,
                connectedGraph = viewConfig['connectedGraph'],
                configGraph = viewConfig['configGraph'],
                selectorId = '#networking-graph',
                connectedSelectorId = '#graph-connected-elements',
                configSelectorId = '#graph-config-elements';

            this.$el.html(graphTemplate);

            this.renderConfigGraph(configGraph, configSelectorId);
            this.renderConnectedGraph(connectedGraph, selectorId, connectedSelectorId, configSelectorId);
        },

        renderConnectedGraph: function (graphConfig, selectorId, connectedSelectorId, configSelectorId) {
            var connectedGraphConfig = $.extend(true, {}, graphConfig, {
                forceFit: true,
                generateElementsFn: getElements4ConnectedGraph
            });


            connectedGraphConfig['cacheConfig']['getDataFromCache'] = function(ucid) {
                return mnPageLoader.mnView.graphCache[ucid];
            };

            connectedGraphConfig['cacheConfig']['setData2Cache'] = function(ucid, dataObject) {
                mnPageLoader.mnView.graphCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
            };

            var connectedGraphModel = new ContrailGraphModel(connectedGraphConfig);

            var connectedGraphView = new GraphView({
                el: $(connectedSelectorId),
                model: connectedGraphModel
            });

            connectedGraphModel.fetchData(function (directedGraphSize) {
                $(selectorId).parent().find('.topology-visualization-loading').remove();

                connectedGraphView.setDimensions((($(selectorId).width() > directedGraphSize.width) ? $(selectorId).width() : directedGraphSize.width) + GRAPH_MARGIN, directedGraphSize.height + GRAPH_MARGIN, 1);
                $(connectedSelectorId).data('actual-size', directedGraphSize);
                $(connectedSelectorId).data('offset', {x: 0, y: 0});

                var jointObject = {
                    connectedGraph: connectedGraphModel,
                    connectedPaper: connectedGraphView
                };

                $(selectorId).data('joint-object', jointObject);
                adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId);
            });
        },

        renderConfigGraph: function (graphConfig, configSelectorId) {
            var confGraphConfig = $.extend(true, {}, graphConfig, {
                forceFit: false,
                generateElementsFn: getElements4ConfigGraph
            });

            confGraphConfig['cacheConfig']['getDataFromCache'] = function(ucid) {
                return mnPageLoader.mnView.graphCache[ucid];
            };

            confGraphConfig['cacheConfig']['setData2Cache'] = function(ucid, dataObject) {
                mnPageLoader.mnView.graphCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
            };

            var configGraphModel = new ContrailGraphModel(confGraphConfig);

            var configGraphView = new GraphView({
                el: $(configSelectorId),
                model: configGraphModel,
                width: 150
            });

            configGraphModel.fetchData(function () {});
        }
    });

    var getElements4ConnectedGraph = function (response, elementMap) {
        var connectedElements = [],
            nodes = response['nodes'],
            links = response['links'];

        createNodeElements(nodes, connectedElements, elementMap);
        createLinkElements(links, connectedElements, elementMap);

        return {
            elements: connectedElements,
            nodes: nodes,
            links: links
        };
    };

    var getElements4ConfigGraph = function (response, elementMap) {
        var configElements = [],
            collections = {},
            configData = response['configData'],
            configSVGHeight = 0;

        createNodes4ConfigData(configData, collections);

        configSVGHeight = createCollectionElements(collections, configElements, elementMap);

        return {
            elements: configElements,
            configSVGHeight: configSVGHeight
        };
    };


    var adjustNetworkingGraphHeight = function (selectorId, connectedSelectorId, configSelectorId) {
        var resizeFlag = ($(selectorId).parents('.visualization-container').find('.icon-resize-small').is(':visible')),
            tabHeight = resizeFlag ? 155 : 435,
            minHeight = 300,
            graphHeight = window.innerHeight - tabHeight,
            connectedElementsHeight = ($(connectedSelectorId).data('actual-size').height) ? $(connectedSelectorId).data('actual-size').height : 0,
            svgHeight = Math.max(connectedElementsHeight, $(configSelectorId + ' svg').attr('height')),
            elementHeight = resizeFlag ? graphHeight : ((graphHeight < minHeight) ? minHeight : ((svgHeight < graphHeight) ? ((svgHeight < minHeight) ? minHeight : svgHeight) : graphHeight));

        $(selectorId).parent().height(elementHeight);
        $(selectorId).find('.col1').height(elementHeight);
        $(connectedSelectorId + ' svg').attr('height', elementHeight);
        $(selectorId).parent().css('width', '100%');
        $(selectorId).parents('.visualization-container').find('.col3').height(elementHeight);

        var image = document.createElementNS('http://www.w3.org/2000/svg', 'image'),
            patt = document.createElementNS('http://www.w3.org/2000/svg', 'pattern'),
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
            svg = document.getElementsByTagName('svg')[0];

        patt.setAttribute('id', 'dotted');
        patt.setAttribute('patternUnits', 'userSpaceOnUse');
        patt.setAttribute('width', '100');
        patt.setAttribute('height', '100');

        image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/img/dotted.png');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', '101');
        image.setAttribute('height', '101');

        patt.appendChild(image);
        defs.appendChild(patt);
        svg.appendChild(defs);

        translateNetworkingGraphElements(selectorId, connectedSelectorId);
    };

    var translateNetworkingGraphElements = function (selectorId, connectedSelectorId) {
        var connectedGraphSize = $(connectedSelectorId).data('actual-size'),
            oldOffset = $(connectedSelectorId).data('offset'),
            offset = {
                x: ($(selectorId).find('.col1').width() > connectedGraphSize.width) ? ($(selectorId).find('.col1').width() - connectedGraphSize.width - GRAPH_MARGIN) / 2 : 0,
                y: ($(selectorId).find('.col1').height() > connectedGraphSize.height) ? ($(selectorId).find('.col1').height() - connectedGraphSize.height - GRAPH_MARGIN) / 2 : 0
            },
            connectedGraph = $(selectorId).data('joint-object').connectedGraph,
            elements = connectedGraph.getElements(),
            links = connectedGraph.getLinks();
        $(connectedSelectorId).data('offset', offset);

        $.each(elements, function (elementKey, elementValue) {
            elementValue.translate(offset.x - oldOffset.x, offset.y - oldOffset.y);
        });
    };

    return NetworkingGraphView;
});