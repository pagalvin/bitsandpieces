var Nivlag;
(function (Nivlag) {
    var Directives;
    (function (Directives) {
        'use strict';
        var ImageUploadTestDirective = (function () {
            function ImageUploadTestDirective() {
                this.restrict = "E";
                this.templateUrl = "ImageUploadTestDirectiveView.html";
                this.controller = Nivlag.Controllers.BinaryFileUploadTestController;
                this.controllerAs = "vm";
                this.templateUrl += "?" + new Date().getTime(); // force it to always load, easy trick during development.
            }
            ImageUploadTestDirective.ImageUploadTestDirectiveFactory = function () {
                var directive = function () {
                    return new ImageUploadTestDirective();
                };
                directive['$inject'] = [''];
                return directive;
            };
            return ImageUploadTestDirective;
        }());
        Directives.ImageUploadTestDirective = ImageUploadTestDirective;
        angular
            .module('nivlag')
            .directive("imageUploadTest", [Nivlag.Directives.ImageUploadTestDirective.ImageUploadTestDirectiveFactory()]);
    })(Directives = Nivlag.Directives || (Nivlag.Directives = {}));
})(Nivlag || (Nivlag = {}));
//# sourceMappingURL=ImageUploadTestDirective.js.map