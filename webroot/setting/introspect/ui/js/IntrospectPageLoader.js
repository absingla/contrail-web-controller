/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'controller-basedir/setting/introspect/ui/js/views/IntrospectView'
], function(IntrospectView) {
    var IntrospectPageLoader = function() {
        this.load = function (paramObject) {
            var self = this, currMenuObj = globalObj.currMenuObj,
                hashParams = paramObject['hashParams'],
                renderFn = paramObject['function'],
                loadingStartedDefObj = paramObject['loadingStartedDefObj'];

            self.introspectView = new IntrospectView();
            self.renderView(renderFn, hashParams);
            if(contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        };

        this.renderView = function (renderFn, hashParams, view) {
            $(contentContainer).empty();
            this.introspectView.renderIntrospect({hashParams: hashParams});
        };

        this.updateViewByHash = function (currPageQueryStr) {
            var renderFn;

            this.load({hashParams: currPageQueryStr, 'function': renderFn});
        };

        this.destroy = function () {};
    };

    return IntrospectPageLoader;
});

