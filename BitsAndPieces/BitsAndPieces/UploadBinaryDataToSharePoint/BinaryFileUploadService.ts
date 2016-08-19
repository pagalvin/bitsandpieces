module Nivlag.Services {

    'use strict';

    import interfaces = Nivlag.Interfaces;
    
    var serviceId = "Nivlag.Services.ImageDataService";

    export class BinaryFileUploadService implements interfaces.IBinaryFileUploadService {

        public get IsProcessing(): boolean { return this._isProcessing; }

        private _isProcessing: boolean = true;

        // Get our dependencies in order.
        static $inject = [
            "$q",
            "$log",
            "$http",
            "Nivlag.Services.SharePointUtilityService"
        ];

        constructor(
            private $q: ng.IQService,
            private $log: ng.ILogService,
            private $http: ng.IHttpService,
            private spRestUtil: SharePointUtilityService
        ) {

            this.$log.debug("BinaryFileUploadService(): constructor: entering.");

        }

        public UploadFileAsync(theImage: any): ng.IPromise<interfaces.IFileUploadSuccessResponse> {

            let defer = this.$q.defer<interfaces.IFileUploadSuccessResponse>();

            this.getFileBuffer(theImage).then(
                (result) => {
                    this.$log.debug("UploadFileAsync: Got a success response from getFileBuffer().", result);
                    this.addFileToFolder(result).then((uploadResult) => {
                        this.$log.debug("UploadFileAsync: Successfully uploaded the file, got a result:", uploadResult);
                    })
                }),
                (error) => {
                    this.$log.error("UploadFileAsync: Got a failure response from getFileBuffer().", error);
                };
            ;

            return defer.promise;
        }

        // Get the local file as an array buffer.
        private getFileBuffer(theData: any): ng.IPromise<any> {
            
            let defer = this.$q.defer<any>();

            var reader = new FileReader();

            reader.onloadend = function (e) {
                console.log("getFileBuffer: onloadend: got a result", e);
                defer.resolve(e.target["result"]);
            }
            reader.onerror = function (e) {
                this.$log.debug("getFileBuffer: onerror: got a result", e);

                defer.reject("Got an error");
            }

            //reader.readAsArrayBuffer(theData[0].files[0]);
            reader.readAsArrayBuffer(theData.files[0]);

            return defer.promise;
        }

        // Add the file to the file collection in the Shared Documents folder.
        private addFileToFolder(arrayBuffer: ArrayBuffer) {

            let defer = this.$q.defer<any>();

            var fileName = "xyzzy";
            const appWebUrl: string = "https://bigapplesharepoint.sharepoint.com/sites/Paul";
            const serverRelativeUrlToFolder: string = "Shared%20Documents";

            const fileCollectionEndpoint =
                `${appWebUrl}/_api/web/getfolderbyserverrelativeurl('${serverRelativeUrlToFolder}')/files` +
                `/add(overwrite=true, url='xyzzy')`;

            this.spRestUtil.getRequestDigest(appWebUrl).then(
                (spRequestDigestPacket) => {

                    const thisHttpRequestHeaders: ng.IRequestShortcutConfig = {
                        headers: {
                            "accept": "application/json;odata=verbose",
                            "X-RequestDigest": spRequestDigestPacket.requestDigest
                        }
                    }

                    this.$http.post(fileCollectionEndpoint, arrayBuffer, thisHttpRequestHeaders).then(
                        (successResult) => {
                            defer.resolve(successResult);
                        },
                        (failureResult) => {
                            defer.reject(failureResult);
                        }
                    );
                },
                (error) => {
                    defer.reject(error);
                }
            );

            return defer.promise;
        }
    }

    angular
        .module('nivlag')
        .service(serviceId, BinaryFileUploadService);

}
