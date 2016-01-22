/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model'
], function (_, Backbone, Knockout, ContrailModel) {
    var RoutingPolicyTermThenModel = ContrailModel.extend({

        defaultConfig: {
            name: '',
            value : '',
            action_condition: ''
        },

        constructor: function (parentModel, modelData) {
            this.parentModel = parentModel;
            ContrailModel.prototype.constructor.call(this, modelData);
            return this;
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

        addThenTermAtIndex: function() {
            var self = this,
                thenTerms = self.model().collection,
                thenTerm = self.model(),
                thenTermIndex = _.indexOf(thenTerms.models, thenTerm),
                newThenTerm = new RoutingPolicyTermThenModel(self.parentModel(), {});

            if (thenTerms.length < 5) {

                thenTerms.add(newThenTerm, {at: thenTermIndex + 1});

            }
        },

        deleteThenTerm: function() {
            var thenTerms = this.model().collection,
                thenTerm = this.model();

            if (thenTerms.length > 1) {
                thenTerms.remove(thenTerm);
            }
        },

        getNameOptionList: function(viewModel) {
            var namesOption = ['add community','set community', 'remove community', 'local-perf', 'action'];

            return $.map(namesOption, function(optionValue, optionKey) {
                return {id: optionValue, text: optionValue}
            });
        },

        getActionConditionOptionList: function(viewModel) {
            return [
                {id: 'Default', text: 'Default'},
                {id: 'Reject', text: 'Reject'},
                {id: 'Accept', text: 'Accept'},
                {id: 'Next', text: 'Next'}
            ]
        },

        validations: {}
    });


    return RoutingPolicyTermThenModel;
});
