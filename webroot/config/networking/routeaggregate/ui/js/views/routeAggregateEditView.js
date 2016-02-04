/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var prefixId = ctwc.ROUTE_AGGREGATE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var self;
    var routeAggregateEditView = ContrailView.extend({
        renderAddEditRouteAggregate: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId});
            self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                 'onSave': function () {
                        self.configEditRouteAggregate(options);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.routeAggregateRenderView4Config(options);
        },
        configEditRouteAggregate : function(options) {
            self.model.configRouteAggregate({
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 error.responseText);
                    });
                }
            }, options.mode === ctwl.CREATE_ACTION ? 'POST' : 'PUT');
        },
        routeAggregateRenderView4Config : function(options) {
            var disableFlag =
                (options.mode === ctwl.CREATE_ACTION) ?  false : true;
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                self.model,
                self.getRouteAggregateViewConfig(disableFlag),
                "configureValidation", null, null,
                function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                   kbValidation.bind(self);
                }
            );
        },
        renderDeleteRouteAggregate: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteRouteAggregates(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        },
        getRouteAggregateViewConfig : function(disableId) {
            var rtAggregateConfig = {
                elementId: cowu.formatElementId([prefixId,
                                   ctwl.TITLE_ADD_ROUTE_AGGREGATE]),
                title: ctwl.TITLE_ADD_ROUTE_AGGREGATE,
                view: "SectionView",
                viewConfig :{
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: "name",
                                    view: "FormInputView",
                                    viewConfig: {
                                        disabled: disableId,
                                        path: "name",
                                        dataBindValue: "name",
                                        label: "Name",
                                        class: "span6"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [{
                                elementId: "rt_aggregate_routes_accordian",
                                view: "AccordianView",
                                viewConfig: [{
                                    elementId: "rt_aggregate_routes_section",
                                    title: "Aggregate Route Entries",
                                    view: "SectionView",
                                    viewConfig: {
                                        rows: [{
                                            columns: [{
                                                elementId: "rt_aggregate_routes_editable_grid",
                                                view: "FormEditableGridView",
                                                    viewConfig: {
                                                        path: "routes",
                                                        collection: "routes",
                                                        columns: [{
                                                            elementId: "route",
                                                            name: "Route",
                                                            view: "FormInputView",
                                                            width: 350,
                                                            viewConfig: {
                                                                placeholder: "Enter Route",
                                                                width: 350,
                                                                path: "route",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                dataBindValue: "route()",
                                                            }
                                                        }],
                                                        rowActions: [
                                                            {
                                                                onClick: "function() {\
                                                                $root.deleteRoute($data, this)\
                                                                ;}",
                                                                iconClass: 'icon-minus'
                                                            }
                                                        ],
                                                        gridActions: [
                                                            {
                                                                onClick: "function() {\
                                                                addRoute(); }",
                                                                buttonTitle: "Route Entry"
                                                            }
                                                        ]
                                                    }
                                            }]}]
                                        }
                                    }]
                               }]
                        }
                    ]
                }
            };
            return rtAggregateConfig;

        }
    });

    return routeAggregateEditView;
});

