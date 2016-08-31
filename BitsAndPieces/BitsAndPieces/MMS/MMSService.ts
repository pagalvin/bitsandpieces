module Nivlag.Services {

    'use strict';

    import interfaces = Nivlag.Interfaces;
    
    var serviceId = "Nivlag.Services.MMSService";

    interface ITerm {
        termName: string;
        SPTerm: SP.Taxonomy.Term;
        childTerms: ITerm[];
    }

    export class MMSService {

        public get IsProcessing(): boolean { return this._isProcessing; }

        private _isProcessing: boolean = true;

        private SPContext: SP.ClientContext;

        public AllTerms: ITerm[];

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
            private spRestUtil: Nivlag.Services.SharePointUtilityService
        )
        {

            this.AllTerms = [];

            this.$log.debug("MMSService(): constructor: entering.");

            var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";

            $.getScript(scriptbase + "SP.Runtime.js", () => {

                $.getScript(scriptbase + "SP.js", () => {

                    $.getScript(scriptbase + "SP.Taxonomy.js", () => {

                        this.SPContext = SP.ClientContext.get_current();

                    });
                });
            });

        }

        public GetAllTermsForTermGroup(termGroupName: string): ng.IPromise<ITerm[]>{

            let deferred = this.$q.defer<ITerm[]>();

            this._loadParentTerms(termGroupName).then(
                (parentTerms: ITerm[]) => {

                    let allMmsRequests: ng.IPromise<any>[] = [];

                    parentTerms.forEach((aParentTerm) => {

                        allMmsRequests = allMmsRequests.concat(this._insertChildTermsForParentTermSet(aParentTerm));

                    });

                    this.$q.all(allMmsRequests).then(
                        () => {
                            this.$log.debug("MMSService.ts: GetAllPanoramaTerms(): Successfully resolved all the promises.");
                            deferred.resolve(this.AllTerms);
                        },
                        () => {
                            this.$log.error("MMSService.ts: GetAllPanoramaTerms(): Failed at least one of othe MMS promises.");
                        });

                });

            return deferred.promise;

        }

        private _loadParentTerms(forTermSetLabel: string): ng.IPromise<ITerm[]> {

            this.$log.debug("MMSService: _loadParentTerms(): Searching for terms in termset:", forTermSetLabel);

            let deferred = this.$q.defer<ITerm[]>();

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
            
            context.executeQueryAsync(
                () => {
                    this.$log.debug("MMSService: _loadParentTerms: Successfully got some terms.");

                    const parentTerms = terms.get_data().map((aTerm) => {

                        return <ITerm>{
                            childTerms: [],
                            termName: aTerm.get_name(),
                            SPTerm: aTerm
                        };
                    });

                    this.$log.debug("MMSService: _loadParentTerms: Terms:", parentTerms);

                    deferred.resolve(parentTerms);

                },
                (sender, args) => {
                    this.$log.debug("MMSService: _loadParentTerms: Failed to retrieve any terms, error details:", args.get_message(), args.get_stackTrace(), args);
                });

            return deferred.promise;

        }

        private _insertChildTermsForParentTermSet(parentTerm: ITerm): ng.IPromise<ITerm[]> {

            this.$log.debug("MMSService: getTermsForTermSet: getting terms for a parent:", parentTerm);

            let deferred = this.$q.defer<ITerm[]>();

            let termsToLoad = parentTerm.SPTerm.get_terms();

            this.SPContext.load(termsToLoad);

            this.SPContext.executeQueryAsync(
                () => {

                    parentTerm.childTerms = termsToLoad.get_data().map(
                        (aTerm) => {
                            return <ITerm>{
                                childTerms: [],
                                SPTerm: aTerm,
                                termName: aTerm.get_name()
                            };
                        });

                    this.AllTerms = this.AllTerms.concat(parentTerm);

                    // Since this is actually pushing the terms into the parentTerm array, not really need to return the child terms, but just for debugging.
                    deferred.resolve(parentTerm.childTerms); 
                },
                (sender, args) => {
                    deferred.reject(
                        <interfaces.ISharePointJsomErrorResponse>{
                            msg: "MMSService: _getTermsForTermSet: Failed to retrieve child terms.",
                            sharePointMessage: args.get_message(),
                            sharePointMessageArgs: args
                        }
                    );

                }
            );

            return deferred.promise;

        }


    }

    angular
        .module('nivlag')
        .service(serviceId, MMSService);

}
