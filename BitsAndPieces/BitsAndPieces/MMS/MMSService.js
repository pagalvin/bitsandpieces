var Nivlag;
(function (Nivlag) {
    var Services;
    (function (Services) {
        'use strict';
        var serviceId = "Nivlag.Services.MMSService";
        var MMSService = (function () {
            function MMSService($q, $log, $http, spRestUtil) {
                var _this = this;
                this.$q = $q;
                this.$log = $log;
                this.$http = $http;
                this.spRestUtil = spRestUtil;
                this._isProcessing = true;
                this.AllTerms = [];
                this.$log.debug("MMSService(): constructor: entering.");
                var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
                $.getScript(scriptbase + "SP.Runtime.js", function () {
                    $.getScript(scriptbase + "SP.js", function () {
                        $.getScript(scriptbase + "SP.Taxonomy.js", function () {
                            _this.SPContext = SP.ClientContext.get_current();
                        });
                    });
                });
            }
            Object.defineProperty(MMSService.prototype, "IsProcessing", {
                get: function () { return this._isProcessing; },
                enumerable: true,
                configurable: true
            });
            MMSService.prototype.GetAllTermsForTermGroup = function (termGroupName) {
                var _this = this;
                var deferred = this.$q.defer();
                this._loadParentTerms(termGroupName).then(function (parentTerms) {
                    var allMmsRequests = [];
                    parentTerms.forEach(function (aParentTerm) {
                        allMmsRequests = allMmsRequests.concat(_this._insertChildTermsForParentTermSet(aParentTerm));
                    });
                    _this.$q.all(allMmsRequests).then(function () {
                        _this.$log.debug("MMSService.ts: GetAllPanoramaTerms(): Successfully resolved all the promises.");
                        deferred.resolve(_this.AllTerms);
                    }, function () {
                        _this.$log.error("MMSService.ts: GetAllPanoramaTerms(): Failed at least one of othe MMS promises.");
                    });
                });
                return deferred.promise;
            };
            MMSService.prototype._loadParentTerms = function (forTermSetLabel) {
                var _this = this;
                this.$log.debug("MMSService: _loadParentTerms(): Searching for terms in termset:", forTermSetLabel);
                var deferred = this.$q.defer();
                var context = new SP.ClientContext(_spPageContextInfo.siteServerRelativeUrl);
                this.SPContext = context;
                var site = context.get_site();
                var terms = SP.Taxonomy.TaxonomySession.getTaxonomySession(context).
                    getDefaultSiteCollectionTermStore().
                    getSiteCollectionGroup(site, false).
                    get_termSets().
                    getByName(forTermSetLabel).
                    get_terms();
                context.load(terms);
                context.executeQueryAsync(function () {
                    _this.$log.debug("MMSService: _loadParentTerms: Successfully got some terms.");
                    var parentTerms = terms.get_data().map(function (aTerm) {
                        return {
                            childTerms: [],
                            termName: aTerm.get_name(),
                            SPTerm: aTerm
                        };
                    });
                    _this.$log.debug("MMSService: _loadParentTerms: Terms:", parentTerms);
                    deferred.resolve(parentTerms);
                }, function (sender, args) {
                    _this.$log.debug("MMSService: _loadParentTerms: Failed to retrieve any terms, error details:", args.get_message(), args.get_stackTrace(), args);
                });
                return deferred.promise;
            };
            MMSService.prototype._insertChildTermsForParentTermSet = function (parentTerm) {
                var _this = this;
                this.$log.debug("MMSService: getTermsForTermSet: getting terms for a parent:", parentTerm);
                var deferred = this.$q.defer();
                var termsToLoad = parentTerm.SPTerm.get_terms();
                this.SPContext.load(termsToLoad);
                this.SPContext.executeQueryAsync(function () {
                    parentTerm.childTerms = termsToLoad.get_data().map(function (aTerm) {
                        return {
                            childTerms: [],
                            SPTerm: aTerm,
                            termName: aTerm.get_name()
                        };
                    });
                    _this.AllTerms = _this.AllTerms.concat(parentTerm);
                    // Since this is actually pushing the terms into the parentTerm array, not really need to return the child terms, but just for debugging.
                    deferred.resolve(parentTerm.childTerms);
                }, function (sender, args) {
                    deferred.reject({
                        msg: "MMSService: _getTermsForTermSet: Failed to retrieve child terms.",
                        sharePointMessage: args.get_message(),
                        sharePointMessageArgs: args
                    });
                });
                return deferred.promise;
            };
            // Get our dependencies in order.
            MMSService.$inject = [
                "$q",
                "$log",
                "$http",
                "Nivlag.Services.SharePointUtilityService"
            ];
            return MMSService;
        }());
        Services.MMSService = MMSService;
        angular
            .module('nivlag')
            .service(serviceId, MMSService);
    })(Services = Nivlag.Services || (Nivlag.Services = {}));
})(Nivlag || (Nivlag = {}));
//# sourceMappingURL=MMSService.js.map