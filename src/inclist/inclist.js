//var underscore = angular.module('underscore', []);
//underscore.factory('_', function() {
//  return window._;
//});

angular.module('angular-ui-addons.inclist', []) //['underscore'])

    .directive("inclist", ['$compile', '$parse', '$q', '$timeout', '$document',
      function ($compile, $parse, $q, $timeout, $document, $position) {

        return {
//        require: 'ngModel',
          link: function (originalScope, element, attrs, modelCtrl) {

            console.log(originalScope, element, attrs, modelCtrl)

          }

        }

      }])

    .directive('inclistInput', function () {
      return {
        restrict: "E",

        scope: {
          list: '=inclistInputList',
          propSelection: '=inclistInputPropSelection'
        },

        templateUrl: 'templates/inclist/inclist-input.html',

        controller: ["$scope", function ($scope) {

          $scope.addPropertyToList = function () {
            if ($scope.propSelection != "" && $scope.propSelection != undefined) {
              $scope.list.push({id: Date.now(), name: $scope.propSelection});
              $scope.propSelection = "";
            }
          };

        }],

        link: function (scope, element, attrs) {


        }
      }

    })

    .directive('inclistOut', function () {

      return {
        restrict: "E",

        scope: {list: '=inclistOutList'},

        templateUrl: 'templates/inclist/inclist-out-list.html',

        controller: ["$scope", function ($scope) {
          $scope.removeItem = function (itemId) {

            var _res = [];

            angular.forEach($scope.list, function (item) { if (item.id != itemId) _res.push(item) });

            $scope.list = _res;

          }
        }],

        link: function (scope, element, attrs) {


        }
      }
    });



