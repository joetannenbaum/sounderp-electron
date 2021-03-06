'use strict'

module.exports = function(app) {

    app.service('YouTube', ['$http', '$q', 'Config', function($http, $q, Config) {

        var key;
        var baseUrl = 'https://www.googleapis.com/youtube/v3';
        var obj = this;

        Config.get('base_url').then(function(url) {
            $http.get(url + '/config/youtube').then(function(response) {
                                        key = response.data.key;
                                    });
        });

        var regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/

        var msFromIsoDuration = function(duration) {
            var matches = duration.match(regex);

            return moment.duration({
              years: parseFloat(matches[3]),
              months: parseFloat(matches[5]),
              weeks: parseFloat(matches[7]),
              days: parseFloat(matches[9]),
              hours: parseFloat(matches[12]),
              minutes: parseFloat(matches[14]),
              seconds: parseFloat(matches[16])
            }).as('milliseconds');
        }

        this.getDetail = function(videoIds) {
            return $http.get(baseUrl + '/videos', {
                        params: {
                            key: key,
                            part: 'snippet,contentDetails',
                            id: videoIds.join(',')
                        }
                    }).then(function(response) {
                        return response;
                    });
        };

        var extractIdFromUrl = function(url) {
            var id = '';

            url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

            if (url[2] !== undefined) {
                id = url[2].split(/[^0-9a-z_\-]/i);
                return id[0];
            }

            return url;
        };

        this.searchFromUrl = function(url) {
            var id = extractIdFromUrl(url);

            return this.getDetail([id]).then(function(response) {
                var item = response.data.items[0];
                    return {
                        title: item.snippet.title,
                        art: {
                            full: item.snippet.thumbnails.maxres.url,
                            thumbnail: item.snippet.thumbnails.standard.url,
                        },
                        duration: msFromIsoDuration(item.contentDetails.duration),
                        sources: [
                            {
                                type: 'youtube',
                                url: url
                            }
                        ]
                    };
            });
        }

        var getClosestMatch = function(videoIds, duration) {

            return obj.getDetail(videoIds)
                        .then(function(results) {
                            var items = [];

                            _.each(results.data.items, function(item) {
                                items.push({
                                    id: item.id,
                                    difference: Math.abs(duration - msFromIsoDuration(item.contentDetails.duration))
                                });
                            });

                            return _.min(items, 'difference');
                        });
        }

        this.search = function(query, duration) {
            var deferred = $q.defer();

            $http.get(baseUrl + '/search', {
                params: {
                    key: key,
                    type: 'video',
                    part: 'id,snippet',
                    q: query
                }
            })
            .then( function (response) {
                var ids = [];

                _.each(response.data.items, function(item) {
                    ids.push(item.id.videoId);
                });

                getClosestMatch(ids, duration).then(function(response) {
                    response.url  = 'https://www.youtube.com/watch?v=' + response.id;
                    response.type = 'youtube';

                    deferred.resolve(response);
                });
            })
            .catch( function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
        };

    }]);

}
