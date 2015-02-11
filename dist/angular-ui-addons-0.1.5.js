/*
 * angular-ui-addons
 * http://angular-ui-addons.github.io

 * Version: 0.1.5 - 2015-02-11
 * License: MIT
 */
angular.module("angular-ui-addons", ["angular-ui-addons.typeahead","angular-ui-addons.inclist","angular-ui-addons.validation"]);
angular.module('angular-ui-addons.typeahead', ['ui.bootstrap'])

    .directive('typeaheadFocus', function () {
      return {
        require: 'ngModel',

        link: function (scope, element, attr, ngModel) {

          console.log("typeaheadFocus processing");

          //trigger the popup on 'click' because 'focus'
          //is also triggered after the item selection
          element.bind('click', function () {

            console.log("typeaheadFocus triggering");

            var viewValue = ngModel.$viewValue;

            //restore to null value so that the typeahead can detect a change
            if (ngModel.$viewValue == ' ') {
              ngModel.$setViewValue(null);
            }

            //force trigger the popup
            ngModel.$setViewValue(' ');

            //set the actual value in case there was already a value in the input
            ngModel.$setViewValue(viewValue || ' ');
          });

          //compare function that treats the empty space as a match
          scope.emptyOrMatch = function (actual, expected) {
            if (expected == ' ') {
              return true;
            }
            return actual.indexOf(expected) > -1;
          };
        }
      };
    });


EMAIL_REGEXP = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+.[a-z0-9-]/;
URL_REGEXP = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;

angular.module('angular-ui-addons.inclist', ['ui.bootstrap', 'angular-ui-addons.typeahead'])

    .directive('inclist', function () {
      return {
        restrict: "AE",
        scope: {
          items: '=inclistItems'
        },

        controller: function ($scope) {

          $scope.typeaheadItems = [];

          this.addItem = function (selection) {

            console.log("addItem selection", selection);

            if (
                angular.isDefined(selection) &&
                selection !== "" &&
                (!$scope.isUnique || !_isItemExist(selection, $scope.items, $scope.itemsField)) &&
                (!$scope.typeaheadItems || $scope.typeaheadItems.length === 0 || !$scope.isTypeaheadRestrict || _isItemExist(selection, $scope.typeaheadItems, $scope.typeaheadLabelField) || ($scope.isTypeaheadRestrictValidExcl && $scope.inclistForm.$valid))
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
            angular.forEach($scope.items, function (item) {
              if (item[$scope.itemsField] != value) {
                result.push(item);
              }
            });
            $scope.items = result;
          };

          this.setTypeaheadItems = function (typeaheadItems) {
            $scope.typeaheadItems = typeaheadItems;
          };

          this.setTypeaheadOnSelect = function (typeaheadOnSelect) {
            $scope.typeaheadOnSelect = typeaheadOnSelect;
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

          this.setInclistForm = function (inclistForm) {
            $scope.inclistForm = inclistForm;
          };

          this.setInclistFocused = function (focused) {
            $scope.inclistFocused = focused;
          };

          var _isItemExist = function (value, list, labelField) {
            var exists = false;
            angular.forEach(list, function (item) {
              if (!exists) {
                console.log("searching item ", item, " in ", list, " by ", labelField, " for ", value);
                //console.log("searching in ", item, " by ", fieldNames);
                if (labelField !== undefined) {
                  if (item[labelField] == value) {
                    exists = true;
                  }
                }
                else {
                  if (item == value) {
                    exists = true;
                  }
                }
              }
            });
            return exists;
          };

          var _find = function (value, list, fieldName) {
            var result;
            angular.forEach(list, function (item) {
              if (item[fieldName] == value) {
                result = item;
              }
            });
            return result;
          };

        },

        link: function (scope, element, attrs) {
          scope.isUnique = angular.isDefined(attrs.inclistUnique);

          scope.itemsField = attrs.inclistField;

          // Watch inclistForm validity
          scope.$watch(
            function() { return scope.inclistForm ? scope.inclistForm.$valid : undefined; },
            function() {
              //console.log("inclist: form validity changed");
              //console.log("scope.inclistForm", scope.inclistForm);

              if (scope.inclistForm && scope.inclistForm.$invalid) {
                element.addClass('ng-invalid');
                element.removeClass('ng-valid');
              }
              else {
                element.addClass('ng-valid');
                element.removeClass('ng-invalid');
              }
            }
          );

          scope.$watch(
            function() { return scope.inclistForm ? scope.inclistForm.$dirty : undefined; },
            function() { if (scope.inclistForm && scope.inclistForm.$dirty) { element.addClass('ng-dirty'); } }
          );

          scope.$watch(
            function() { return scope.inclistFocused; },
            function() {
              if (scope.inclistFocused) {
                element.addClass("focus");
              }
              else {
                element.removeClass("focus");
              }
            }
          );

          element.bind("click", function() { element.find('input')[0].focus(); });
        }
      };
    })

    .directive('inclistInput', ['$timeout', function ($timeout) {
      return {
        require: "^inclist",
        restrict: "AE",
        scope: {
          typeaheadItems: "="
        },
        replace: true,
        templateUrl: 'template/inclist/inclist-input.html',

        controller: ['$scope', function ($scope) {

          $scope.typeaheadOnSelect = function ($item, $model, $label) {
            $timeout(function() { $scope.addItemFromSelection($item); }, 0);
          };

        }],

        compile: function (tElement, tAttrs) {
          console.log("tElement", tElement);

          tElement.find('form').attr('name', 'inclistForm');

          tElement.find('input').attr('type', tAttrs.inputType);
          tElement.find('input').attr('name', 'selection');
          tElement.find('input').attr('ng-model', 'selection');

          if (angular.isDefined(tAttrs.typeaheadItems)) {

            if (tAttrs.typeaheadLabelField) {
              tElement.find('input').attr(
                  'typeahead',
                  'item as item.' + tAttrs.typeaheadLabelField + ' for item in typeaheadItems | filter:$viewValue:emptyOrMatch | limitTo:20'
              );
            }
            else {
              tElement.find('input').attr(
                  'typeahead',
                  'item as item for item in typeaheadItems | filter:$viewValue:emptyOrMatch | limitTo:20'
              );
            }

            if (tAttrs.typeaheadTemplate) {
              tElement.find('input').attr('typeahead-template-url', tAttrs.typeaheadTemplate);
            }

            tElement.find('input').attr('typeahead-min-length', '0');

            tElement.find('input').attr('typeahead-focus', '');

            tElement.find('input').attr('typeahead-on-select', 'typeaheadOnSelect($item, $model, $label)');

          }

          tElement.find('input').attr('ng-focus', 'inputOnFocus()');
          tElement.find('input').attr('ng-blur', 'inputOnBlur()');
          tElement.find('input').attr('placeholder', tAttrs.placeholder);

          return function (scope, element, attrs, inclistCtrl) {

            console.log("inclistInput scope", scope);

            inclistCtrl.setInclistForm(scope.inclistForm);

            if (scope.typeaheadItems && scope.typeaheadItems instanceof Array) {
              inclistCtrl.setTypeaheadItems(scope.typeaheadItems);

              inclistCtrl.setTypeaheadLabelField(attrs.typeaheadLabelField);

              inclistCtrl.setTypeaheadRestrict(angular.isDefined(attrs.typeaheadRestrict));
              inclistCtrl.setTypeaheadRestrictValidExcl(angular.isDefined(attrs.typeaheadRestrictValidExcl));
            }

            scope.addItemFromSelection = function (sel) {

              if (sel && !(sel instanceof Event) && !(jQuery || sel instanceof jQuery.Event)) { scope.selection = sel; }

              if (!scope.selection || scope.selection.length === 0) { return 0; }

              console.log("addItemFromSelection scope.selection", scope.selection);

              var selection;

              if (scope.selection instanceof Object && scope.typeaheadItems) {
                selection = scope.selection[attrs.typeaheadLabelField];
              }
              else {
                selection = scope.selection;
              }

              if (selection && scope.inclistForm.$valid && inclistCtrl.addItem(selection)) {
                scope.selection = "";
                if (!scope.$$phase) { scope.$apply(); }
              }
            };

            scope.inputOnBlur = function () {
              $timeout(function() { scope.addItemFromSelection(); inclistCtrl.setInclistFocused(false); }, 0);
            };

            scope.inputOnFocus = function () {
              $timeout(function() { scope.addItemFromSelection(); inclistCtrl.setInclistFocused(true); }, 0);
            };

            element.on('submit', scope.addItemFromSelection);

            //console.log("inclistInput link scope", scope);

          };

        }

      };
    }])

    .directive('inclistOut', function () {
      return {
        require: "^inclist",
        restrict: "AE",
        scope: {},
        templateUrl: 'template/inclist/inclist-out-list.html',

        link: function (scope, element, attrs, inclistCtrl) {

          scope.items = inclistCtrl.getItems();

          scope.getFlatItem = function (item) {
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