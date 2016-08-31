module JJ.BusinessPanorama.Directives {

    'use strict';

    export class BinSearchDirective implements ng.IDirective {

        public restrict = "E";
        public templateUrl = "../SiteAssets/app/BinSearch/BinSearchDirectiveView.html";
        public controller = JJ.BusinessPanorama.Controllers.BinSearchController;
        public controllerAs = "vm";
        public scope: {};

        constructor() {

            this.templateUrl += "?" + new Date().getTime(); // force it to always load, easy trick during development.
        }

        public static BinSearchDirectiveFactory() {

            var directive = () => {
                return new BinSearchDirective();
            };

            directive['$inject'] = [''];

            return directive;
        }
    }

    angular
        .module('panoramaApp')
        .directive("jjBinSearch", [JJ.BusinessPanorama.Directives.BinSearchDirective.BinSearchDirectiveFactory()]);

}

