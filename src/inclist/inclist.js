//var underscore = angular.module('underscore', []);
//underscore.factory('_', function() {
//  return window._;
//});

angular.module('angular-ui-addons', ['angular-ui-addons.templates', 'angular-ui-addons.inclist']);
angular.module('angular-ui-addons.templates', ['templates/inclist/inclist-input.html', 'templates/inclist/inclist-out-list.html']);

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

angular.module("templates/inclist/inclist-input.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/inclist/inclist-input.html",
      "<form ng-submit=\"addPropertyToList()\">" +
          "  <div class=\"input-group\">" +
          "    <input id=\"inputPropsList\" type=\"text\" ng-model=\"propSelection\" " +
          "    placeholder=\"Type here and press enter to add property\" " +
          "    autocomplete=\"off\" class=\"form-control\">" +
          "      <span class=\"input-group-btn\">" +
          "        <button class=\"btn btn-default\" type=\"submit\">+</button>" +
          "      </span>" +
          "    </div>" +
          "  </form>"
  );
}]);

angular.module("templates/inclist/inclist-out-list.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("templates/inclist/inclist-out-list.html",
      "<ul class=\"list-inline plates\">" +
          "  <li ng-repeat=\"item in list\">{{ item.name }} " +
          "    <button type=\"button\" class=\"close\" aria-hidden=\"true\" ng-click=\"removeItem(item.id)\">&times;</button>" +
          "  </li>" +
          "</ul>"
  );
}]);

