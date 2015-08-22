'use strict'

module.exports = function(app) {

    app.service('Config', ['$http', function($http) {

        this.get = function(item) {
            return $http.get('config.json').then(function(response) {
                return response.data[item];
            });
        }

    }]);

};
