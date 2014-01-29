/*
 * angular-ui-addons
 * http://angular-ui-addons.github.io

 * Version: 0.1.0 - 2014-01-30
 * License: MIT
 */
angular.module("angular-ui-addons", ["angular-ui-addons.inclist","angular-ui-addons.validation"]);
angular.module('angular-ui-addons.inclist', ['ui.bootstrap'])

    .directive('inclist', function () {
      return {
        restrict: "AE",
        scope: {
          items: '=inclistItems',
          typeaheadItems: '='
        },

        controller: function ($scope) {

          this.addItem = function (selection) {
            if (angular.isDefined(selection) && selection !== "" &&
                (!$scope.isUnique || !_isItemExist(selection, $scope.items, $scope.itemsField)) &&
                (!$scope.isTypeaheadRestrict || _isItemExist(selection, $scope.typeaheadItems, $scope.itemsField))) {
              var itemToAdd = _find(selection, $scope.typeaheadItems, $scope.itemsField);
              if (itemToAdd === undefined) {
                itemToAdd = {};
                itemToAdd['id'] = "id" + Date.now();
                itemToAdd[$scope.itemsField] = selection;
              }
              $scope.items.push(itemToAdd);
              return true;
            }
            return false;
          };

          this.getItems = function () {
            return $scope.items;
          };

          this.getFlatItem = function (item) {
            if (angular.isObject(item) && angular.isUndefined(item[$scope.itemsField])) {
              var error = "Inclist list item should be an object with " +
                  "'" + $scope.itemsField + "' field to extract string value from";
              console.error(error);
              throw new Error(error);

            }
            return item[$scope.itemsField];
          };

          this.removeItem = function (value) {
            var result = [];
            angular.forEach($scope.items, function (item) { if (item[$scope.itemsField] != value) { result.push(item); } });
            $scope.items = result;
          };

          this.getTypeaheadFlatItems = function () {
            var result = [];
            angular.forEach($scope.typeaheadItems,
                function (item) {
                  if (angular.isObject(item) && angular.isUndefined(item[$scope.itemsField])) {
                    throw new Error("Typeahead list should contain objects with " +
                        "'" + $scope.itemsField + "' field to extract string value from");
                  }
                  result.push(item[$scope.itemsField]);
                }
            );
            return result;
          };

          var _isItemExist = function (value, list, fieldName) {
            var result = false;
            angular.forEach(list, function (item) {
              if (item[fieldName] == value) { result = true; }
            });
            return result;
          };

          var _find = function (value, list, fieldName) {
            var result;
            angular.forEach(list, function (item) {
              if (item[fieldName] == value) { result = item; }
            });
            return result;
          };

        },

        link: function (scope, element, attrs) {
          scope.isUnique = angular.isDefined(attrs.inclistUnique);
          scope.isTypeaheadRestrict = angular.isDefined(attrs.typeaheadRestrict);
          scope.itemsField = attrs.inclistField;
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

          tElement.find('input').attr('typeahead', 'item for item in getTypeaheadItems() | filter:$viewValue');

          return function (scope, element, attrs, inclistCtrl) {

            // Override placeholder if new one is defined
            element.find('input').attr('placeholder', attrs.placeholder);

            scope.addItemFromSelection = function () {
              if (inclistCtrl.addItem(scope.selection)) {
                scope.selection = "";
                scope.$apply();
              }
            };

            scope.getTypeaheadItems = function() {
              var typeaheadItems = inclistCtrl.getTypeaheadFlatItems();
              return angular.isDefined(typeaheadItems) ? typeaheadItems : [];
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

          scope.getFlatItem = function(item) {
            return inclistCtrl.getFlatItem(item);
          };

          scope.removeItem = function (item) {
            inclistCtrl.removeItem(scope.getFlatItem(item));
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