var Nivlag;
(function (Nivlag) {
    var Services;
    (function (Services) {
        "use strict";
        var serviceId = "Nivlag.Services.BinSearchService";
        var CoolnessProfile = (function () {
            function CoolnessProfile(lastname, firstname, coolnessFactor) {
                this._myLastName = lastname;
                this._myFirstName = firstname;
                this._myCoolnessFactor = coolnessFactor;
            }
            Object.defineProperty(CoolnessProfile.prototype, "FirstName", {
                get: function () { return this._myFirstName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CoolnessProfile.prototype, "LastName", {
                get: function () { return this._myLastName; },
                enumerable: true,
                configurable: true
            });
            CoolnessProfile.prototype.IsEqualTo = function (compareToUserKey) {
                return compareToUserKey.LastName === this._myLastName &&
                    compareToUserKey.FirstName === this._myFirstName;
            };
            // Am I less than the the key to which I'm being compared?
            CoolnessProfile.prototype.IsLessThan = function (compareToUserKey) {
                return this._myLastName < compareToUserKey.LastName ||
                    (this._myLastName === compareToUserKey.LastName && this._myFirstName < compareToUserKey.FirstName);
            };
            CoolnessProfile.prototype.IsGreaterThan = function (compareToUserKey) {
                return this._myLastName > compareToUserKey.LastName ||
                    (this._myLastName === compareToUserKey.LastName && this._myFirstName > compareToUserKey.FirstName);
            };
            return CoolnessProfile;
        }());
        var BinSearchService = (function () {
            function BinSearchService($log) {
                this.$log = $log;
                this._numericData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                var firstNames = ["David", "Kelly", "Aidan", "Paul", "person a", "person b", "person c", "person d", "person e", "person f", "person g", "person h", "person i", "person j", "person k", "person l"];
                var lastNames = ["DaLoser", "Devlin", "Galvin", "Galvin", "zz1", "zz2", "zz3", "zz4", "zz5", "zz6", "zz7", "zz8", "zz9", "zz10", "zz11", "zz12"];
                var coolnessFactor = ["Not cool, not even a little bit.", "Awesome", "The Best", "Cool", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh", "meh"];
                this._someUsers = firstNames.map(function (aFirstName, index) {
                    return new CoolnessProfile(lastNames[index], firstNames[index], coolnessFactor[index]);
                });
            }
            BinSearchService.prototype.DoSearch = function () {
                var _this = this;
                this.$log.debug("BinSearchService: DoSearch: Entering. Data set to:", this._numericData);
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function (aSearchitem) {
                    _this.$log.debug("BinSearchService: Searching for a term: " + aSearchitem + ", got a result: " + _this._doSearchLambda(_this._numericData, aSearchitem, function (lhs, rhs) {
                        return lhs - rhs;
                    }) + ".");
                });
                var searchKeys = [
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
                searchKeys.forEach(function (aKey) {
                    _this.$log.debug("Searching for key:", aKey);
                    var result = _this._doSearchGenericMoreEfficiently(_this._someUsers, aKey);
                    _this.$log.debug(result ? result : "Not found!");
                });
                //this.$log.debug("More efficient searching using ugly code.");
                this.$log.debug("*********************** UGLY SEARCH ************************");
                searchKeys.forEach(function (aKey) {
                    _this.$log.debug("Searching for key:", aKey);
                    var result = _this._compactBinarySearch(_this._someUsers, aKey);
                    _this.$log.debug(result ? result : "Not found!");
                });
            };
            BinSearchService.prototype._doSearchGeneric = function (sortedSearchData, searchingFor) {
                //this.$log.debug("_doSearchGeneric: Searching in searchData for item:", searchData, searchingFor);
                if (sortedSearchData.length < 1) {
                    return null;
                }
                var currentIndex = Math.floor(sortedSearchData.length / 2);
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
            };
            BinSearchService.prototype._doSearchGenericMoreEfficiently = function (sortedSearchData, searchingFor, leftBracketIndex, rightBracketIndex) {
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
                var currentIndex = Math.floor((rightBracketIndex - leftBracketIndex) / 2) + leftBracketIndex;
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
            };
            BinSearchService.prototype._compactBinarySearch = function (sortedSearchData, searchingFor, leftBracketIndex, rightBracketIndex) {
                if (isNaN(leftBracketIndex)) {
                    leftBracketIndex = 0;
                    rightBracketIndex = sortedSearchData.length - 1;
                }
                // Pick a middle value within the brackets that we have been passed 
                var currentIndex = Math.floor((rightBracketIndex - leftBracketIndex) / 2) + leftBracketIndex;
                var candidateItem = sortedSearchData[currentIndex];
                return candidateItem.IsEqualTo(searchingFor) ? candidateItem :
                    (rightBracketIndex === leftBracketIndex ? null : (candidateItem.IsGreaterThan(searchingFor) ? this._compactBinarySearch(sortedSearchData, searchingFor, leftBracketIndex, currentIndex - 1) :
                        this._compactBinarySearch(sortedSearchData, searchingFor, currentIndex + 1, rightBracketIndex)));
            };
            BinSearchService.prototype._doSearchLambda = function (searchData, searchFor, compareFunc) {
                var currentIndex = Math.floor(searchData.length / 2);
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
            };
            BinSearchService.$inject = ["$log"];
            return BinSearchService;
        }());
        Services.BinSearchService = BinSearchService;
        angular
            .module('bitsAndPieces')
            .service(serviceId, BinSearchService);
    })(Services = Nivlag.Services || (Nivlag.Services = {}));
})(Nivlag || (Nivlag = {}));
//# sourceMappingURL=BinSearchService.js.map