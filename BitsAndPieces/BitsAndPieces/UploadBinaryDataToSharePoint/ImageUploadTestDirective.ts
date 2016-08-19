module Nivlag.Directives {

    'use strict';

    export class ImageUploadTestDirective implements ng.IDirective {

        public restrict = "E";
        public templateUrl = "ImageUploadTestDirectiveView.html";
        public controller = Nivlag.Controllers.BinaryFileUploadTestController;
        public controllerAs = "vm";
        public scope: {};

        constructor() {

            this.templateUrl += "?" + new Date().getTime(); // force it to always load, easy trick during development.
        }

        public static ImageUploadTestDirectiveFactory() {

            var directive = () => {
                return new ImageUploadTestDirective();
            };

            directive['$inject'] = [''];

            return directive;
        }
    }

    angular
        .module('nivlag')
        .directive("imageUploadTest", [Nivlag.Directives.ImageUploadTestDirective.ImageUploadTestDirectiveFactory()]);

}

