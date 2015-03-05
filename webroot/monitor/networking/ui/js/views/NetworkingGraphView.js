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
                generateElementsFn: getElements4ConnectedGraph(graphConfig, selectorId, connectedSelectorId)
            });

            var connectedGraphModel = new ContrailGraphModel(connectedGraphConfig);

            var connectedGraphView = new GraphView({
                el: $(connectedSelectorId),
                model: connectedGraphModel
            });

            connectedGraphModel.fetchData(function (directedGraphSize) {
                $(selectorId).parent().find('.graph-loading').remove(); // TODO - move class name to constants

                connectedGraphView.setDimensions((($(selectorId).width() > directedGraphSize.width) ? $(selectorId).width() : directedGraphSize.width) + GRAPH_MARGIN, directedGraphSize.height + GRAPH_MARGIN, 1);
                $(connectedSelectorId).data('actual-size', directedGraphSize);
                $(connectedSelectorId).data('offset', {x: 0, y: 0});

                var jointObject = {
                    connectedGraph: connectedGraphModel,
                    connectedPaper: connectedGraphView
                };

                $(selectorId).data('joint-object', jointObject);
                adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId);
                initNetworkingGraphControlEvents(selectorId, connectedSelectorId, configSelectorId);
                initConnectedGraphEvents(selectorId, connectedSelectorId, configSelectorId, jointObject)
            });
        },

        renderConfigGraph: function (graphConfig, configSelectorId) {
            var confGraphConfig = $.extend(true, {}, graphConfig, {
                forceFit: false,
                generateElementsFn: getElements4ConfigGraph
            });

            var configGraphModel = new ContrailGraphModel(confGraphConfig);

            var configGraphView = new GraphView({
                el: $(configSelectorId),
                model: configGraphModel,
                width: 150
            });

            configGraphModel.fetchData(function () {});
        }
    });

    var getElements4ConnectedGraph = function (graphconfig, selectorId, connectedSelectorId) {
        var focusedElement = graphconfig.focusedElement,
            fqName = graphconfig.elementNameObject.fqName;

        return function (response, elementMap) {

            var connectedElements = [],
                zoomedElements = [],
                nodes = response['nodes'],
                links = response['links'],
                zoomedNode = null;

            if(focusedElement == 'Project') {
                createNodeElements(nodes, connectedElements, elementMap);
            } else {
                var zoomedNodeKey = null,
                    zoomedNodeElement = null,
                    options = null;

                $.each(nodes, function(nodeKey, nodeValue) {
                    if (nodeValue.name == fqName) {
                        zoomedNode = nodeValue;
                        zoomedNodeKey = nodeKey;

                        options = getZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);

                        zoomedNodeElement = createCloudZoomedNodeElement(zoomedNode, {
                            width: options['widthZoomedElement'],
                            height: options['heightZoomedElement']
                        });

                        connectedElements.push(zoomedNodeElement);
                        elementMap.node[fqName] = zoomedNodeElement.id;

                        generateVMGraph(zoomedElements, zoomedNodeElement, options);
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
                zoomedElements: zoomedElements
            };
        };
    };

    var generateVMGraph = function(zoomedElements, zoomedNodeElement, options){
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = zoomedNodeElement['attributes']['position']['x'] + vmMargin / 2 + 30,
            yOrigin = zoomedNodeElement['attributes']['position']['y'] + vmMargin / 2 + 30;

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
                    srcVNDetails: srcVNDetails
                }
            };
            element = new ContrailElement(nodeType, options);
            return element;
        };

        return zoomedElements;
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

    var initNetworkingGraphControlEvents = function(selectorId, connectedSelectorId, configSelectorId) {
        var graphControlElement = $(selectorId).find('.graph-controls');

        /* Pan and Zoom events */
        $(connectedSelectorId).panzoom({
            $zoomIn: graphControlElement.find(".zoom-in"),
            $zoomOut: graphControlElement.find(".zoom-out"),
            $reset: graphControlElement.find(".zoom-reset")
        });

        /* Resize Events */
        graphControlElement.find('.resize').on('click', function(event) {
            $(this).find('i').toggleClass('icon-resize-full').toggleClass('icon-resize-small');
            adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId);
        });
    };

    var initConnectedGraphEvents = function(selectorId, connectedSelectorId, configSelectorId, jointObject) {

        /* Hover/mouseover/mouseout Events */

        /* Single (Left) Click Events */
        var tooltipConfig = getTooltipConfig();

        $.each(tooltipConfig, function (keyConfig, valueConfig) {
            $('g.' + keyConfig).popover('destroy');
            $('g.' + keyConfig).popover({
                trigger: 'click',
                html: true,
                delay: {show: 200, hide: 0},
                placement: function (context, src) {
                    $(context).addClass('popover-tooltip');

                    var srcOffset = $(src).offset(),
                        bodyWidth = $('body').width();

                    if (srcOffset.left > (bodyWidth / 2)) {
                        return 'left';
                    } else {
                        return 'right';
                    }
                },
                title: function () {
                    return valueConfig.title($(this), jointObject);
                },
                content: function () {
                    return valueConfig.content($(this), jointObject);
                },
                container: $('body')
            });
        });

        jointObject.connectedPaper.on('blank:pointerclick', function (evt, x, y) {
            $('g').popover('hide');
        });

        /* Double Click Events */

        jointObject.connectedPaper.on("cell:pointerdblclick", function (cellView, evt, x, y) {
            var dblClickedElement = cellView.model,
                elementType = dblClickedElement['attributes']['type'];
                //elementMap = params.data.elementMap;
            switch (elementType) {
                case 'contrail.VirtualNetwork':
                    loadFeature({p: 'mon_networking_networks',
                        q: {
                            fqName: dblClickedElement['attributes']['nodeDetails']['name'],
                            view: 'details',
                            type: 'network'
                        }
                    });
                    $('g.VirtualNetwork').popover('hide');
                    break;
                //case 'link': // TODO
                //    var modelId = dblClickedElement.id;
                //
                //    var graph = jointObject.connectedGraph,
                //        targetElement = graph.getCell(elementMap.node[dblClickedElement['attributes']['linkDetails']['dst']]),
                //        sourceElement = graph.getCell(elementMap.node[dblClickedElement['attributes']['linkDetails']['src']]);
                //
                //    if (targetElement && sourceElement) {
                //        highlightElementsToFaint([
                //            $(selectorId + '-connected-elements').find('div.font-element')
                //        ]);
                //
                //        highlightSVGElementsToFaint([
                //            $(selectorId + '-connected-elements').find('g.element'),
                //            $(selectorId + '-connected-elements').find('g.link')
                //        ]);
                //
                //        $('g.link[model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
                //
                //        loadVisualizationTab({
                //            container: '#topology-visualization-tabs',
                //            type: "connected-network",
                //            context: "connected-nw",
                //            sourceElement: sourceElement,
                //            targetElement: targetElement,
                //            fqName: targetElement['attributes']['nodeDetails']['name'],
                //            selfElement: dblClickedElement
                //        });
                //    }
                //    break;
                case 'contrail.VirtualMachine':
                    var srcVN = dblClickedElement.attributes.nodeDetails.srcVNDetails.name;
                    loadFeature({
                        p: 'mon_networking_instances',
                        q: {
                            uuid: dblClickedElement['attributes']['nodeDetails']['fqName'],
                            vn: srcVN,
                            type: 'instance',
                            view: 'details'
                        }
                    });
                    $('g.VirtualMachine').popover('hide');
                    break;

            }

        });

        /* Single (Right) Click (contextmenu) Events */
        var contextMenuConfig = getContextMenuConfig();

        $.contextMenu('destroy', 'g');
        $.contextMenu({
            selector: 'g',
            position: function (opt, x, y) {
                opt.$menu.css({top: y + 5, left: x + 5});
            },
            build: function ($trigger, e) {
                if (!$trigger.hasClassSVG('element') && !$trigger.hasClassSVG('link')) {
                    $trigger = $trigger.parentsSVG('g.element');
                    if ($trigger.length > 0) {
                        $trigger = $($trigger[0]);
                    }
                }
                var contextMenuItems = false;
                if (contrail.checkIfExist($trigger)) {
                    $.each(contextMenuConfig, function (keyConfig, valueConfig) {
                        if ($trigger.hasClassSVG(keyConfig)) {
                            contextMenuItems = valueConfig($trigger, jointObject);
                            $('g.' + keyConfig).popover('hide');
                            return false;
                        }
                    });
                }
                return contextMenuItems;
            }
        });
    };

    var getContextMenuConfig = function() {
        return {
            VirtualNetwork: function (element, jointObject) {
                var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                    jointElementFullName = viewElement.attributes.nodeDetails['name'].split(':'),
                    items = {
                        configure: {
                            name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Virtual Network</span>',
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_vn'});
                            }
                        }
                    };

                if (!$(element).hasClassSVG('ZoomedElement')) {
                    items.view = {
                        name: '<i class="icon-external-link"></i><span class="margin-0-5">View Virtual Network</span>',
                        callback: function (key, options) {
                            loadFeature({p: 'mon_networking_networks',
                                q: {
                                    fqName: viewElement['attributes']['nodeDetails']['name'],
                                    view: 'details',
                                    type: 'network'
                                }
                            });
                        }
                    };
                }

                return {items: items};
            },
            NetworkPolicy: function (element, jointObject) {
                var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                    jointElementFullName = viewElement.attributes.nodeDetails['fq_name'];
                return {
                    items: {
                        configure: {
                            name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Network Policy</span>',
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_policies'});
                            }
                        }
                    }
                };
            },
            SecurityGroup: function (element, jointObject) {
                var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                    jointElementFullName = viewElement.attributes.nodeDetails['fq_name'];
                return {
                    items: {
                        configure: {
                            name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Security Group</span>',
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_sg'});
                            }
                        }
                    }
                };
            },
            NetworkIPAM: function (element, jointObject) {
                var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                    jointElementFullName = viewElement.attributes.nodeDetails['fq_name'];
                return {
                    items: {
                        configure: {
                            name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Network IPAM</span>',
                            callback: function (key, options) {
                                loadFeature({p: 'config_net_ipam'});
                            }
                        }
                    }
                };
            },
            ServiceInstance: function (element, jointObject) {
                var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                    jointElementFullName = viewElement.attributes.nodeDetails['name'].split(':');
                return {
                    items: {
                        configure: {
                            name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Service Instances</span>',
                            callback: function (key, options) {
                                loadFeature({p: 'config_sc_svcInstances'});
                            }
                        }
                    }
                };
            },
            link: function (element, jointObject) {
                var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                    viewElementDetails = viewElement.attributes.linkDetails,
                    sourceName = viewElementDetails['src'].split(':')[2],
                    targetName = viewElementDetails['dst'].split(':')[2];

                var viewListMenu = {
                    items: {
                        trafficFromSource2Target: {
                            name: '<i class="icon-long-arrow-right"></i><span class="margin-0-5">View Traffic from ' + sourceName + ' to ' + targetName + '</span>',
                            callback: function (key, options) {
                                loadFeature({
                                    p: 'mon_networking_networks',
                                    q: {fqName: viewElementDetails['dst'], srcVN: viewElementDetails['src']}
                                });
                            }
                        }
                    }
                };

                if (viewElementDetails.dir == 'bi') {
                    viewListMenu.items.trafficFromTarget2Source = {
                        name: '<i class="icon-long-arrow-left"></i><span class="margin-0-5">View Traffic from ' + targetName + ' to ' + sourceName + '</span>',
                        callback: function (key, options) {
                            loadFeature({
                                p: 'mon_networking_networks',
                                q: {fqName: viewElementDetails['src'], srcVN: viewElementDetails['dst']}
                            });
                        }
                    };
                }

                return viewListMenu;
            }
        };
    };

    var getTooltipConfig = function() {
        return {
            PhysicalRouter: {
                title: function (element, jointObject) {
                    return 'Physical Router';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('prouter-tooltip-content-template');

                    return tooltipContent([{lbl: 'Name', value: viewElement.attributes.prouterDetails['name']},
                        {lbl: 'Links', value: viewElement.attributes.prouterDetails.connected_prouters}]);

                }
            },
            VirtualRouter: {
                title: function (element, jointObject) {
                    return 'Virtual Router';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('vrouter-tooltip-content-template');

                    return tooltipContent([{lbl: 'Name', value: viewElement.attributes.vrouterDetails['name']},
                        {lbl: 'Links', value: viewElement.attributes.vrouterDetails.connected_vrouters}]);

                }
            },
            VirtualNetwork: {
                title: function (element, jointObject) {
                    return 'Virtual Network';
                    return;
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('tooltip-content-template'),
                        virtualNetworkName = viewElement.attributes.nodeDetails['name'].split(':');

                    return tooltipContent([{lbl: 'Name', value: virtualNetworkName[2]},
                        {lbl: 'Project', value: virtualNetworkName[0] + ':' + virtualNetworkName[1]},
                        {
                            lbl: 'In',
                            value: formatNumberByCommas(viewElement.attributes.nodeDetails.more_attr.in_tpkts) + ' packets / ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.in_bytes)
                        },
                        {
                            lbl: 'Out',
                            value: formatNumberByCommas(viewElement.attributes.nodeDetails.more_attr.out_tpkts) + ' packets / ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.out_bytes)
                        },
                        {lbl: 'Instance Count', value: viewElement.attributes.nodeDetails.more_attr.vm_cnt}]);

                }
            },
            NetworkPolicy: {
                title: function (element, jointObject) {
                    return 'Network Policy';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                    return tooltipContent([
                        {lbl: 'Name', value: viewElement.attributes.nodeDetails['fq_name'][2]},
                        {
                            lbl: 'Project',
                            value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                        }
                    ]);
                }
            },
            SecurityGroup: {
                title: function (element, jointObject) {
                    return 'Security Group';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                    return tooltipContent([
                        {lbl: 'Name', value: viewElement.attributes.nodeDetails['fq_name'][2]},
                        {
                            lbl: 'Project',
                            value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                        }
                    ]);
                }
            },
            NetworkIPAM: {
                title: function (element, jointObject) {
                    return 'Network IPAM';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.configGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                    return tooltipContent([
                        {lbl: 'Name', value: viewElement.attributes.nodeDetails['fq_name'][2]},
                        {
                            lbl: 'Project',
                            value: viewElement.attributes.nodeDetails['fq_name'][0] + ':' + viewElement.attributes.nodeDetails['fq_name'][1]
                        }
                    ]);
                }
            },
            ServiceInstance: {
                title: function (element, jointObject) {
                    return 'Service Instance';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                    return tooltipContent([
                        {lbl: 'Name', value: viewElement.attributes.nodeDetails['name']},
                        {lbl: 'Status', value: viewElement.attributes.nodeDetails['status']}
                    ]);
                }
            },
            VirtualMachine: {
                title: function (element, jointObject) {
                    return 'Virtual Machine';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                    return tooltipContent([
                        {lbl: 'UUID', value: viewElement.attributes.nodeDetails['fqName']},
                    ]);
                }
            },
            link: {
                title: function (element, jointObject) {
                    return 'Traffic Details';
                },
                content: function (element, jointObject) {
                    var viewElement = jointObject.connectedGraph.getCell(element.attr('model-id')),
                        tooltipContent = contrail.getTemplate4Id('tooltip-content-template'),
                        viewElementDetails = viewElement.attributes.linkDetails;

                    var data = [],
                        partial_msg = "";
                    if (viewElementDetails.error == 'Other link marked as unidirectional, attach policy' || viewElementDetails.error == "Other link marked as bidirectional, attach policy")
                        partial_msg = "Link partially connected";
                    if (viewElementDetails.more_attributes != undefined && viewElementDetails.more_attributes.in_stats != undefined
                        && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.out_stats.length > 0
                        && viewElementDetails.more_attributes.in_stats.length > 0) {
                        var in_stats = viewElementDetails.more_attributes.in_stats;
                        var out_stats = viewElementDetails.more_attributes.out_stats;
                        var src = viewElementDetails.src;
                        var dst = viewElementDetails.dst;
                        var loss = viewElementDetails.loss;
                        /*if(loss.diff && loss.loss_percent>0) commented the percentage loss code for while
                         data.push({lbl:"Link",value:"Packet Loss % "+loss.loss_percent});
                         else*/
                        if (partial_msg != "")
                            data.push({lbl: "", value: partial_msg});
                        for (var i = 0; i < in_stats.length; i++) {
                            if (src == in_stats[i].src && dst == in_stats[i].dst) {
                                data.push({
                                    lbl: "Link",
                                    value: in_stats[i].src.split(':').pop() + " --- " + in_stats[i].dst.split(':').pop()
                                });
                                data.push({
                                    lbl: "In",
                                    value: formatNumberByCommas(in_stats[i].pkts) + " packets / " + formatBytes(in_stats[i].bytes)
                                });
                                for (var j = 0; j < out_stats.length; j++) {
                                    if (src == out_stats[j].src && dst == out_stats[j].dst) {
                                        data.push({
                                            lbl: "Out",
                                            value: formatNumberByCommas(out_stats[j].pkts) + " packets / " + formatBytes(out_stats[i].bytes)
                                        });
                                    }
                                }
                            } else if (src == in_stats[i].dst && dst == in_stats[i].src) {
                                data.push({
                                    lbl: "Link",
                                    value: in_stats[i].src.split(':').pop() + " --- " + in_stats[i].dst.split(':').pop(),
                                    dividerClass: 'margin-5-0-0'
                                });
                                data.push({
                                    lbl: "In",
                                    value: formatNumberByCommas(in_stats[i].pkts) + " packets / " + formatBytes(in_stats[i].bytes)
                                });
                                for (var j = 0; j < out_stats.length; j++) {
                                    if (src == out_stats[j].dst && dst == out_stats[j].src) {
                                        data.push({
                                            lbl: "Out",
                                            value: formatNumberByCommas(out_stats[j].pkts) + " packets / " + formatBytes(out_stats[i].bytes)
                                        });
                                    }
                                }
                            }
                        }
                    } else if (viewElementDetails.more_attributes == undefined || viewElementDetails.more_attributes.in_stats == undefined
                        || viewElementDetails.more_attributes.out_stats == undefined) {
                        var src = viewElementDetails.src.split(':').pop();
                        var dst = viewElementDetails.dst.split(':').pop();
                        if (partial_msg != "")
                            data.push({lbl: "", value: partial_msg});

                        data.push({lbl: "Link", value: src + " --- " + dst});
                        data.push({lbl: "In", value: "0 packets / 0 B"});
                        data.push({lbl: "Out", value: "0 packets / 0 B"});

                        if (viewElementDetails.dir == 'bi') {
                            data.push({lbl: "Link", value: dst + " --- " + src, dividerClass: 'margin-5-0-0'});
                            data.push({lbl: "In", value: "0 packets / 0 B"});
                            data.push({lbl: "Out", value: "0 packets / 0 B"});
                        }
                    } else if (viewElementDetails.more_attributes != undefined && viewElementDetails.more_attributes.in_stats != undefined
                        && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.in_stats.length == 0
                        && viewElementDetails.more_attributes.out_stats.length == 0) {
                        var src = viewElementDetails.src.split(':').pop();
                        var dst = viewElementDetails.dst.split(':').pop();
                        if (partial_msg != "")
                            data.push({lbl: "", value: partial_msg});

                        data.push({lbl: "Link", value: src + " --- " + dst});
                        data.push({lbl: "In", value: "0 packets / 0 B"});
                        data.push({lbl: "Out", value: "0 packets / 0 B"});

                        if (viewElementDetails.dir == 'bi') {
                            data.push({lbl: "Link", value: dst + " --- " + src, dividerClass: 'margin-5-0-0'});
                            data.push({lbl: "In", value: "0 packets / 0 B"});
                            data.push({lbl: "Out", value: "0 packets / 0 B"});
                        }
                    }

                    return tooltipContent(data);
                }
            }
        };
    };

    return NetworkingGraphView;
});