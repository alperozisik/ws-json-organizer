(function(define) {

    define(function(require, exports, module) {
        var reSplit = /(\}|\])(?:\s*)(\{|\[)/g;

        function parseJSONMessage(chunk, thisObject) {
            var response = [];
            try {
                if (typeof chunk === "string")
                    response = [JSON.parse(chunk)];
                else
                    response = chunk;
            }
            catch (e) {
                try {
                    reSplit.lastIndex = 0;
                    var r = chunk.split(reSplit),
                        completeResult = [],
                        tmp;
                    if (r.length > 1) {
                        completeResult.push(JSON.parse(r.shift() + r.shift()));
                    }
                    if (r.length > 1) {
                        tmp = r.pop();
                        completeResult.push(JSON.parse(r.pop() + tmp));
                    }
                    while (r.length > 2) {
                        completeResult.splice(completeResult.length - 1, 0, JSON.parse(r.shift() + r.shift() + r.shift()));
                    }
                    if (r.length > 0) {
                        handleError();
                    }
                    response = completeResult;

                }
                catch (e) {
                    handleError();
                }
            }

            function handleError() {
                var firstLetter = chunk[0],
                    lastLetter = chunk[chunk.length - 1];
                var cacheIndex = incompleteJSONCache.addParent((thisObject));
                var cache = incompleteJSONCache.caches[cacheIndex];
                if (!cache) debugger;
                cache.push(chunk);
                var combinedChunk = cache.join("");
                firstLetter = combinedChunk[0];
                lastLetter = combinedChunk[combinedChunk.length - 1];
                if ((firstLetter === "{" || firstLetter === "[") && (lastLetter === "}" || lastLetter === "]")) {
                    parseJSONMessage(combinedChunk, thisObject);
                }
            }

            if (response.length > 0) {
                incompleteJSONCache.clearCacheOfParent(thisObject);
            }
            return response;
        }

        /**
         * Parses multiple JSONs in a single string
         * @param {String} data - (Required) string data to be parsed
         * @param {Function} callback - (Required) error first type callback fired for each JSON in string, passing parsed JSON as JS Object
         * @param {Object} thisObject - (Optional) "this" object to set for the callback
         */
        function parseEachJSON(data, callback, thisObject) {
            thisObject = thisObject || this;
            var result;
            try {
                result = parseJSONMessage(data, thisObject);
            }
            catch (ex) {
                callback.call(thisObject, ex);
                return;
            }

            result.forEach(function(item) {
                callback.call(thisObject, null, item);
            });
        }

        var incompleteJSONCache = {
            parents: [],
            caches: [],
            addParent: function addParent(parent) {
                var index = this.parents.indexOf(parent);
                if (index === -1) {
                    index = this.parents.push(parent) - 1;
                    this.caches[index] = [];
                }
                return index;
            },
            clearCacheOfParent: function clearCacheOfParent(parent) {
                var index = this.parents.indexOf(parent);
                if (index !== -1) {
                    this.caches[index] = [];
                }
            }
        };

        module.exports = parseEachJSON;
    });

}(
    typeof module === 'object' && module.exports && typeof define !== 'function' ?
    function(factory) {
        factory(require, exports, module);
    } :
    define
));