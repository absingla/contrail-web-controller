/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'contrail-model',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
    'config/networking/routingpolicy/ui/js/models/routingPolicyTermFromModel',
    'config/networking/routingpolicy/ui/js/models/routingPolicyTermThenModel'
], function (_, Knockout, ContrailModel, RoutingPolicyFormatter, routingPolicyTermFromModel, routingPolicyTermThenModel) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var RoutingPolicyTermModel = ContrailModel.extend({
        defaultConfig: {
            "fromValue": "",
            "thenValue": "",
            "disabled_from_names": {}
        },

        constructor: function (parentModel, modelData) {
            this.parentModel = parentModel;
            ContrailModel.prototype.constructor.call(this, modelData);
            return this;
        },

        formatModelConfig: function (config) {
            var self = this,
                modelConfig = $.extend({}, true, config),
                routingPolicyTermFromModels = [], routingPolicyTermThenModels = [],
                routingPolicyTermFromCollectionModel, routingPolicyTermThenCollectionModel;

            routingPolicyTermFromModels.push(new routingPolicyTermFromModel(self, {name: 'community'}));
            routingPolicyTermThenModels.push(new routingPolicyTermThenModel(self, {}));

            routingPolicyTermFromCollectionModel = new Backbone.Collection(routingPolicyTermFromModels);
            routingPolicyTermThenCollectionModel = new Backbone.Collection(routingPolicyTermThenModels);

            modelConfig['from_terms'] = routingPolicyTermFromCollectionModel;
            modelConfig['then_terms'] = routingPolicyTermThenCollectionModel;

            var community = getValueByJsonPath(modelConfig, "from;community", ""),
                prefix = getValueByJsonPath(modelConfig, "from;prefix;prefix", "");

            if (community != "" || prefix != "") {
                modelConfig["fromValue"] = routingPolicyFormatter.fromObjToStr(modelConfig["from"]);
            }

            var thenComm = getValueByJsonPath(modelConfig, "then;update;community", ""),
                localpref = getValueByJsonPath(modelConfig, "then;update;local-pref", "");

            if (thenComm != "" || localpref != "") {
                modelConfig["thenValue"] = routingPolicyFormatter.thenObjToStr(modelConfig["then"]["update"]);
            }
            return modelConfig;
        },
        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },

        getOrClauseText: function (data) {
            var fromTerms = data.from_terms()(),
                thenTerms = data.then_terms()(),
                fromTermArray = [], thenTermArray = [], termsText = '';

            $.each(fromTerms, function (fromTermKey, fromTermValue) {
                var name = fromTermValue.name(),
                    value = fromTermValue.value(),
                    prefixCondition = fromTermValue.prefix_condition(),
                    fromTermStr = '';

                name = contrail.checkIfFunction(name) ? name() : name;
                value = contrail.checkIfFunction(value) ? value() : value;
                prefixCondition = contrail.checkIfFunction(prefixCondition) ? prefixCondition() : prefixCondition;

                if (value != '') {
                    fromTermStr = name + ' ' + value;
                    if (name == 'prefix') {
                        fromTermStr += ' ' + prefixCondition;
                    }

                    fromTermArray.push(fromTermStr)
                }
            });

            $.each(thenTerms, function (thenTermKey, thenTermValue) {
                var name = thenTermValue.name(),
                    value = thenTermValue.value(),
                    actionCondition = thenTermValue.action_condition(),
                    thenTermStr = '';

                name = contrail.checkIfFunction(name) ? name() : name;
                value = contrail.checkIfFunction(value) ? value() : value;
                actionCondition = contrail.checkIfFunction(actionCondition) ? actionCondition() : actionCondition;

                if (value != '') {
                    thenTermStr = name + ' ' + value;
                    if (name == 'action') {
                        thenTermStr += ' ' + actionCondition;
                    }

                    thenTermArray.push(thenTermStr);
                }
            });

            termsText += 'from: { ' + fromTermArray.join(', ') + ' } ';
            termsText += 'then: { ' + thenTermArray.join(', ') + ' } ';

            return (termsText !== '') ? termsText : '...';
        },

        addTermAtIndex: function (data, event) {
            var self = this,
                orClauses = this.model().collection,
                orClause = this.model(),
                orClauseIndex = _.indexOf(orClauses.models, orClause),
                newOrClause = new RoutingPolicyTermModel(self.parentModel(), {});

            orClauses.add(newOrClause, {at: orClauseIndex + 1});

            $(event.target).parents('.collection').accordion('refresh');
            $(event.target).parents('.collection').accordion("option", "active", orClauseIndex + 1);

            event.stopImmediatePropagation();
        },

        deleteTerm: function () {
            var orClauses = this.model().collection,
                orClause = this.model();

            if (orClauses.length > 1) {
                orClauses.remove(orClause);
            }
        },

        validations: {
            termValidation: {
                //TODO: Add appropriate validations.
                /*
                'fromValue': function (value, attr, finalObj) {
                    if (value.trim() != "") {
                        var result =
                            routingPolicyFormatter.buildFromStructure(value);
                        if (result.error.available == true) {
                            return result.error.message;
                        }
                    }
                },
                'thenValue': function (value, attr, finalObj) {
                    if (value.trim() != "") {
                        var result =
                            routingPolicyFormatter.buildThenStructure(value);
                        if (result.error.available == true) {
                            return result.error.message;
                        }
                    }
                }
                */
            }
        }
    });
    return RoutingPolicyTermModel;
});