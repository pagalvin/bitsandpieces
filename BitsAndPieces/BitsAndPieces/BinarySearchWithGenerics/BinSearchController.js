var JJ;
(function (JJ) {
    var BusinessPanorama;
    (function (BusinessPanorama) {
        var Controllers;
        (function (Controllers) {
            'use strict';
            var BinSearchController = (function () {
                function BinSearchController($log, _binSearchService) {
                    this.$log = $log;
                    this._binSearchService = _binSearchService;
                    this._isInitializing = true;
                    this._isInitializing = true;
                } // constructor
                Object.defineProperty(BinSearchController.prototype, "HelloMessage", {
                    get: function () { return "Hello from BinSearchController!"; },
                    enumerable: true,
                    configurable: true
                });
                BinSearchController.prototype.DoSearch = function () {
                    this.$log.debug("BinSearchController: DoSEarch: Entering.");
                    this._binSearchService.DoSearch();
                };
                // Dependencies for this controller.
                BinSearchController.$inject = [
                    "$log",
                    "JJ.BusinessPanorama.Services.BinSearchService"];
                return BinSearchController;
            }());
            Controllers.BinSearchController = BinSearchController; // class
            angular
                .module('panoramaApp')
                .controller("JJ.BusinessPanorama.Controllers.BinSearchController", BinSearchController);
        })(Controllers = BusinessPanorama.Controllers || (BusinessPanorama.Controllers = {}));
    })(BusinessPanorama = JJ.BusinessPanorama || (JJ.BusinessPanorama = {}));
})(JJ || (JJ = {}));
//# sourceMappingURL=BinSearchController.js.map