/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LogsView
 */
define(function (require) {
    var ContrailView = require("contrail-view");
    var ko = require("knockout");
    var Knockback = require("knockback");
    var kbValidation = require("validation");

    var LineChartConfigView = ContrailView.extend({
        render: function () {
            var self = this;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), "validation", null, null, function () {
                Knockback.applyBindings(self.model, self.$el[0]);
                kbValidation.bind(self);
            });
        },

        getViewConfig: function () {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: "records", view: "FormInputView",
                                    viewConfig: {
                                        label: cowl.LOGS_NUMBER_OF_RECORDS,
                                        path: "records",
                                        dataBindValue: "records",
                                        class: "col-xs-6",
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        },

        remove: function () {
            var self = this;
            Knockback.release(self.model, self.$el[0]);
            ko.cleanNode(self.$el[0]);
            kbValidation.unbind(self);
            self.$el.empty().off(); // off to unbind the events
            self.stopListening();
            return self;
        },
    });
    return LineChartConfigView;
});
