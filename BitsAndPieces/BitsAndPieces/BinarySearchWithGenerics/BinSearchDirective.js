var JJ;
(function (JJ) {
    var BusinessPanorama;
    (function (BusinessPanorama) {
        var Directives;
        (function (Directives) {
            'use strict';
            var BinSearchDirective = (function () {
                function BinSearchDirective() {
                    this.restrict = "E";
                    this.templateUrl = "../SiteAssets/app/BinSearch/BinSearchDirectiveView.html";
                    this.controller = JJ.BusinessPanorama.Controllers.BinSearchController;
                    this.controllerAs = "vm";
                    this.templateUrl += "?" + new Date().getTime(); // force it to always load, easy trick during development.
                }
                BinSearchDirective.BinSearchDirectiveFactory = function () {
                    var directive = function () {
                        return new BinSearchDirective();
                    };
                    directive['$inject'] = [''];
                    return directive;
                };
                return BinSearchDirective;
            }());
            Directives.BinSearchDirective = BinSearchDirective;
            angular
                .module('panoramaApp')
                .directive("jjBinSearch", [JJ.BusinessPanorama.Directives.BinSearchDirective.BinSearchDirectiveFactory()]);
        })(Directives = BusinessPanorama.Directives || (BusinessPanorama.Directives = {}));
    })(BusinessPanorama = JJ.BusinessPanorama || (JJ.BusinessPanorama = {}));
})(JJ || (JJ = {}));
//# sourceMappingURL=BinSearchDirective.js.map