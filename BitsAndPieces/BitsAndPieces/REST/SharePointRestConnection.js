var Nivlag;
(function (Nivlag) {
    var Services;
    (function (Services) {
        var SharePointUtilityService = (function () {
            function SharePointUtilityService($q, $http, $interval, $log) {
                this.$q = $q;
                this.$http = $http;
                this.$interval = $interval;
                this.$log = $log;
            }
            SharePointUtilityService.prototype._parseRequestDigest = function (data, headers) {
                this.requestDigest = {
                    requestDigest: data.d.GetContextWebInformation.FormDigestValue,
                    requestDigestExpiration: moment().add(data.d.GetContextWebInformation.FormDigestTimeoutSeconds, "seconds")
                };
            };
            SharePointUtilityService.prototype.getRequestDigest = function (siteUrl) {
                var _this = this;
                this.siteBaseUrl = siteUrl;
                var url = siteUrl + "/_api/contextinfo";
                var deferred = this.$q.defer();
                if (!this.requestDigest) {
                    this.$interval(function () {
                        _this.getRequestDigest(_this.siteBaseUrl);
                    }, 900000); //900000 ms = 15 minutes, or half of the default expiration
                }
                // if the expiration is in the past, or if it doesn't exist yet, then fetch a new one and resolve when complete
                if ((!this.requestDigest) || (this.requestDigest.requestDigestExpiration < moment())) {
                    var request = {
                        url: url,
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json; odata=verbose",
                            "Accept": "application/json; odata=verbose"
                        }
                    };
                    this.$http(request).then(function (response) {
                        _this._parseRequestDigest(response.data, response.headers);
                        deferred.resolve(_this.requestDigest);
                    })
                        .catch(function (response) {
                        _this.$log.error("getRequestDigest: Failed to get request digest, details:", response);
                        deferred.reject(response);
                    });
                }
                else {
                    // if the expiration is in the future
                    deferred.resolve(this.requestDigest);
                }
                return deferred.promise;
            };
            ;
            SharePointUtilityService.prototype.GetStandardSharePointPostHeaders = function (digest) {
                return {
                    "Content-Type": "application/json; odata=verbose",
                    "Accept": "application/json; odata=verbose",
                    "X-RequestDigest": digest.requestDigest
                };
            };
            SharePointUtilityService.prototype.GetStandardSharePointMergeHeaders = function (digest) {
                return {
                    "Content-Type": "application/json; odata=verbose",
                    "Accept": "application/json; odata=verbose",
                    "X-RequestDigest": digest.requestDigest,
                    "X-HTTP-Method": "MERGE",
                    "IF-MATCH": "*"
                };
            };
            SharePointUtilityService.$inject = ["$q", "$http", "$interval", "$log"];
            return SharePointUtilityService;
        }());
        Services.SharePointUtilityService = SharePointUtilityService;
        angular.module('nivlag').
            service("Nivlag.Services.SharePointUtilityService", SharePointUtilityService);
    })(Services = Nivlag.Services || (Nivlag.Services = {}));
})(Nivlag || (Nivlag = {}));
//# sourceMappingURL=SharePointRestConnection.js.map