/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
], function (_, Backbone, ContrailListModel, Knockback, ContrailView,
             RoutingPolicyFormatter) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var prefixId = ctwl.ROUTING_POLICY_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM),
        externalGatewayDS = [],
        popupData = [];

    var RoutingPolicyEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderRoutingPolicyPopup: function (options) {
            var editLayout = editTemplate(
                {modalId: modalId, prefixId: prefixId}),
                self = this;
            var footer = [];
            footer.push({
                id: 'cancelBtn',
                title: 'Cancel',
                onclick: function () {
                    Knockback.release(self.model, document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal('hide');
                },
                onKeyupEsc: true
            });
            footer.push({
                className: 'btn-primary btnSave',
                title: (options['btnName']) ? options['btnName'] : 'Save',
                onclick: function () {
                    self.model.configureRoutingPolicy(options['mode'],
                        popupData,
                        {
                            init: function () {
                                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                    false);
                                cowu.enableModalLoading(modalId);
                            },
                            success: function () {
                                options['callback']();
                                $("#" + modalId).modal('hide');
                            },
                            error: function (error) {
                                cowu.disableModalLoading(modalId, function () {
                                    self.model.showErrorAttr(
                                        prefixId + cowc.FORM_SUFFIX_ID,
                                        error.responseText);
                                });
                            }
                        });
                }
            });
            cowu.createModal(
                {
                    'modalId': modalId,
                    className: 'modal-700',
                    'title': options['title'],
                    'body': editLayout,
                    'footer': footer
                });
            var disableElement = false
            if (options['mode'] == "edit") {
                disableElement = true;
            }
            self.renderView4Config(
                $("#" + modalId).find("#" + modalId + "-form"),
                self.model, getConfigureViewConfig
                (disableElement),
                'routingPolicyValidations', null, null, function () {
                    self.model.showErrorAttr(prefixId +
                        cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                    kbValidation.bind(self, {
                        collection: self.model.model().attributes.termCollection
                    });
                });
            return;
        },
        renderDeleteRoutingPolicy: function (options) {
            var selectedGridData = options['selectedGridData'],
                elId = 'deleteRoutingPoliciesID';
            var items = "";
            var rowIdxLen = selectedGridData.length;
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    selectedGridData[i].name;
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delTemplate =
                    contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({
                prefixId: prefixId,
                item: ctwl.TXT_ROUTING_POLICY,
                itemId: items
            })
            cowu.createModal({
                'modalId': modalId, 'className': 'modal-980',
                'title': options['title'], 'btnName': 'Confirm',
                'body': delLayout, 'onSave': function () {
                    self.model.deleteRoutingPolicy(selectedGridData, {
                        init: function () {
                            self.model.showErrorAttr(elId, false);
                            cowu.enableModalLoading(modalId);
                        },
                        success: function () {
                            options['callback']();
                            $("#" + modalId).modal('hide');
                        },
                        error: function (error) {
                            cowu.disableModalLoading(modalId, function () {
                                self.model.showErrorAttr(elId, error.responseText);
                            });
                        }
                    });
                }, 'onCancel': function () {
                    Knockback.release(self.model, document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal('hide');
                }
            });
            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model,
                document.getElementById(modalId));
            kbValidation.bind(this);
        }
    });

    getConfigureViewConfig = function (isDisable) {
        return {
            elementId: cowu.formatElementId(
                [prefixId, ctwl.TITLE_ROUTING_POLICY_EDIT]),
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'routingPolicyname',
                        view: "FormInputView",
                        viewConfig: {
                            class: "span12",
                            placeholder: "Routing Policy Name",
                            disabled: isDisable,
                            path: 'routingPolicyname',
                            label: 'Name',
                            dataBindValue: 'routingPolicyname'
                        }
                    }]
                }, {
                    columns: [{
                        elementId: 'term-collection',
                        view: "FormCollectionView",
                        viewConfig: {
                            collection: 'termCollection()',
                            templateId: 'query-routing-policy-terms-template',
                            label: "Terms",
                            //path: "termCollection",
                            //validation: 'termValidation',
                            accordionable: true,
                            accordionConfig: {
                                header: '.or-clause-header'
                            },
                            rowActions: [
                                {
                                    onClick: 'addTermAtIndex()', iconClass: 'icon-plus',
                                    viewConfig: {width: 20}
                                },
                                {
                                    onClick: "deleteTerm()", iconClass: 'icon-remove',
                                    viewConfig: {width: 20}
                                }
                            ],
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: 'from-collection',
                                            view: "FormCollectionView",
                                            viewConfig: {
                                                label: 'From',
                                                collection: 'from_terms()',
                                                rows: [
                                                    {
                                                        rowActions: [
                                                            {
                                                                onClick: "deleteFromTerm()", iconClass: 'icon-remove',
                                                                viewConfig: {width: 20}
                                                            },
                                                            {
                                                                onClick: "addFromTermAtIndex()", iconClass: 'icon-plus',
                                                                viewConfig: {width: 20}
                                                            }
                                                        ],
                                                        columns: [
                                                            {
                                                                elementId: 'name',
                                                                name: 'Name',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "name",
                                                                    dataBindValue: "name",
                                                                    dataBindOptionList: 'getNameOptionList',
                                                                    width: 145,
                                                                    elementConfig: {
                                                                        placeholder: 'Select Name',
                                                                        defaultValueId: 0
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'value',
                                                                name: 'value',
                                                                view: "FormInputView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                    path: "value",
                                                                    dataBindValue: "value()",
                                                                    width: 285,
                                                                    elementConfig: {
                                                                        placeholder: 'Select Value'
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'prefix_condition',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "prefix_condition",
                                                                    visible: 'name() == "prefix"',
                                                                    dataBindValue: "prefix_condition",
                                                                    dataBindOptionList: 'getPrefixConditionOptionList',
                                                                    width: 80,
                                                                    elementConfig: {
                                                                        placeholder: 'Select prefix_condition',
                                                                        defaultValueId: 0
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                },
                                {
                                    columns: [
                                        {
                                            elementId: 'then-collection',
                                            view: "FormCollectionView",
                                            viewConfig: {
                                                label: 'Then',
                                                collection: 'then_terms()',
                                                rows: [
                                                    {
                                                        rowActions: [
                                                            {
                                                                onClick: "deleteThenTerm()", iconClass: 'icon-remove',
                                                                viewConfig: {width: 20}
                                                            },
                                                            {
                                                                onClick: "addThenTermAtIndex()", iconClass: 'icon-plus',
                                                                viewConfig: {width: 20}
                                                            }
                                                        ],
                                                        columns: [
                                                            {
                                                                elementId: 'name',
                                                                name: 'Name',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "name",
                                                                    dataBindValue: "name",
                                                                    dataBindOptionList: 'getNameOptionList',
                                                                    width: 145,
                                                                    elementConfig: {
                                                                        placeholder: 'Select Name',
                                                                        //defaultValueId: 0
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'value',
                                                                name: 'value',
                                                                view: "FormInputView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                    path: "value",
                                                                    disabled: 'name() == "action"',
                                                                    dataBindValue: "value()",
                                                                    width: 285,
                                                                    elementConfig: {
                                                                        placeholder: 'Select Value'
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'action_condition',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "action_condition",
                                                                    visible: 'name() == "action"',
                                                                    dataBindValue: "action_condition",
                                                                    dataBindOptionList: 'getActionConditionOptionList',
                                                                    width: 80,
                                                                    elementConfig: {
                                                                        placeholder: 'Select action_condition',
                                                                        defaultValueId: 0
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]

                        }
                        //viewConfig: {
                        //    width: "100%",
                        //    class: "",
                        //     verticalAlign :"top",
                        //    label:"Terms",
                        //    path: "termCollection",
                        //    validation: 'termValidation',
                        //    collection: "termCollection",
                        //    columns: [{
                        //        elementId: 'fromValue',
                        //        name: 'From',
                        //        view: "FormTextAreaView",
                        //        showEditIcon: false,
                        //        viewConfig: {
                        //            width: 300,
                        //            rows:2,
                        //            verticalAlign :"top",
                        //            placeHolder:
                        //            "[community <value>]<enter>\n[prefix <value> [exact|longer|orlonger]]",
                        //            templateId:
                        //                cowc.TMPL_EDITABLE_GRID_TEXTAREA_VIEW,
                        //            path: "fromValue",
                        //            dataBindValue: "fromValue()"
                        //        }
                        //    },
                        //    {
                        //        elementId: 'thenValue',
                        //        view: "FormTextAreaView",
                        //        name: "Then",
                        //        class: "",
                        //        showEditIcon: false,
                        //        viewConfig: {
                        //            width: 400,
                        //            rows:2,
                        //            verticalAlign :"top",
                        //            placeHolder:
                        //                "[add|set|remove community <value1>[,value2,valuen]]<enter>\n[local-pref <value>]",
                        //            templateId:
                        //                cowc.TMPL_EDITABLE_GRID_TEXTAREA_VIEW,
                        //            path: "thenValue",
                        //            dataBindValue: "thenValue()"
                        //        }
                        //    },
                        //    {
                        //        elementId: 'action',
                        //        name: 'Action',
                        //        view: "FormDropdownView",
                        //        class: "",
                        //        viewConfig: {
                        //            width: 100,
                        //            verticalAlign :"top",
                        //            templateId:
                        //                cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                        //            path: "action",
                        //            placeHolder:"Action",
                        //            dataBindValue: "action()",
                        //            elementConfig:{
                        //                data:['Default','Reject','Accept','Next']
                        //            }
                        //        }
                        //    }],
                        //    rowActions: [
                        //        {onClick:
                        //        "function() { $root.deleteRules($data, this); }",
                        //         verticalAlign :"top",
                        //         iconClass: 'icon-minus'
                        //        }
                        //    ],
                        //    gridActions: [
                        //        {onClick: "function() { addRule(); }",
                        //         buttonTitle: "Add Term"}
                        //    ]
                        //}
                    }]
                }]
            }
        }
    }
    return RoutingPolicyEditView;
});