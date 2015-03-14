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
            var cGraphModelConfig = $.extend(true, {}, graphConfig, {
                forceFit: true,
                generateElementsFn: getElements4ConnectedGraphFn(graphConfig, selectorId)
            });

            var cGraphViewConfig = {
                el: $(connectedSelectorId),
                graphModelConfig: cGraphModelConfig,
                tooltipConfig: ctwgrc.getConnectedGraphTooltipConfig(),
                clickEvents: {
                    //'blank:pointerclick': cgBlankPointerClick,
                    'cell:pointerdblclick': cgPointerDblClick,
                    'cell:pointerclick': cgPointerClick,
                    'cell:rightclick': ctwgrc.getConnectedGraphContextMenuConfig()
                },
                successCallback: function (connectedGraphView, directedGraphSize, jointObject) {
                    $(selectorId).parent().find('.graph-loading').remove(); // TODO - move class name to constants

                    connectedGraphView.setDimensions((($(selectorId).width() > directedGraphSize.width) ? $(selectorId).width() : directedGraphSize.width) + GRAPH_MARGIN, directedGraphSize.height + GRAPH_MARGIN, 1);
                    $(connectedSelectorId).data('actual-size', directedGraphSize);
                    $(connectedSelectorId).data('offset', {x: 0, y: 0});

                    $(selectorId).data('joint-object', jointObject);
                    if((!ctwc.PLOT_VM_VERTICAL) && (!ctwc.PLOT_VM_HORIZONTAL)){
                        adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId);
                    }
                    //TODO: Make control panel as a common view to grid and graph
                    initNetworkingGraphControlEvents(selectorId, connectedSelectorId, configSelectorId, connectedGraphView);
                    highlightSelectedElementForZoomedElement(connectedSelectorId, jointObject, graphConfig);

                    //TODO: Execute only in refresh case.
                    setTimeout(function(){
                        $(selectorId).find('.refresh i').removeClass('icon-spin icon-spinner').addClass('icon-repeat');
                    }, 1000);
                }
            };

            var connectedGraphView = new GraphView(cGraphViewConfig);
            connectedGraphView.render();
        },

        renderConfigGraph: function (graphConfig, configSelectorId) {
            var confGraphModelConfig = $.extend(true, {}, graphConfig, {
                forceFit: false,
                generateElementsFn: getElements4ConfigGraph
            });

            var confGraphViewConfig = {
                el: $(configSelectorId),
                width: 150,
                graphModelConfig: confGraphModelConfig,
                tooltipConfig: ctwgrc.getConfigGraphTooltipConfig(),
                clickEvents: {
                    'cell:rightclick': ctwgrc.getConfigGraphContextMenuConfig()
                }
            };

            var configGraphView = new GraphView(confGraphViewConfig);
            configGraphView.render()
        }
    });

    var getElements4ConnectedGraphFn = function (graphconfig, selectorId) {
        var focusedElementType = graphconfig.focusedElement.type,
            fqName = graphconfig.focusedElement.name.fqName;

        return function (response, elementMap) {
            var connectedElements = [],
                zoomedElements = [],
                nodes = response['nodes'],
                zoomedNodeElement = null,
                links = response['links'],
                zoomedNode = null;

            if (focusedElementType == ctwc.GRAPH_ELEMENT_PROJECT) {
                createNodeElements(nodes, connectedElements, elementMap);
            } else {
                var zoomedNodeKey = null,
                    options = null;

                $.each(nodes, function (nodeKey, nodeValue) {
                    if (nodeValue.name == fqName) {
                        zoomedNode = nodeValue;
                        zoomedNodeKey = nodeKey;

                        if (ctwc.PLOT_VM_VERTICAL) {
                            options = getVerticalZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);
                        } else if (ctwc.PLOT_VM_HORIZONTAL) {
                            options = getHorizontalZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);
                        } else {
                            options = getZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);
                        }

                        zoomedNodeElement = createCloudZoomedNodeElement(zoomedNode, {
                            width: options['widthZoomedElement'],
                            height: options['heightZoomedElement']
                        });

                        connectedElements.push(zoomedNodeElement);
                        elementMap.node[fqName] = zoomedNodeElement.id;

                        if (ctwc.PLOT_VM_VERTICAL) {
                            generateVerticalVMGraph(zoomedElements, zoomedNodeElement, options);
                        } else if (ctwc.PLOT_VM_HORIZONTAL) {
                            generateHorizontalVMGraph(zoomedElements, zoomedNodeElement, options);
                        } else {
                            generateVMGraph(zoomedElements, zoomedNodeElement, options);
                        }
                    }
                });

                nodes.splice(zoomedNodeKey, 1);

                createNodeElements(nodes, connectedElements, elementMap);

            }
            createLinkElements(links, connectedElements, elementMap);

            return {
                elements: connectedElements,
                nodes: nodes,
                links: links,
                zoomedNodeElement: zoomedNodeElement,
                zoomedElements: zoomedElements
            };
        };
    };

    function generateVMGraph(zoomedElements, zoomedNodeElement, options) {
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2;

        var centerLineHeight = 0.1,
            xFactor = 0, yFactor = -1;

        for (var i = 0; i < vmLength; i++) {
            if (i % vmPerRow == 0) {
                xFactor = 0;
                yFactor++;
            }
            vmNode = createVirtualMachine(xOrigin + (xSeparation * xFactor), yOrigin + ((ySeparation + centerLineHeight) * yFactor), vmList[i], options['srcVNDetails']);
            xFactor++;
            zoomedElements.push(vmNode);
        }

        function createVirtualMachine(x, y, node, srcVNDetails) {
            var nodeType = 'virtual-machine',
                element, options;

            options = {
                position: {x: x, y: y},
                size: {width: vmWidth, height: vmHeight},
                font: {
                    iconClass: 'icon-contrail-virtual-machine'
                },
                nodeDetails: {
                    fqName: node,
                    node_type: nodeType,
                    srcVNDetails: srcVNDetails
                },
                elementType: nodeType
            };
            element = new ContrailElement(nodeType, options);
            return element;
        };

        return zoomedElements;
    };

    function getElements4ConfigGraph(response, elementMap) {
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

    function generateHorizontalVMGraph(zoomedElements, zoomedNodeElement, options) {
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2;

        var xFactor = 0, yFactor = 0, linkThickness = 1, horizontalAdjustFactor = 6;
        if(vmLength !== 0){
            var longRect = createRect(xOrigin - vmWidth/2, yOrigin + ySeparation - horizontalAdjustFactor, vmLength * xSeparation + vmWidth/2, linkThickness);
            zoomedElements.push(longRect);
        }

        for (var i = 0; i < vmLength; i++) {

            vmNode = createVirtualMachine(xOrigin + (xSeparation * xFactor), yOrigin + ((ySeparation) * yFactor), vmList[i], options['srcVNDetails']);
            zoomedElements.push(vmNode);
            linkRect = createRect(xOrigin + (xSeparation * xFactor)+ vmWidth/2 +1, yOrigin + ((ySeparation) * yFactor) + vmHeight, linkThickness, ySeparation/2 -6);
            zoomedElements.push(linkRect);
            xFactor++;
        }

        function createRect (x, y, width, height){
            var rect = new joint.shapes.basic.Rect({
                position: { x: x, y: y}, size: { width: width, height: height},
                attrs: {rect:{stroke: '#3182bd', opacity: 1}}
            });
            return rect;
        }
        function createVirtualMachine(x, y, node, srcVNDetails) {
            var nodeType = 'virtual-machine',
                element, options;

            options = {
                position: {x: x, y: y},
                size: {width: vmWidth, height: vmHeight},
                font: {
                    iconClass: 'icon-contrail-virtual-machine'
                },
                nodeDetails: {
                    fqName: node,
                    node_type: nodeType,
                    srcVNDetails: srcVNDetails
                },
                elementType: nodeType
            };
            element = new ContrailElement(nodeType, options);
            return element;
        };

        return zoomedElements;
    }

    function generateVerticalVMGraph(zoomedElements, zoomedNodeElement, options) {
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2;

        var centerLineHeight = 0.1,
            xFactor = 0, yFactor = -1, linkThickness = 1
        if(vmLength !== 0){
            var longRect = createRect(xOrigin + vmWidth + xSeparation/2, yOrigin - vmMargin/2, linkThickness, vmLength * ySeparation);
            zoomedElements.push(longRect);
        }

        for (var i = 0; i < vmLength; i++) {
            if (i % vmPerRow == 0) {
                xFactor = 0;
                yFactor++;
            }
            vmNode = createVirtualMachine(xOrigin + (xSeparation * xFactor), yOrigin + ((ySeparation) * yFactor), vmList[i], options['srcVNDetails']);
            zoomedElements.push(vmNode);
            linkRect = createRect(xOrigin + vmWidth + 2, yOrigin + ((ySeparation) * yFactor) + vmHeight/2, xSeparation/2 - 2, linkThickness);
            zoomedElements.push(linkRect);
        }

        function createRect (x, y, width, height){
            var rect = new joint.shapes.basic.Rect({
                position: { x: x, y: y}, size: { width: width, height: height},
                attrs: {rect:{stroke: '#3182bd', opacity: 1}}
            });
            return rect;
        }
        function createVirtualMachine(x, y, node, srcVNDetails) {
            var nodeType = 'virtual-machine',
                element, options;

            options = {
                position: {x: x, y: y},
                size: {width: vmWidth, height: vmHeight},
                font: {
                    iconClass: 'icon-contrail-virtual-machine'
                },
                nodeDetails: {
                    fqName: node,
                    node_type: nodeType,
                    srcVNDetails: srcVNDetails
                },
                elementType: nodeType
            };
            element = new ContrailElement(nodeType, options);
            return element;
        };

        return zoomedElements;
    };

    function adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId) {
        /*
         * Height logic (svgHeight[s], topologyHeight[t], minHeight[m])
         * t < m     = m
         * s < m < t = m
         * m < s < t = s
         * m < t < s = t
         */

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

        // Adding dotted image SVG TODO - make a separate function to handle this
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

    function translateNetworkingGraphElements(selectorId, connectedSelectorId) {
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
            //TODO: Fix getStroke error in joint.clean
            elementValue.translate(offset.x - oldOffset.x, offset.y - oldOffset.y);
        });
    };

    function initNetworkingGraphControlEvents(selectorId, connectedSelectorId, configSelectorId, connectedGraphView) {
        var graphControlElement = $(selectorId).find('.graph-controls');

        /* Pan and Zoom events */
        $(connectedSelectorId).panzoom({
            increment: 0.3,
            minScale: 0.3,
            maxScale: 2,
            duration: 300,
            $zoomIn: graphControlElement.find(".zoom-in"),
            $zoomOut: graphControlElement.find(".zoom-out"),
            $reset: graphControlElement.find(".zoom-reset")
        });

        /* Resize Events */
        graphControlElement.find('.resize')
            .off('click')
            .on('click', function (event) {
                $(this).find('i').toggleClass('icon-resize-full').toggleClass('icon-resize-small');
                adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId);
            }
        );

        graphControlElement.find('.refresh')
            .off('click')
            .on('click', function () {
                $(this).find('i').removeClass('icon-repeat').toggleClass('icon-spin icon-spinner');
                connectedGraphView.refreshData();
                //TODO: If spinning don't call refreshData
            }
        );

        graphControlElement.find('.left-to-right')
            .off('click')
            .on('click', function () {
                connectedGraphView.model.reLayoutGraph("LR");
            }
        );

        graphControlElement.find('.top-to-bottom')
            .off('click')
            .on('click', function () {
                connectedGraphView.model.reLayoutGraph("TB");
            }
        );
    };

    function cgBlankPointerClick(evt, x, y) {
        $('g').popover('hide');
    };

    function cgPointerClick(cellView, evt, x, y) {

        var clickedElement = cellView.model.attributes,
            elementNodeType= clickedElement.elementType,
            elementNodeId = cellView.model.id,
            bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
            tabConfig = {};

        highlightElementsToFaint([
            $('div.font-element')
        ]);

        highlightSVGElementsToFaint([
            $('g.element'),
            $('g.link')
        ]);

        $('div.font-element[font-element-model-id="' + elementNodeId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
        $('g[model-id="' + elementNodeId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');

        switch (elementNodeType) {
            case 'virtual-network':

                var networkFQN = clickedElement.nodeDetails.name,
                    networkUUID = ctwu.getUUIDByName(networkFQN);

                tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, {
                    networkFQN: networkFQN,
                    networkUUID: networkUUID
                });

                layoutHandler.setURLHashParams({
                    clickedElement: {
                        fqName: networkFQN,
                        uuid: networkUUID,
                        type: elementNodeType
                    }
                }, { merge: true, triggerHashChange: false});

                break;

            case 'virtual-machine':

                var networkFQN = clickedElement.nodeDetails.fqName,
                    instanceUUID = clickedElement.nodeDetails.fqName;

                tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, {
                    networkFQN: networkFQN,
                    instanceUUID: instanceUUID
                });

                layoutHandler.setURLHashParams({
                    clickedElement: {
                        fqName: networkFQN,
                        uuid: instanceUUID,
                        type: elementNodeType

                    }
                }, { merge: true, triggerHashChange: false});

                break;

            case 'connected-network':

                var sourceElement = clickedElement.linkDetails.dst,
                    targetElement = clickedElement.linkDetails.src;

                tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, {
                    sourceElement: sourceElement,
                    targetElement: targetElement,
                    linkDetails: clickedElement.linkDetails
                });

                $('g.link[model-id="' + elementNodeId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');

                break;
        }

        cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
    }

    function cgPointerDblClick(cellView, evt, x, y) {
        var dblClickedElement = cellView.model.attributes,
            elementNodeType= dblClickedElement.elementType,
            elementNodeId = cellView.model.id;

        switch (elementNodeType) {
            case 'virtual-network':
                globalObj.hashUpdated = 0;
                loadFeature({
                    p: 'mon_networking_networks',
                    q: {
                        focusedElement: {
                            fqName: dblClickedElement.nodeDetails['name'],
                            type: elementNodeType
                        },
                        view: 'details',
                        type: 'network'
                    }
                });
                $('g.VirtualNetwork').popover('hide');
                break;
            case 'virtual-machine':
                var srcVN = dblClickedElement.nodeDetails.srcVNDetails.name;
                loadFeature({
                    p: 'mon_networking_instances',
                    q: {
                        type: 'instance',
                        view: 'details',
                        focusedElement: {
                            fqName: srcVN,
                            uuid: dblClickedElement.nodeDetails['fqName'],
                            type: 'virtual-network'
                        }
                    }
                });
                $('g.VirtualMachine').popover('hide');
                break;

        }
    };

    var highlightSelectedElementForZoomedElement = function(connectedSelectorId, jointObject, graphConfig) {
        highlightSelectedSVGElements([$('g.ZoomedElement')]);
        if (graphConfig.focusedElement.type == 'Network') {
            highlightSelectedElements([$('div.VirtualMachine')]);
            highlightSelectedSVGElements([$('g.VirtualMachine'), $('.VirtualMachineLink')]);
        }
        else if (graphConfig.focusedElement.type == 'Instance') {
            highlightElementsToFaint([
                $(connectedSelectorId).find('div.font-element')
            ]);

            highlightSVGElementsToFaint([
                $(connectedSelectorId).find('g.element'),
                $(connectedSelectorId).find('g.link')
            ]);
            var graphElements = jointObject.connectedGraph.getElements(),
                vmFqName = graphConfig.focusedElement.name.instanceUUID;

            $.each(graphElements, function (graphElementKey, graphElementValue) {
                if (graphElementValue.attributes.type == 'contrail.VirtualMachine' && graphElementValue.attributes.nodeDetails.fqName == vmFqName) {
                    var modelId = graphElementValue.id;
                    vmLinks = jointObject.connectedGraph.getConnectedLinks(graphElementValue);

                    $('g.VirtualNetwork').find('rect').addClassSVG('faintHighlighted').removeClassSVG('elementSelectedHighlighted');
                    $('g[model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
                    $('div.font-element[font-element-model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');

                    $.each(vmLinks, function (vmLinkKey, vmLinkValue) {
                        $('g.link[model-id="' + vmLinkValue.id + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
                    });
                }
            });
        }
    };

    return NetworkingGraphView;
});