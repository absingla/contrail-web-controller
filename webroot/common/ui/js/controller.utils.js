/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'monitor/networking/ui/js/views/NetworkingGraphView',
    'monitor/networking/ui/js/views/ProjectTabView',
    'monitor/networking/ui/js/views/NetworkTabView',
    'monitor/networking/ui/js/views/NetworkGridView',
    'monitor/networking/ui/js/views/InstanceTabView',
    'monitor/networking/ui/js/views/InstanceGridView',
    'monitor/networking/ui/js/views/ProjectGridView',
    'monitor/networking/ui/js/views/FlowGridView',
    'monitor/networking/ui/js/views/NetworkListView',
    'monitor/networking/ui/js/views/ProjectListView',
    'monitor/networking/ui/js/views/InstanceListView',
    'monitor/networking/ui/js/views/FlowListView'
], function (_, NetworkingGraphView, ProjectTabView, NetworkTabView, NetworkGridView, InstanceTabView, InstanceGridView,
             ProjectGridView, FlowGridView, NetworkListView, ProjectListView, InstanceListView, FlowListView) {

    var CTUtils = function () {
        var self = this;

        self.initPortDistributionCharts = function (data) {
            var chartsTemplate = contrail.getTemplate4Id('port-distribution-charts-template');
            var networkChart, chartSelector;
            if ((data['chartType'] == null) && ($.inArray(ifNull(data['context'], ''), ['domain', 'network', 'connected-nw', 'project', 'instance']) > -1)) {
                networkChart = true;
                chartSelector = '.port-distribution-chart';
            } else {
                networkChart = false;
                chartSelector = '.port-distribution-chart';
            }
            $(this).html(chartsTemplate(data));
            if (networkChart == true) {
                //Add durationStr
                $.each(data['d'], function (idx, obj) {
                    if (ifNull(obj['duration'], true)) {
                        if (obj['title'].indexOf('(') < 0)
                            obj['title'] += durationStr;
                    }
                });
                //Set the chart height to parent height - title height
            }
            //$(this).find('.stack-chart').setAvblSize();
            var charts = $(this).find(chartSelector);
            $.each(charts, function (idx, chart) {
                //Bind the function to pass on the context of url & objectType to schema parse function
                var chartData = data['d'][idx];
                var chartType = ifNull(chartData['chartType'], '');
                var fields;
                var objectType = chartData['objectType'];
                //Load asynchronously
                initDeferred($.extend({}, chartData, {selector: $(this), renderFn: 'initScatterChart'}));
                //If title is clickable
            });
        };

        self.renderView = function (viewName, parentElement, model, viewAttributes) {
            var elementView;

            switch (viewName) {
                case "NetworkingGraphView":
                    elementView = new NetworkingGraphView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "ProjectListView":
                    elementView = new ProjectListView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "ProjectGridView":
                    elementView = new ProjectGridView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "ProjectTabView":
                    elementView = new ProjectTabView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "NetworkListView":
                    elementView = new NetworkListView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "NetworkTabView":
                    elementView = new NetworkTabView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "NetworkGridView":
                    elementView = new NetworkGridView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "InstanceListView":
                    elementView = new InstanceListView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "InstanceTabView":
                    elementView = new InstanceTabView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "InstanceGridView":
                    elementView = new InstanceGridView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "FlowListView":
                    elementView = new FlowListView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;

                case "FlowGridView":
                    elementView = new FlowGridView({ el: parentElement, model: model, attributes: viewAttributes });
                    elementView.render();
                    break;
            }
        };
    }

    return CTUtils;
});
