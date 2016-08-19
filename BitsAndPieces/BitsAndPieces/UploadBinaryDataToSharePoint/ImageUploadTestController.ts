module Nivlag.Controllers {

    'use strict';

    var controllerId = 'Nivlag.Controllers.BinaryFileUploadTestController';

    import interfaces = Nivlag.Interfaces;

    export class BinaryFileUploadTestController {

        public get HelloMessage(): string { return "Hello from BinaryFileUploadTestController."; }
        public TestUploadFile: any;

        // Dependencies for this controller.
        static $inject = [
            "$q",
            "$log",
            "Nivlag.Services.BinaryFileUploadService"];

        constructor(
            private $q: ng.IQService,
            private $log: ng.ILogService,
            private _binaryFileUploadService: Nivlag.Services.BinaryFileUploadService) {

        } // constructor

        public UploadFile() {

            this.$log.debug("BinaryFileUploadTestController: UploadFile(): Entering.");

            let f = <any>document.getElementById("getFile");

            this.$log.debug("BinaryFileUploadTestController: UploadFile(): File:", f);

            this._binaryFileUploadService.UploadFileAsync(f);

        }

    } // class

    angular
        .module('nivlag')
        .controller(controllerId, BinaryFileUploadTestController);


}

