module Nivlag.Services {


    export interface IRequestDigest {
        requestDigest: string;
        requestDigestExpiration: moment.Moment;
    }

    interface ISharePointUtilityService {
        getRequestDigest(string);
    }

    export class SharePointUtilityService implements ISharePointUtilityService {

        private siteBaseUrl: string;
        private requestDigest: IRequestDigest;

        static $inject: string[] = ["$q", "$http", "$interval", "$log"];

        constructor(
            private $q: ng.IQService,
            private $http: ng.IHttpService,
            private $interval: ng.IIntervalService,
            private $log: ng.ILogService) {
        }

        private _parseRequestDigest(data: any, headers: Object): void {
            this.requestDigest = {
                requestDigest: data.d.GetContextWebInformation.FormDigestValue,
                requestDigestExpiration: moment().add(data.d.GetContextWebInformation.FormDigestTimeoutSeconds, "seconds")
            };
        }

        public getRequestDigest(siteUrl: string): ng.IPromise<IRequestDigest> {
            this.siteBaseUrl = siteUrl;

            var url = siteUrl + "/_api/contextinfo";
            var deferred: ng.IDeferred<IRequestDigest> = this.$q.defer<IRequestDigest>();

            if (!this.requestDigest) {
                this.$interval(() => {
                    this.getRequestDigest(this.siteBaseUrl);
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
                }

                this.$http(request).then((response: ng.IHttpPromiseCallbackArg<any>) => {
                    this._parseRequestDigest(response.data, response.headers);
                    deferred.resolve(this.requestDigest);
                })
                    .catch((response: ng.IHttpPromiseCallbackArg<any>) => {
                        this.$log.error("getRequestDigest: Failed to get request digest, details:", response);
                        deferred.reject(response);
                    });
            }
            else { 
                // if the expiration is in the future
                deferred.resolve(this.requestDigest);
            }

            return deferred.promise;
        };

        public GetStandardSharePointPostHeaders(digest: IRequestDigest): any {
            return {
                "Content-Type": "application/json; odata=verbose",
                "Accept": "application/json; odata=verbose",
                "X-RequestDigest": digest.requestDigest
            };
        }

        public GetStandardSharePointMergeHeaders(digest: IRequestDigest): any {
            return {
                "Content-Type": "application/json; odata=verbose",
                "Accept": "application/json; odata=verbose",
                "X-RequestDigest": digest.requestDigest,
                "X-HTTP-Method": "MERGE",
                "IF-MATCH": "*"
            };
        }
       
    }

    angular.module('nivlag').
        service("Nivlag.Services.SharePointUtilityService", SharePointUtilityService);
}