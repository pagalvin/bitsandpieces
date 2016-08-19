var Nivlag;
(function (Nivlag) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var controllerId = 'Nivlag.Controllers.BinaryFileUploadTestController';
        var BinaryFileUploadTestController = (function () {
            function BinaryFileUploadTestController($q, $log, _binaryFileUploadService) {
                this.$q = $q;
                this.$log = $log;
                this._binaryFileUploadService = _binaryFileUploadService;
            } // constructor
            Object.defineProperty(BinaryFileUploadTestController.prototype, "HelloMessage", {
                get: function () { return "Hello from BinaryFileUploadTestController."; },
                enumerable: true,
                configurable: true
            });
            BinaryFileUploadTestController.prototype.UploadFile = function () {
                this.$log.debug("BinaryFileUploadTestController: UploadFile(): Entering.");
                var f = document.getElementById("getFile");
                this.$log.debug("BinaryFileUploadTestController: UploadFile(): File:", f);
                this._binaryFileUploadService.UploadFileAsync(f);
            };
            // Dependencies for this controller.
            BinaryFileUploadTestController.$inject = [
                "$q",
                "$log",
                "Nivlag.Services.BinaryFileUploadService"];
            return BinaryFileUploadTestController;
        }());
        Controllers.BinaryFileUploadTestController = BinaryFileUploadTestController; // class
        angular
            .module('nivlag')
            .controller(controllerId, BinaryFileUploadTestController);
    })(Controllers = Nivlag.Controllers || (Nivlag.Controllers = {}));
})(Nivlag || (Nivlag = {}));
//# sourceMappingURL=ImageUploadTestController.js.map