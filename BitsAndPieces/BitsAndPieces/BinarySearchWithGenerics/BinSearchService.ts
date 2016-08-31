module Nivlag.Services {

    "use strict";

    var serviceId: string = "Nivlag.Services.BinSearchService";

    export interface ISearchKey {

    }

    export interface IUserSearchKey extends ISearchKey {
        FirstName: string;
        LastName: string;
    }

    export interface IBinarySearchable {
        IsEqualTo(value: ISearchKey): boolean;
        IsLessThan(value: ISearchKey): boolean;
        IsGreaterThan(value: ISearchKey): boolean;
    }

    class CoolnessProfile implements IBinarySearchable, IUserSearchKey {

        constructor(lastname: string, firstname: string, coolnessFactor: string) {
            this._myLastName = lastname;
            this._myFirstName = firstname;
            this._myCoolnessFactor = coolnessFactor;
        }

        private _myCoolnessFactor: string;
        private _myLastName: string;
        private _myFirstName: string;

        public get FirstName(): string { return this._myFirstName; }
        public get LastName(): string { return this._myLastName; }

        public IsEqualTo(compareToUserKey: IUserSearchKey): boolean {
            return compareToUserKey.LastName === this._myLastName &&
                compareToUserKey.FirstName === this._myFirstName;
        }

        // Am I less than the the key to which I'm being compared?
        public IsLessThan(compareToUserKey: IUserSearchKey): boolean {
            return this._myLastName < compareToUserKey.LastName ||
                (this._myLastName === compareToUserKey.LastName && this._myFirstName < compareToUserKey.FirstName);
        }

        public IsGreaterThan(compareToUserKey: IUserSearchKey): boolean {
            return this._myLastName > compareToUserKey.LastName ||
                (this._myLastName === compareToUserKey.LastName && this._myFirstName > compareToUserKey.FirstName);
        }

    }

    export class BinSearchService {

        static $inject: Array<string> = ["$log"];

        private _numericData: number[];
        private _someUsers: CoolnessProfile[];

        private _searchCalls: number;

        constructor(
            private $log: ng.ILogService) {

            this._numericData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            const firstNames =     ["David",                            "Kelly",   "Aidan",    "Paul", "person a", "person b", "person c", "person d", "person e", "person f", "person g", "person h", "person i", "person j", "person k", "person l"];
            const lastNames =      ["DaLoser",                          "Devlin",  "Galvin",   "Galvin", "zz1", "zz2" , "zz3", "zz4", "zz5", "zz6", "zz7", "zz8", "zz9", "zz10", "zz11", "zz12"];
            const coolnessFactor = ["Not cool, not even a little bit.", "Awesome", "The Best", "Cool", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh"];

            this._someUsers = firstNames.map((aFirstName, index) => {
                return new CoolnessProfile(lastNames[index], firstNames[index], coolnessFactor[index]);
            });
            
        }

        public DoSearch() {

            this.$log.debug("BinSearchService: DoSearch: Entering. Data set to:", this._numericData);

            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((aSearchitem) => {
                this.$log.debug(`BinSearchService: Searching for a term: ${aSearchitem}, got a result: ${
                    this._doSearchLambda<number>(
                        this._numericData,
                        aSearchitem,
                        (lhs: number, rhs: number) => {
                            return lhs - rhs;
                        })}.`);
            });

            const searchKeys: IUserSearchKey[] = [
                {
                    FirstName: "Paul", 
                    LastName: "Galvin"
                },
                {
                    FirstName: "Aidan",
                    LastName: "Galvin"
                },
                {
                    FirstName: "Perfect",
                    LastName: "Man"
                },
                {
                    FirstName: "David",
                    LastName: "DaLoser"
                },
                {
                    FirstName: "person f",
                    LastName: "zz6"
                }
            ];

            //searchKeys.forEach((aKey) => {
            //    this.$log.debug("Searching for key:", aKey);
            //    const result = this._doSearchGeneric(this._someUsers, aKey);
            //    this.$log.debug(result ? result : "Not found!");
            //});

            this.$log.debug("More efficient searching.");

            searchKeys.forEach((aKey) => {
                this.$log.debug("Searching for key:", aKey);
                const result = this._doSearchGenericMoreEfficiently(this._someUsers, aKey);
                this.$log.debug(result ? result : "Not found!");
            });

            //this.$log.debug("More efficient searching using ugly code.");

            this.$log.debug("*********************** UGLY SEARCH ************************");
            searchKeys.forEach((aKey) => {
                this.$log.debug("Searching for key:", aKey);
                const result = this._compactBinarySearch(this._someUsers, aKey);
                this.$log.debug(result ? result : "Not found!");
            });

        }

        private _doSearchGeneric<T extends IBinarySearchable, U extends ISearchKey>(sortedSearchData: T[], searchingFor: U): T {

            //this.$log.debug("_doSearchGeneric: Searching in searchData for item:", searchData, searchingFor);

            if (sortedSearchData.length < 1) {
                return null;
            }

            let currentIndex = Math.floor(sortedSearchData.length / 2);

            if (sortedSearchData[currentIndex].IsEqualTo(searchingFor)) {
                return sortedSearchData[currentIndex];
            }

            if (sortedSearchData[currentIndex].IsGreaterThan(searchingFor)) {
                return this._doSearchGeneric(sortedSearchData.slice(0, currentIndex), searchingFor);
            }

            else if (sortedSearchData[currentIndex].IsLessThan(searchingFor)) {
                return this._doSearchGeneric(sortedSearchData.slice(currentIndex + 1), searchingFor);
            }
            
            return null;

        }


        private _doSearchGenericMoreEfficiently<T extends IBinarySearchable, U extends ISearchKey>
            (sortedSearchData: T[], searchingFor: U, leftBracketIndex? : number, rightBracketIndex?: number): T {

            //this._searchCalls++;
            //if (this._searchCalls > 20) {
            //    this.$log.error("aborting because too many calls.");
            //    return null;
            //}

            // If no left bracket was passed then we know no right bracket was passed and can safely initialize both.
            if (isNaN(leftBracketIndex)) {
                leftBracketIndex = 0;
                rightBracketIndex = sortedSearchData.length - 1;
            }

            // Pick a middle value within the brackets that we have been passed 
            let currentIndex = Math.floor((rightBracketIndex - leftBracketIndex) / 2) + leftBracketIndex;
            
            this.$log.debug("_doSearchGeneric: Searching in searchData at currentIndex with lbi, rbi:", currentIndex, leftBracketIndex, rightBracketIndex);
            
            if (sortedSearchData[currentIndex].IsEqualTo(searchingFor)) {
                return sortedSearchData[currentIndex];
            }

            // If the last record wasn't a match and our window into the search corpus is a single item, it's never going to be found.
            if (rightBracketIndex === leftBracketIndex) {
                return null;
            }

            else if (sortedSearchData[currentIndex].IsGreaterThan(searchingFor)) {
                rightBracketIndex = currentIndex - 1;
                return this._doSearchGenericMoreEfficiently(sortedSearchData, searchingFor, leftBracketIndex, rightBracketIndex);
            }

            else {
                leftBracketIndex = currentIndex + 1;
                return this._doSearchGenericMoreEfficiently(sortedSearchData, searchingFor, leftBracketIndex, rightBracketIndex);
            }

        }
        
        private _compactBinarySearch<T extends IBinarySearchable, U extends ISearchKey>
            (sortedSearchData: T[], searchingFor: U, leftBracketIndex?: number, rightBracketIndex?: number): T {
            
            if (isNaN(leftBracketIndex)) {
                leftBracketIndex = 0;
                rightBracketIndex = sortedSearchData.length - 1;
            }

            // Pick a middle value within the brackets that we have been passed 
            const currentIndex = Math.floor((rightBracketIndex - leftBracketIndex) / 2) + leftBracketIndex;

            const candidateItem = sortedSearchData[currentIndex];

            return candidateItem.IsEqualTo(searchingFor) ? candidateItem :
                (rightBracketIndex === leftBracketIndex ? null : (
                    candidateItem.IsGreaterThan(searchingFor) ? this._compactBinarySearch(sortedSearchData, searchingFor, leftBracketIndex, currentIndex - 1) :
                        this._compactBinarySearch(sortedSearchData, searchingFor, currentIndex + 1, rightBracketIndex)));
        }

        private _doSearchLambda<T>(searchData: T[], searchFor: T, compareFunc: (lhs: T, rhs: T) => number) {

            let currentIndex = Math.floor(searchData.length / 2);

            if (compareFunc(searchData[currentIndex], searchFor) === 0) {
                return currentIndex;
            }

            if (compareFunc(searchData[currentIndex], searchFor) < 0) {
                return this._doSearchLambda(searchData.slice(currentIndex + 1), searchFor, compareFunc) + currentIndex + 1;
            }

            else if (compareFunc(searchData[currentIndex], searchFor) > 0) {
                return this._doSearchLambda(searchData.slice(0, currentIndex), searchFor, compareFunc);
            }

            return -1;

        }

    }

    angular
        .module('bitsAndPieces')
        .service(serviceId, BinSearchService);
}