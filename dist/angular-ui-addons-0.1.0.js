/*
 * angular-ui-addons
 * http://angular-ui-addons.github.io

 * Version: 0.1.0 - 2014-01-15
 * License: MIT
 */
angular.module("angular-ui-addons", ["angular-ui-addons.inclist"]);
angular.module('angular-ui-addons.inclist', [])

    .directive('inclistInput', function () {
      return {
        restrict: "E",

        scope: {
          list: '=inclistInputList',
          propSelection: '=inclistInputPropSelection'
        },

        templateUrl: 'template/inclist/inclist-input.html',

        controller: ["$scope", function ($scope) {

          $scope.addPropertyToList = function () {
            if ($scope.propSelection !== "" && $scope.propSelection !== undefined) {
              $scope.list.push({id: Date.now(), name: $scope.propSelection});
              $scope.propSelection = "";
            }
          };

        }],

        link: function (scope, element, attrs) {


        }
      };

    })

    .directive('inclistOut', function () {

      return {
        restrict: "E",

        scope: {list: '=inclistOutList'},

        templateUrl: 'template/inclist/inclist-out-list.html',

        controller: ["$scope", function ($scope) {
          $scope.removeItem = function (itemId) {

            var _res = [];

            angular.forEach($scope.list, function (item) { if (item.id != itemId) { _res.push(item); } });

            $scope.list = _res;

          };
        }],

        link: function (scope, element, attrs) {


        }
      };
    });

