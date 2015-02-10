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

          this.addItem = function (selection, validForRestrictExcl) {

            console.log("addItem selection", selection);

            if (
                angular.isDefined(selection) &&
                selection !== "" &&
                (!$scope.isUnique || !_isItemExist(selection, $scope.items, $scope.itemsField)) &&
                (!$scope.typeaheadItems || $scope.typeaheadItems.length === 0 || !$scope.isTypeaheadRestrict || _isItemExist(selection, $scope.typeaheadItems, $scope.typeaheadLabelField) || ($scope.isTypeaheadRestrictValidExcl && validForRestrictExcl))
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
        }
      };
    })

    .directive('inclistInput', ['$timeout', function ($timeout) {
      return {
        require: "^inclist",
        restrict: "AE",
        scope: {
          inclistForm: "@",
          typeaheadItems: "="
        },
        replace: true,
        templateUrl: 'template/inclist/inclist-input.html',

        compile: function (tElement, tAttrs) {

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

            tElement.find('input').attr('ng-blur', 'typeaheadInputOnBlur()');

          }

          return function (scope, element, attrs, inclistCtrl) {

            console.log("inclistInput scope", scope);

            // Override placeholder if new one is defined
            element.find('input').attr('placeholder', attrs.placeholder);

            if (scope.typeaheadItems && scope.typeaheadItems instanceof Array) {
              inclistCtrl.setTypeaheadItems(scope.typeaheadItems);

              inclistCtrl.setTypeaheadLabelField(attrs.typeaheadLabelField);

              inclistCtrl.setTypeaheadRestrict(angular.isDefined(attrs.typeaheadRestrict));
              inclistCtrl.setTypeaheadRestrictValidExcl(angular.isDefined(attrs.typeaheadRestrictValidExcl));
            }

            scope.addItemFromSelection = function (sel) {

              if (sel && !(sel instanceof Event) && !(jQuery || sel instanceof jQuery.Event)) { scope.selection = sel; }

              console.log("addItemFromSelection scope.selection", scope.selection);

              var selection;

              if (scope.selection instanceof Object && scope.typeaheadItems) {
                selection = scope.selection[attrs.typeaheadLabelField];
              }
              else {
                if (tAttrs.inputType == 'email' && !scope.selection.match(EMAIL_REGEXP)) {
                  return 0;
                }
                else if (tAttrs.inputType == 'url' && !scope.selection.match(URL_REGEXP)) {
                  return 0;
                }
                selection = scope.selection;
              }

              if (inclistCtrl.addItem(selection, scope[scope.inclistForm].$valid)) {
                scope.selection = "";
                scope.$apply();
              }
            };

            scope.typeaheadOnSelect = function ($item, $model, $label) {
              $timeout(function() { scope.addItemFromSelection($item); }, 0);
            };

            scope.typeaheadInputOnBlur = function () {
              $timeout(function() { scope.addItemFromSelection(); }, 0);
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

