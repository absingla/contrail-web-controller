/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var FormRecordDetailsTabView = ContrailView.extend({
        render: function (renderConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryPrefix = cowc.FS_QUERY_PREFIX,
                modalId = queryPrefix + cowl.QE_RECORD_DETAILS_MODAL_SUFFIX,
                className = viewConfig['className'],
                queryFormAttributes = viewConfig['queryFormAttributes'],
                selectedFlowRecord = viewConfig['selectedFlowRecord'];

            cowu.createModal({
                'modalId': modalId,
                'className': className,
                'title': cowl.TITLE_FLOW_RECORD_DETAILS,
                'body': "<div id='" + modalId + "-body" + "'></div>",
                'onSave': function () {
                    $("#" + modalId).modal('hide');
                },
                'onCancel': function () {
                    $("#" + modalId).modal('hide');
                }
            });

            self.renderView4Config($("#" + modalId + "-body"), null, self.getFlowDetailsTabViewConfig(queryFormAttributes, selectedFlowRecord));
        },

        getFlowDetailsTabViewConfig: function (queryFormAttributes, selectedFlowRecord) {
            var flowClassPrefix = selectedFlowRecord['flow_class_id'],
                flowDetailsTabPrefix = cowl.QE_FLOW_DETAILS_TAB_ID + "-" + flowClassPrefix,
                flowDetailsGridPrefix = cowl.QE_FLOW_DETAILS_GRID_ID + "-" + flowClassPrefix;

            var viewConfig = {
                    elementId: flowDetailsTabPrefix,
                    view: "TabsView",
                    viewConfig: {
                        theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                        tabs: [
                            {
                                elementId: flowDetailsTabPrefix + "-ingress",
                                title: "Ingress",
                                view: "FlowDetailsView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                tabConfig: {
                                    activate: function (event, ui) {
                                        if ($("#" + flowDetailsTabPrefix + "-ingress").data('contrailGrid')) {
                                            $("#" + flowDetailsTabPrefix + "-ingress").data('contrailGrid').refreshView();
                                        }
                                    }
                                },
                                viewConfig: {
                                    formData: getQueryFormData(queryFormAttributes, selectedFlowRecord, "ingress"),
                                    flowDetailsGridId: flowDetailsGridPrefix + "-ingress"
                                }
                            },
                            {
                                elementId: flowDetailsTabPrefix + "-egress",
                                title: "Egress",
                                view: "FlowDetailsView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                tabConfig: {
                                    activate: function (event, ui) {
                                        if ($("#" + flowDetailsTabPrefix + "-egress").data('contrailGrid')) {
                                            $("#" + flowDetailsTabPrefix + "-egress").data('contrailGrid').refreshView();
                                        }
                                    }
                                },
                                viewConfig: {
                                    formData: getQueryFormData(queryFormAttributes, selectedFlowRecord, "egress"),
                                    flowDetailsGridId: flowDetailsGridPrefix + "-egress"
                                }
                            }
                        ]
                    }
                };

            return viewConfig;
        }
    });

    function getQueryFormData(queryFormAttributes, selectedFlowRecord, direction) {
        var newQueryFormAttributes = $.extend(true, {}, queryFormAttributes),
            appendWhereClause = "", newWhereClause = "",
            oldWhereClause = newQueryFormAttributes["where"],
            oldWhereArray;

        newQueryFormAttributes['direction'] = (direction == "ingress") ? "1" : "0";

        for (var key in selectedFlowRecord) {
            switch (key) {
                case "sourcevn":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : '';
                        appendWhereClause += "sourcevn = " + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord['sourceip'])) {
                            appendWhereClause += " AND sourceip = " + selectedFlowRecord["sourceip"];

                        }
                    }
                    break;

                case "destvn":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : '';
                        appendWhereClause += "destvn = " + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord['destip'])) {
                            appendWhereClause += " AND destip = " + selectedFlowRecord["destip"];

                        }
                    }
                    break;

                case "protocol":
                    if(contrail.checkIfExist(selectedFlowRecord[key])) {
                        appendWhereClause += appendWhereClause.length > 0 ? " AND " : '';
                        appendWhereClause += "protocol = " + selectedFlowRecord[key];

                        if(contrail.checkIfExist(selectedFlowRecord['sport'])) {
                            appendWhereClause += " AND sport = " + selectedFlowRecord["sport"];

                        }

                        if(contrail.checkIfExist(selectedFlowRecord['dport'])) {
                            appendWhereClause += " AND dport = " + selectedFlowRecord["dport"];

                        }
                    }
                    break;
            }

        }

        if(contrail.checkIfExist(oldWhereClause) && oldWhereClause != '') {
            oldWhereArray = oldWhereClause.split(" OR ");
            for(var i = 0; i < oldWhereArray.length; i++) {
                newWhereClause += newWhereClause.length > 0 ? " OR " : '';
                newWhereClause += "(" + oldWhereArray[i].substring(1, oldWhereArray[i].length - 1) + " AND " + appendWhereClause + ")"
            }

            newQueryFormAttributes["where"] = newWhereClause;

        } else {
            newQueryFormAttributes["where"] = "(" + appendWhereClause + ")";
        }

        return newQueryFormAttributes;
    }


    return FormRecordDetailsTabView;
});