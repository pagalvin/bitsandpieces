module JJ.BusinessPanorama.Common.Services {

    'use strict';

    import interfaces = JJ.BusinessPanorama.Interfaces;
    import commonServices = JJ.BusinessPanorama.Common.Services;
    
    var serviceId = "JJ.BusinessPanorama.Common.Services.MMSService";

    interface IPanoramaTerm {
        termName: string;
        SPTerm: SP.Taxonomy.Term;
        childTerms: IPanoramaTerm[];
    }

    export class MMSService {

        public get IsProcessing(): boolean { return this._isProcessing; }

        private _isProcessing: boolean = true;

        private SPContext: SP.ClientContext;

        public AllPanoramaTerms: IPanoramaTerm[];

        // Get our dependencies in order.
        static $inject = [
            "$q",
            "$log",
            "$http",
            "JJ.BusinessPanorama.Common.Services.sharepointrestconnection"
        ];

        constructor(
            private $q: ng.IQService,
            private $log: ng.ILogService,
            private $http: ng.IHttpService,
            private spRestUtil: commonServices.SharePointRestConnection
        )
        {

            this.AllPanoramaTerms = [];

            this.$log.debug("MMSService(): constructor: entering.");

            var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";

            $.getScript(scriptbase + "SP.Runtime.js", () => {

                $.getScript(scriptbase + "SP.js", () => {

                    $.getScript(scriptbase + "SP.Taxonomy.js", () => {

                        this.SPContext = SP.ClientContext.get_current();

                        this.GetAllPanoramaTerms().then(
                            () => {
                                this.$log.debug("MMSService: constructor: retrieved all terms:", this.AllPanoramaTerms);
                            },
                            () => {
                                this.$log.error("MMSService: constructor: failed to retrieve all terms, maybe some?:", this.AllPanoramaTerms);
                            }
                        );
                    });
                });
            });

        }

        public GetAllPanoramaTerms(): ng.IPromise<IPanoramaTerm[]>{

            let deferred = this.$q.defer<IPanoramaTerm[]>();

            this._loadParentTerms("Business Panorama").then(
                (parentTerms: IPanoramaTerm[]) => {

                    let allMmsRequests: ng.IPromise<any>[] = [];

                    parentTerms.forEach((aParentTerm) => {

                        allMmsRequests = allMmsRequests.concat(this._insertChildTermsForParentTermSet(aParentTerm));

                    });

                    this.$q.all(allMmsRequests).then(
                        () => {
                            this.$log.debug("MMSSErvice.ts: GetAllPanoramaTerms(): Successfully resolved all the promises.");
                            deferred.resolve(this.AllPanoramaTerms);
                        },
                        () => {
                            this.$log.error("MMSSErvice.ts: GetAllPanoramaTerms(): Failed at least one of othe MMS promises.");
                        });

                });

            return deferred.promise;

        }

        private _loadParentTerms(forTermSetLabel: string): ng.IPromise<IPanoramaTerm[]> {

            this.$log.debug("MMSService: _loadParentTerms(): Searching for terms in termset:", forTermSetLabel);

            let deferred = this.$q.defer<IPanoramaTerm[]>();

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

                        //this.getTermsForTermSet(item);

                        return <IPanoramaTerm>{
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

        private _insertChildTermsForParentTermSet(parentTerm: IPanoramaTerm): ng.IPromise<IPanoramaTerm[]> {

            this.$log.debug("MMSService: getTermsForTermSet: getting terms for a parent:", parentTerm);

            let deferred = this.$q.defer<IPanoramaTerm[]>();

            let termsToLoad = parentTerm.SPTerm.get_terms();

            this.SPContext.load(termsToLoad);

            this.SPContext.executeQueryAsync(
                () => {

                    //this.$log.debug("MMSService: getTermsForTermSet: got some terms:",
                    //    termsToLoad.get_data().map((item) => { return item.get_name() })); 

                    parentTerm.childTerms = termsToLoad.get_data().map(
                        (aTerm) => {
                            return <IPanoramaTerm>{
                                childTerms: [],
                                SPTerm: aTerm,
                                termName: aTerm.get_name()
                            };
                        });

                    this.AllPanoramaTerms = this.AllPanoramaTerms.concat(parentTerm);

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
        .module('panoramaApp')
        .service(serviceId, MMSService);

}
