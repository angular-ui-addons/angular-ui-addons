/*
 * angular-ui-addons
 * http://angular-ui-addons.github.io

 * Version: 0.1.8 - 2015-07-12
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
            return actual !== undefined && actual.indexOf !== undefined &&
                actual.toLowerCase().indexOf(expected.toLowerCase()) > -1;
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
          items: '=inclistItems',
          validate: '&inclistValidate'
        },

        controller: function ($scope) {

          $scope.typeaheadItems = [];

          this.addItem = function (selection) {

            if ($scope.validate && !$scope.validate({
                  selection: selection,
                  items: $scope.items
                })) {
              return;
            }

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
              if ($scope.inclistForm) {
                $scope.inclistForm.$setDirty();
                $scope.checkItemsValidity();
              }
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
            if ($scope.inclistForm) {
              $scope.inclistForm.$setDirty();
              $scope.checkItemsValidity();
            }
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

          $scope.checkItemsValidity = function () {
            if ($scope.itemsRequired) {
              if ($scope.items.length === 0) {
                $scope.inclistForm.$setValidity('required-items', false);
              } else {
                $scope.inclistForm.$setValidity('required-items', true);
              }
            }
          };

        },

        link: function (scope, element, attrs) {
          scope.isUnique = angular.isDefined(attrs.inclistUnique);

          scope.itemsField = attrs.inclistField;

          scope.itemsRequired = angular.isDefined(attrs.required);

          // Watch inclistForm validity
          scope.$watch(
              function () {
                return scope.inclistForm ? scope.inclistForm.$valid : undefined;
              },
              function () {
                if (scope.inclistForm && scope.inclistForm.$valid) {
                  element.addClass('ng-valid');
                  element.removeClass('ng-invalid');
                }
                else {
                  element.addClass('ng-invalid');
                  element.removeClass('ng-valid');
                }
              }
          );

          scope.$watch(
              function () {
                return scope.inclistForm ? scope.inclistForm.$dirty : undefined;
              },
              function () {
                if (scope.inclistForm && scope.inclistForm.$dirty) {
                  element.addClass('ng-dirty');
                }
              }
          );

          scope.$watch(
              function () {
                return scope.inclistFocused;
              },
              function () {
                if (scope.inclistFocused) {
                  element.addClass("focus");
                }
                else {
                  element.removeClass("focus");
                }
                if (scope.inclistFocused === false && scope.inclistForm && scope.inclistForm.$dirty) {
                  element.addClass('ng-blur-after-edit');
                }
                if (scope.inclistFocused === false) {
                  scope.checkItemsValidity();
                }
              }
          );

          element.bind("click", function () {
            element.find('input')[0].focus();
          });
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
            $timeout(function () {
              $scope.addItemFromSelection($item);
            }, 0);
          };

        }],

        compile: function (tElement, tAttrs) {
          tElement.find('form').attr('name', 'inclistForm');

          var inputEl = tElement.find('input');

          inputEl.attr('type', tAttrs.inputType);
          inputEl.attr('name', 'selection');
          inputEl.attr('ng-model', 'selection');

          if (angular.isDefined(tAttrs.typeaheadItems)) {

            if (tAttrs.typeaheadFilterField) {
              inputEl.attr(
                  'typeahead',
                  'item as item.' + tAttrs.typeaheadLabelField +
                  ' for item in typeaheadItems | filter:{' +
                  tAttrs.typeaheadFilterField +
                  ':$viewValue}:emptyOrMatch | limitTo:20'
              );
            }
            else {
              inputEl.attr(
                  'typeahead',
                  'item as item for item in typeaheadItems | filter:$viewValue:emptyOrMatch | limitTo:20'
              );
            }

            if (tAttrs.typeaheadTemplate) {
              inputEl.attr('typeahead-template-url', tAttrs.typeaheadTemplate);
            }

            inputEl.attr('typeahead-min-length', '0');

            inputEl.attr('typeahead-focus', '');

            inputEl.attr('typeahead-on-select', 'typeaheadOnSelect($item, $model, $label)');

          }

          inputEl.attr('ng-focus', 'inputOnFocus()');
          inputEl.attr('ng-blur', 'inputOnBlur()');
          inputEl.attr('placeholder', tAttrs.placeholder);

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

              if (sel && !(sel instanceof Event) && !(jQuery !== undefined && sel instanceof jQuery.Event)) {
                scope.selection = sel;
              }

              if (!scope.selection || scope.selection.length === 0 || scope.selection === " ") {
                return 0;
              }

              console.log("addItemFromSelection scope.selection", scope.selection);

              var selection;

              if (scope.selection instanceof Object && scope.typeaheadItems) {
                selection = scope.selection[attrs.typeaheadLabelField];
              }
              else {
                selection = scope.selection;
              }

              if (selection && scope.inclistForm.selection.$valid && inclistCtrl.addItem(selection)) {
                scope.selection = "";
                if (!scope.$$phase) {
                  scope.$apply();
                }
              }
            };

            scope.inputOnBlur = function () {
              $timeout(function () {
                scope.addItemFromSelection();
                inclistCtrl.setInclistFocused(false);
              }, 0);
            };

            scope.inputOnFocus = function () {
              $timeout(function () {
                scope.addItemFromSelection();
                inclistCtrl.setInclistFocused(true);
              }, 0);
            };

            element.on('submit', scope.addItemFromSelection);
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