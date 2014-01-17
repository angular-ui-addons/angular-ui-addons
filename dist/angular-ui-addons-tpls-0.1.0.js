/*
 * angular-ui-addons
 * http://angular-ui-addons.github.io

 * Version: 0.1.0 - 2014-01-17
 * License: MIT
 */
angular.module("angular-ui-addons", ["angular-ui-addons.templates", "angular-ui-addons.inclist","angular-ui-addons.validation"]);
angular.module("angular-ui-addons.templates", ["template/inclist/inclist-input.html","template/inclist/inclist-out-list.html"]);
angular.module('angular-ui-addons.inclist', [])

    .directive('inclist', function () {
      return {
        restrict: "AE",
        scope: {items: '='},

        controller: function ($scope) {

          this.getItems = function () {
            return $scope.items;
          };

          this.addItem = function (selection) {
            if (selection !== "" && selection !== undefined) {
              $scope.items.push({id: "item-" + Date.now(), name: selection});
            }
          };

          this.removeItem = function (itemId) {
            var _res = [];
            angular.forEach($scope.items, function (item) { if (item.id != itemId) { _res.push(item); } });
            $scope.items = _res;
          };

          this.getItems = function () { return $scope.items; };

        }
      };
    })

    .directive('inclistInput', function () {
      return {
        require: "^inclist",
        restrict: "AE",
        scope: {},
        replace: true,
        templateUrl: 'template/inclist/inclist-input.html',

        compile: function (tElement, tAttrs) {

          tElement.find('input').attr('ng-model', 'selection');

          return function (scope, element, attrs, inclistCtrl) {

            // Override placeholder if new one is defined
            element.find('input').attr('placeholder', attrs.placeholder);

            scope.addItemFromSelection = function () {
              inclistCtrl.addItem(scope.selection);
              scope.selection = "";
              scope.$apply();
            };

            element.on('submit', scope.addItemFromSelection);

          };

        }

      };
    })

    .directive('inclistOut', function () {
      return {
        require: "^inclist",
        restrict: "AE",
        scope: {},
        templateUrl: 'template/inclist/inclist-out-list.html',

        link: function (scope, element, attrs, inclistCtrl) {

          scope.items = inclistCtrl.getItems();

          scope.removeItem = function (item) {
            inclistCtrl.removeItem(item);
            scope.items = inclistCtrl.getItems();
          };

        }
      };
    });


angular.module('angular-ui-addons.validation', [])

    .directive('strongPassword', function () {

      var isValid = function(pass) {
        return pass && pass.length > 6;
      };


      return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
//          console.log(scope);

          ngModelCtrl.$parsers.unshift(function (viewValue) {
            var valid = isValid(viewValue);

            ngModelCtrl.$setValidity('strongPass', valid);
            return viewValue;
          });

          ngModelCtrl.$formatters.unshift(function (modelValue) {

            var valid = isValid(modelValue);

            ngModelCtrl.$setValidity('strongPass', valid);
            return modelValue;
          });

        }
      };
    });
angular.module("template/inclist/inclist-input.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/inclist/inclist-input.html",
    "<form>\n" +
    "  <!--\n" +
    "    If using custom template you have to use <form> and <input> elements for the same as in current template\n" +
    "    as of the directive 'inclist-input' will inject appropriate behavior based on these elements.\n" +
    "  -->\n" +
    "  <div class=\"input-group\">\n" +
    "    <input type=\"text\" autocomplete=\"off\" class=\"form-control\"\n" +
    "           placeholder=\"Type here and press enter to add property\">\n" +
    "\n" +
    "    <span class=\"input-group-btn\"><button class=\"btn btn-default\" type=\"submit\">+</button></span>\n" +
    "  </div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("template/inclist/inclist-out-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/inclist/inclist-out-list.html",
    "<ul class=\"list-inline plates\">\n" +
    "  <li ng-repeat=\"item in items\">{{ item.name }}\n" +
    "    <button type=\"button\" class=\"close\" aria-hidden=\"true\" ng-click=\"removeItem(item.id)\">&times;</button>\n" +
    "  </li>\n" +
    "</ul>");
}]);
