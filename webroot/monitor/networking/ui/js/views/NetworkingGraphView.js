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

            var connectedGraphView = this.renderConnectedGraph(connectedGraph, selectorId, connectedSelectorId, configSelectorId);
            this.renderConfigGraph(configGraph, configSelectorId, connectedGraphView);
        },

        renderConnectedGraph: function (graphConfig, selectorId, connectedSelectorId, configSelectorId) {
            var cGraphModelConfig = $.extend(true, {}, graphConfig, {
                forceFit: true,
                generateElementsFn: getElements4ConnectedGraphFn(graphConfig, selectorId)
            });

            var cGraphViewConfig = {
                el: $(connectedSelectorId),
                linkView: joint.shapes.contrail.LinkView,
                graphModelConfig: cGraphModelConfig,
                tooltipConfig: ctwgrc.getConnectedGraphTooltipConfig(),
                clickEvents: {
                    'cell:pointerclick': cgPointerClick,
                    //'blank:pointerclick': '',
                    'cell:pointerdblclick': cgPointerDblClick,
                    'blank:pointerdblclick': getCgBlankDblClick(connectedSelectorId, graphConfig)
                },
                showControlPanel: true,
                successCallback: function (connectedGraphView, directedGraphSize, jointObject) {
                    $(selectorId).parent().find('.graph-loading').remove(); // TODO - move class name to constants

                    connectedGraphView.setDimensions((($(selectorId).width() > directedGraphSize.width) ? $(selectorId).width() : directedGraphSize.width) + GRAPH_MARGIN, directedGraphSize.height + GRAPH_MARGIN, 1);
                    $(connectedSelectorId).data('graph-size', directedGraphSize);
                    //$(connectedSelectorId).data('offset', {x: 0, y: 0});

                    $(connectedSelectorId).data('joint-object', jointObject);

                    //TODO: Make control panel as a common view to grid and graph
                    initNetworkingGraphControlEvents(graphConfig.focusedElement, selectorId, connectedSelectorId, configSelectorId, connectedGraphView);
                    highlightElement4ZoomedElement(connectedSelectorId, jointObject, graphConfig);

                    //TODO: Execute only in refresh case.
                    setTimeout(function(){
                        $(selectorId).find('.refresh i').removeClass('icon-spin icon-spinner').addClass('icon-repeat');
                    }, 1000);

                    adjustNetworkingGraphHeight(graphConfig.focusedElement, selectorId, connectedSelectorId, configSelectorId, connectedGraphView);
                }
            };

            var connectedGraphView = new GraphView(cGraphViewConfig);
            connectedGraphView.render();
            return connectedGraphView;
        },

        renderConfigGraph: function (graphConfig, configSelectorId, connectedGraphView) {
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
                    'cell:pointerclick': getConfgPointerClickFn(connectedGraphView)
                }
            };

            var configGraphView = new GraphView(confGraphViewConfig);
            configGraphView.render();
            return configGraphView;
        }
    });

    function getElements4ConnectedGraphFn(graphconfig, selectorId) {
        var focusedElementType = graphconfig.focusedElement.type,
            fqName = graphconfig.focusedElement.name.fqName;

        return function (response, elementMap, rankDir) {
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

                        if (rankDir == ctwc.GRAPH_DIR_TB) {
                            options = getVerticalZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);
                        } else if (rankDir == ctwc.GRAPH_DIR_LR) {
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

                        if (rankDir == ctwc.GRAPH_DIR_TB) {
                            generateVerticalVMGraph(zoomedElements, zoomedNodeElement, options);
                        } else if (rankDir == ctwc.GRAPH_DIR_LR) {
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

        var xFactor = 0, yFactor = 0, linkThickness = 1, rectThickness = 2, horizontalAdjustFactor = 6;
        if(vmLength !== 0){
            var longRect = createRect(xOrigin - vmWidth/2, yOrigin + ySeparation - horizontalAdjustFactor, vmLength * xSeparation + vmWidth/2, rectThickness);
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
                type: 'VirtualMachineLink',
                position: { x: x, y: y}, size: { width: width, height: height},
                attrs: {rect:{stroke: '#3182bd', opacity: 1, fill: '#3182bd'}}
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
            xFactor = 0, yFactor = -1,
            linkThickness = 1, rectThickness = 2;
        if(vmLength !== 0){
            var longRect = createRect(xOrigin + vmWidth + xSeparation/2, yOrigin - vmMargin/2, rectThickness, vmLength * ySeparation);
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
                attrs: {rect:{stroke: '#3182bd', opacity: 1, fill: '#3182bd'}}
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

    function adjustNetworkingGraphHeight(focusedElement, selectorId, connectedSelectorId, configSelectorId, connectedGraphView) {
        /*
         * Height logic (graphHeight[g], availableHeight[g], minHeight[m])
         * a < m     = m
         * g < m < a = m
         * m < g < a = g
         * m < a < g = a
         */

        var resizeFlag = ($(selectorId).parents('.visualization-container').find('.icon-resize-small').is(':visible')),
            tabHeight = resizeFlag ? 155 : 435, //TODO - move to constants
            minHeight = 300,
            availableHeight = window.innerHeight - tabHeight,
            connectedGraphHeight = ($(connectedSelectorId).data('graph-size').height) ? $(connectedSelectorId).data('graph-size').height : 0,
            configGraphHeight = $(configSelectorId + ' svg').attr('height'),
            graphHeight = Math.max(connectedGraphHeight, configGraphHeight),
            adjustedHeight = availableHeight;

        if(!resizeFlag) {
            if (availableHeight < minHeight) {
                adjustedHeight = minHeight;
            } else {
                if (graphHeight < minHeight) {
                    adjustedHeight = minHeight;
                } else {
                    if (graphHeight < availableHeight) {
                        adjustedHeight = graphHeight;
                    }
                }
            }
        }

        $(selectorId).parent().height(adjustedHeight);
        $(selectorId).parent().css('width', '100%');

        $(connectedSelectorId).parents('.col1').height(adjustedHeight);
        $(configSelectorId).parents('.col3').height(adjustedHeight);

        if(connectedGraphHeight < adjustedHeight) {
            $(connectedSelectorId + ' svg').attr('height', adjustedHeight);
            //translateConnectedGraph2Center(selectorId, connectedSelectorId, connectedGraphView);
        }

        if(configGraphHeight < adjustedHeight) { //TODO - Needs to be tested with multiple config elements
            $(configSelectorId + ' svg').attr('height', adjustedHeight);
        }

        panConnectedGraph2Center(focusedElement, selectorId, connectedSelectorId);
    };

    function panConnectedGraph2Center(focusedElement, selectorId, connectedSelectorId) {
        var connectedGraphWidth = $(connectedSelectorId).data('graph-size').width,
            connectedGraphHeight = $(connectedSelectorId).data('graph-size').height,
            availableGraphWidth = $(connectedSelectorId).parents('.col1').width(),
            availableGraphHeight = $(connectedSelectorId).parents('.col1').height(),
            panX = (availableGraphWidth - connectedGraphWidth) / 2,
            panY = (availableGraphHeight - connectedGraphHeight) / 2;

        if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT && connectedGraphHeight > availableGraphHeight) {
            panY = 0;
        }

        $(connectedSelectorId).panzoom("resetPan");
        $(connectedSelectorId).panzoom("pan", panX, panY, { relative: true });
        $(connectedSelectorId).css({'backface-visibility':'initial'});
    };

    function initNetworkingGraphControlEvents(focusedElement, selectorId, connectedSelectorId, configSelectorId, connectedGraphView) {
        var graphControlElement = $(selectorId).find('.graph-controls');

        /* Pan and Zoom events */
        $(connectedSelectorId).panzoom({
            increment: 0.3,
            minScale: 0.3,
            maxScale: 2,
            duration: 300,
            $zoomIn: graphControlElement.find(".zoom-in"),
            $zoomOut: graphControlElement.find(".zoom-out"),
            $reset: graphControlElement.find(".zoom-reset"),
            onReset: function() {
                panConnectedGraph2Center(focusedElement, selectorId, connectedSelectorId)
            }
        });

        /* Resize Events */
        graphControlElement.find('.resize')
            .off('click')
            .on('click', function (event) {
                $(this).find('i').toggleClass('icon-resize-full').toggleClass('icon-resize-small');
                adjustNetworkingGraphHeight(focusedElement, selectorId, connectedSelectorId, configSelectorId, connectedGraphView);
            }
        );

        graphControlElement.find('.realign')
            .off('click')
            .on('click', function () {
                if ($(this).find('i').hasClass('icon-align-left')) {
                    connectedGraphView.model.reLayoutGraph("LR");
                } else if ($(this).find('i').hasClass('icon-align-center')) {
                    connectedGraphView.model.reLayoutGraph("TB");
                }
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
    };

    var cgPointerClick = function(cellView, evt, x, y) {

        var clickedElement = cellView.model.attributes,
            elementNodeType= clickedElement.elementType,
            elementNodeId = cellView.model.id,
            bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
            tabConfig = {};

        highlightCurrentElement(elementNodeId);

        switch (elementNodeType) {
            case ctwc.GRAPH_ELEMENT_NETWORK:

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

            case ctwc.GRAPH_ELEMENT_INSTANCE:

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

                break;
        }

        cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
    };

    var cgPointerDblClick = function(cellView, evt, x, y) {
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

    var getCgBlankDblClick = function(connectedSelectorId, graphConfig) {

        return function() {
            var currentHashParams = layoutHandler.getURLHashParams(),
                focusedElementType = graphConfig.focusedElement.type,
                bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = {};

            switch (focusedElementType) {
                case ctwc.GRAPH_ELEMENT_PROJECT:

                    removeFaint4AllElements();
                    removeHighlight4AllElements();

                    var projectFQN = graphConfig.focusedElement.name.fqName,
                        projectUUID = ctwu.getUUIDByName(projectFQN);

                    tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                        projectFQN: projectFQN,
                        projectUUID: projectUUID
                    });

                    ctwgrc.setProjectURLHashParams(projectFQN, false);

                    break;

                case ctwc.GRAPH_ELEMENT_NETWORK:
                    var networkFQN = graphConfig.focusedElement.name.fqName;

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var networkUUID = ctwu.getUUIDByName(networkFQN);

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            networkFQN: networkFQN,
                            networkUUID: networkUUID
                        });

                        highlightNetwork4ZoomedElement(connectedSelectorId, graphConfig);
                        ctwgrc.setNetworkURLHashParams(networkFQN, false);

                    } else {
                        var projectFQN = networkFQN.split(':').splice(0,2).join(':');
                        ctwgrc.setProjectURLHashParams(projectFQN, true);
                    }

                    break;

                case ctwc.GRAPH_ELEMENT_INSTANCE:
                    var networkFQN = graphConfig.focusedElement.name.fqName;

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {

                        var instanceUUID = graphConfig.focusedElement.name.instanceUUID;

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            networkFQN: networkFQN,
                            instanceUUID: instanceUUID
                        });

                        highlightInstance4ZoomedElement(connectedSelectorId, graphConfig);
                        ctwgrc.setInstanceURLHashParams(networkFQN, instanceUUID, false);
                    } else {
                        ctwgrc.setNetworkURLHashParams(networkFQN, true);
                    }

                    break;
            };

            cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);

        };
    };

    var highlightElement4ZoomedElement = function(connectedSelectorId, jointObject, graphConfig) {
        var focusedElementType = graphConfig.focusedElement.type;

        if (focusedElementType == ctwc.GRAPH_ELEMENT_NETWORK) {
            highlightNetwork4ZoomedElement(connectedSelectorId, graphConfig);
        }
        else if (focusedElementType == ctwc.GRAPH_ELEMENT_INSTANCE) {
            highlightInstance4ZoomedElement(connectedSelectorId, graphConfig);
        }
    };

    var highlightNetwork4ZoomedElement = function(connectedSelectorId, graphConfig) {
        faintAllElements();
        highlightSVGElements([$('g.ZoomedElement')]);
        highlightElements([$('div.VirtualMachine')]);
        highlightSVGElements([$('g.VirtualMachine'), $('.VirtualMachineLink')]);
    };

    var highlightInstance4ZoomedElement = function(connectedSelectorId, graphConfig) {
        faintAllElements();
        highlightSVGElements([$('g.ZoomedElement')]);

        var jointObject = $(connectedSelectorId).data('joint-object'),
            graphElements = jointObject.connectedGraph.getElements(),
            vmFqName = graphConfig.focusedElement.name.instanceUUID;

        $.each(graphElements, function (graphElementKey, graphElementValue) {
            if (graphElementValue.attributes.type == 'contrail.VirtualMachine' && graphElementValue.attributes.nodeDetails.fqName == vmFqName) {
                var modelId = graphElementValue.id;

                highlightElements([$('div.font-element[font-element-model-id="' + modelId + '"]')]);
                highlightSVGElements([$('g[model-id="' + modelId + '"]')]);
            }
        });
    };

    function getConfgPointerClickFn(connectedGraphView) {
        return function (cellView, evt, x, y) {
            var clickedElement = cellView.model.attributes,
                elementNodeType= clickedElement.type,
                elementMap = connectedGraphView.model.elementMap,
                jointObject = {
                    connectedGraph: connectedGraphView.model
                };

            switch (elementNodeType) {
                case 'contrail.NetworkPolicy':
                    onClickNetworkPolicy(cellView.model, jointObject, elementMap);
                    break;
            };
        }
    };

    function onClickNetworkPolicy(cellModel, jointObject, elementMap) {
        var cellAttributes = cellModel.attributes;

        var policyRules = (contrail.checkIfExist(cellAttributes.nodeDetails.network_policy_entries)) ? cellAttributes.nodeDetails.network_policy_entries.policy_rule : [],
            highlightedElements = { nodes: [], links: [] };

        highlightCurrentElement(cellAttributes.id);

        $.each(policyRules, function (policyRuleKey, policyRuleValue) {
            var sourceNode = policyRuleValue.src_addresses[0],
                destinationNode = policyRuleValue.dst_addresses[0],
                serviceInstanceNode = policyRuleValue.action_list.apply_service,
                serviceInstanceNodeLength = 0,
                policyRuleLinkKey = [];

            highlightedElements = { nodes: [], links: [] };

            $.each(sourceNode, function (sourceNodeKey, sourceNodeValue) {
                if (contrail.checkIfExist(sourceNodeValue)) {
                    highlightedElements.nodes.push(sourceNodeValue);
                    policyRuleLinkKey.push(sourceNodeValue);

                    if (serviceInstanceNode) {
                        serviceInstanceNodeLength = serviceInstanceNode.length
                        $.each(serviceInstanceNode, function (serviceInstanceNodeKey, serviceInstanceNodeValue) {
                            highlightedElements.nodes.push(serviceInstanceNodeValue);
                            policyRuleLinkKey.push(serviceInstanceNodeValue);
                        });
                        policyRuleLinkKey.push(destinationNode[sourceNodeKey]);
                        highlightedElements.links.push(policyRuleLinkKey.join('<->'));
                        highlightedElements.links.push(policyRuleLinkKey.reverse().join('<->'));

                    } else {
                        policyRuleLinkKey.push(destinationNode[sourceNodeKey]);
                        highlightedElements.links.push(destinationNode[sourceNodeKey] + '<->' + sourceNodeValue);
                        highlightedElements.links.push(sourceNodeValue + '<->' + destinationNode[sourceNodeKey]);
                    }
                }
            });
            $.each(destinationNode, function (destinationNodeKey, destinationNodeValue) {
                if (contrail.checkIfExist(destinationNodeValue)) {
                    highlightedElements.nodes.push(destinationNodeValue);
                }
            });

            if (elementMap.link[policyRuleLinkKey.join('<->')] || elementMap.link[policyRuleLinkKey.reverse().join('<->')]) {
                highlightedElements.nodes = $.unique(highlightedElements.nodes);
                $.each(highlightedElements.nodes, function (nodeKey, nodeValue) {
                    var nodeElement = jointObject.connectedGraph.getCell(elementMap.node[nodeValue]);
                    $('g[model-id="' + nodeElement.id + '"]').removeClassSVG('fainted').addClassSVG('highlighted');
                    $('div[font-element-model-id="' + nodeElement.id + '"]').removeClass('fainted').addClass('highlighted');

                    if ($('g[model-id="' + nodeElement.id + '"]').hasClassSVG('ZoomedElement')) {
                        highlightElements([$('div.VirtualMachine')]);
                        highlightSVGElements([$('g.VirtualMachine'), $('.VirtualMachineLink')]);
                    }


                });

                if (policyRuleValue.action_list.simple_action == 'pass') {
                    highlightedElements.links = $.unique(highlightedElements.links);
                    $.each(highlightedElements.links, function (highlightedElementLinkKey, highlightedElementLinkValue) {
                        if (elementMap.link[highlightedElementLinkValue]) {
                            if (typeof elementMap.link[highlightedElementLinkValue] == 'string') {
                                highlightLinkElement(jointObject, elementMap.link[highlightedElementLinkValue]);
                            } else {
                                $.each(elementMap.link[highlightedElementLinkValue], function (linkKey, linkValue) {
                                    highlightLinkElement(jointObject, linkValue)
                                });
                            }

                        }
                    });
                }
            }
        });
    };

    var highlightCurrentElement = function(elementNodeId) {
        faintAllElements();

        highlightElements([$('div.font-element[font-element-model-id="' + elementNodeId + '"]')]);
        highlightSVGElements([$('g[model-id="' + elementNodeId + '"]')])
    };

    var highlightLinkElement = function(jointObject, elementId) {
        var linkElement = jointObject.connectedGraph.getCell(elementId);
        if (linkElement) {
            highlightSVGElements([$('g[model-id="' + linkElement.id + '"]')]);
        }
    };

    var highlightElements = function(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClass('fainted').addClass('highlighted');
        });
    };

    var highlightSVGElements = function(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClassSVG('fainted').addClassSVG('highlighted');
        });
    };

    var faintAllElements = function() {
        $('div.font-element').removeClass('highlighted').addClass('fainted');
        $('g.element').removeClassSVG('highlighted').addClassSVG('fainted');
        $('g.link').removeClassSVG('highlighted').addClassSVG('fainted');
    };

    var removeFaint4AllElements  = function() {
        $('div.font-element').removeClass('fainted');
        $('g.element').removeClassSVG('fainted');
        $('g.link').removeClassSVG('fainted');
    };

    var removeHighlight4AllElements  = function() {
        $('div.font-element').removeClass('highlighted');
        $('g.element').removeClassSVG('highlighted');
        $('g.link').removeClassSVG('highlighted');
    };

    return NetworkingGraphView;
});