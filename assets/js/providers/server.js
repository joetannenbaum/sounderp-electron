'use strict'

module.exports = function(app) {

    app.service('Server', ['$http', '$q', 'Config', function($http, $q, Config) {

        this.processTrack = function(data) {
            return Config.get('base_url').then(function(url) {
                return $http.post(url + '/track/process', data);
            });
        }

        this.rebuildPlaylist = function(data) {
            return Config.get('base_url').then(function(url) {
                return $http.post(url + '/playlist', { playlist: data })
            });
        }

    }]);

}
