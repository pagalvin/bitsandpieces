var Nivlag;
(function (Nivlag) {
    var Services;
    (function (Services) {
        'use strict';
        var serviceId = "Nivlag.Services.ImageDataService";
        var BinaryFileUploadService = (function () {
            function BinaryFileUploadService($q, $log, $http, spRestUtil) {
                this.$q = $q;
                this.$log = $log;
                this.$http = $http;
                this.spRestUtil = spRestUtil;
                this._isProcessing = true;
                this.$log.debug("BinaryFileUploadService(): constructor: entering.");
            }
            Object.defineProperty(BinaryFileUploadService.prototype, "IsProcessing", {
                get: function () { return this._isProcessing; },
                enumerable: true,
                configurable: true
            });
            BinaryFileUploadService.prototype.UploadFileAsync = function (theImage) {
                var _this = this;
                var defer = this.$q.defer();
                this.getFileBuffer(theImage).then(function (result) {
                    _this.$log.debug("UploadFileAsync: Got a success response from getFileBuffer().", result);
                    _this.addFileToFolder(result).then(function (uploadResult) {
                        _this.$log.debug("UploadFileAsync: Successfully uploaded the file, got a result:", uploadResult);
                    });
                }),
                    function (error) {
                        _this.$log.error("UploadFileAsync: Got a failure response from getFileBuffer().", error);
                    };
                ;
                return defer.promise;
            };
            // Get the local file as an array buffer.
            BinaryFileUploadService.prototype.getFileBuffer = function (theData) {
                var defer = this.$q.defer();
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    console.log("getFileBuffer: onloadend: got a result", e);
                    defer.resolve(e.target["result"]);
                };
                reader.onerror = function (e) {
                    this.$log.debug("getFileBuffer: onerror: got a result", e);
                    defer.reject("Got an error");
                };
                //reader.readAsArrayBuffer(theData[0].files[0]);
                reader.readAsArrayBuffer(theData.files[0]);
                return defer.promise;
            };
            // Add the file to the file collection in the Shared Documents folder.
            BinaryFileUploadService.prototype.addFileToFolder = function (arrayBuffer) {
                var _this = this;
                var defer = this.$q.defer();
                var fileName = "xyzzy";
                var appWebUrl = "https://bigapplesharepoint.sharepoint.com/sites/Paul";
                var serverRelativeUrlToFolder = "Shared%20Documents";
                var fileCollectionEndpoint = (appWebUrl + "/_api/web/getfolderbyserverrelativeurl('" + serverRelativeUrlToFolder + "')/files") +
                    "/add(overwrite=true, url='xyzzy')";
                this.spRestUtil.getRequestDigest(appWebUrl).then(function (spRequestDigestPacket) {
                    var thisHttpRequestHeaders = {
                        headers: {
                            "accept": "application/json;odata=verbose",
                            "X-RequestDigest": spRequestDigestPacket.requestDigest
                        }
                    };
                    _this.$http.post(fileCollectionEndpoint, arrayBuffer, thisHttpRequestHeaders).then(function (successResult) {
                        defer.resolve(successResult);
                    }, function (failureResult) {
                        defer.reject(failureResult);
                    });
                }, function (error) {
                    defer.reject(error);
                });
                return defer.promise;
            };
            // Get our dependencies in order.
            BinaryFileUploadService.$inject = [
                "$q",
                "$log",
                "$http",
                "Nivlag.Services.SharePointUtilityService"
            ];
            return BinaryFileUploadService;
        }());
        Services.BinaryFileUploadService = BinaryFileUploadService;
        angular
            .module('nivlag')
            .service(serviceId, BinaryFileUploadService);
    })(Services = Nivlag.Services || (Nivlag.Services = {}));
})(Nivlag || (Nivlag = {}));
//# sourceMappingURL=BinaryFileUploadService.js.map