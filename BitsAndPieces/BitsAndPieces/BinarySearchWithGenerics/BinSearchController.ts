module JJ.BusinessPanorama.Controllers {

    'use strict';

    import interfaces = JJ.BusinessPanorama.Interfaces;
    
    export class BinSearchController {

        public get HelloMessage(): string { return "Hello from BinSearchController!"; }

        private _isInitializing: boolean = true;

        // Dependencies for this controller.
        static $inject = [
            "$log",
            "JJ.BusinessPanorama.Services.BinSearchService"];

        constructor(
            private $log: ng.ILogService,
            private _binSearchService: JJ.BusinessPanorama.Services.BinSearchService) {

            this._isInitializing = true;

        } // constructor

        public DoSearch() {
            this.$log.debug("BinSearchController: DoSEarch: Entering.");

            this._binSearchService.DoSearch();
        }

    } // class

    angular
        .module('panoramaApp')
        .controller("JJ.BusinessPanorama.Controllers.BinSearchController", BinSearchController);


}

