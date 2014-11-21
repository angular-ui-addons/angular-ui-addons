/*
 * angular-ui-addons
 * http://angular-ui-addons.github.io

 * Version: 0.1.3 - 2014-11-21
 * License: MIT
 */
angular.module("angular-ui-addons", ["angular-ui-addons.inclist","angular-ui-addons.validation"]);
angular.module('angular-ui-addons.inclist', ['ui.bootstrap'])

    .directive('inclist', function () {
      return {
        restrict: "AE",
        scope: {
          items: '=inclistItems'
        },

        controller: function ($scope) {

          $scope.typeaheadItems = [];

          this.addItem = function (selection, validForRestrictExcl) {

            console.log("addItem selection", selection);

            if (
                angular.isDefined(selection) &&
                selection !== "" &&
                (!$scope.isUnique || !_isItemExist(selection, $scope.items, $scope.itemsField)) &&
                (!$scope.isTypeaheadRestrict || _isItemExist(selection, $scope.typeaheadItems, $scope.typeaheadLabelField) || ($scope.isTypeaheadRestrictValidExcl && validForRestrictExcl))
            ) {
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

          this.setTypeaheadItems = function (typeaheadItems) {
            $scope.typeaheadItems = typeaheadItems;
          };

          this.setTypeaheadRestrict = function (isTypeaheadRestrict) {
            $scope.isTypeaheadRestrict = isTypeaheadRestrict;
          };

          this.setTypeaheadRestrictValidExcl = function (isTypeaheadRestrictValidExcl) {
            $scope.isTypeaheadRestrictValidExcl = isTypeaheadRestrictValidExcl;
          };

          this.setTypeaheadLabelField = function (typeaheadLabelField) {
            $scope.typeaheadLabelField = typeaheadLabelField;
          };

          //var _isItemExist = function (value, list, fieldName) {
          //  var result = false;
          //  angular.forEach(list, function (item) {
          //    if (item[fieldName] == value) { result = true; }
          //  });
          //  return result;
          //};

          var _isItemExist = function (value, list, labelField) {
            var exists = false;
            angular.forEach(list, function (item) {
              if (!exists) {
                console.log("searching item ", item, " in ", list, " by ", labelField, " for ", value);
                //console.log("searching in ", item, " by ", fieldNames);
                if (labelField !== undefined) {
                  if (item[labelField] == value) { exists = true; }
                }
                else {
                  if (item == value) { exists = true; }
                }
              }
            });
            return exists;
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

          scope.itemsField = attrs.inclistField;
        }
      };
    })

    .directive('inclistInput', function () {
      return {
        require: "^inclist",
        restrict: "AE",
        scope: {
          inclistForm: "=",
          typeaheadItems: "="
        },
        replace: true,
        templateUrl: 'template/inclist/inclist-input.html',

        compile: function (tElement, tAttrs) {

          tElement.find('input').attr('ng-model', 'selection');

          if (tAttrs.typeaheadLabelField) {
            tElement.find('input').attr(
              'typeahead',
              'item as item.'+tAttrs.typeaheadLabelField+' for item in typeaheadItems | filter:$viewValue'
            );
          }
          else {
            tElement.find('input').attr(
              'typeahead',
              'item as item for item in typeaheadItems | filter:$viewValue'
            );
          }

          if (tAttrs.typeaheadTemplate) {
            tElement.find('input').attr('typeahead-template-url', tAttrs.typeaheadTemplate);
          }

          return function (scope, element, attrs, inclistCtrl) {

            console.log("inclistInput scope", scope);

            // Override placeholder if new one is defined
            element.find('input').attr('placeholder', attrs.placeholder);

            if (scope.typeaheadItems && scope.typeaheadItems instanceof Array) {
              inclistCtrl.setTypeaheadItems(scope.typeaheadItems);
            }
            inclistCtrl.setTypeaheadLabelField(attrs.typeaheadLabelField);

            inclistCtrl.setTypeaheadRestrict(angular.isDefined(attrs.typeaheadRestrict));
            inclistCtrl.setTypeaheadRestrictValidExcl(angular.isDefined(attrs.typeaheadRestrictValidExcl));

            scope.addItemFromSelection = function () {

              console.log("addItemFromSelection scope.selection", scope.selection);

              var selection;

              if (scope.selection instanceof Object) {
                selection = scope.selection[attrs.typeaheadLabelField];
              }
              else {
                if (tAttrs.inputType == 'email' && !scope.selection.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+.[a-z0-9-]/)) {
                  return 0;
                }
                selection = scope.selection;
              }

              if (inclistCtrl.addItem(selection, scope.inclistForm.$valid)) {
                scope.selection = "";
                scope.$apply();
              }
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