angular.module('angular-ui-addons.inclist', ['ui.bootstrap'])

    .directive('inclist', function () {
      return {
        restrict: "AE",
        scope: {
          items: '=inclistItems',
          typeaheadItems: '='
        },

        controller: function ($scope) {

          this.addItem = function (selection, validForRestrictExcl) {
            if (
                angular.isDefined(selection) &&
                selection !== "" &&
                (!$scope.isUnique || !_isItemExist(selection, $scope.items, $scope.itemsField)) &&
                (!$scope.isTypeaheadRestrict || _isItemExist(selection, $scope.typeaheadItems, $scope.typeaheadItemsSearchFields) || $scope.isTypeaheadRestrictValidExcl) &&
                (!$scope.isTypeaheadRestrictValidExcl || _isItemExist(selection, $scope.typeaheadItems, $scope.typeaheadItemsSearchFields) || validForRestrictExcl)
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

          //var _isItemExist = function (value, list, fieldName) {
          //  var result = false;
          //  angular.forEach(list, function (item) {
          //    if (item[fieldName] == value) { result = true; }
          //  });
          //  return result;
          //};

          var _isItemExist = function (value, list, fieldNames) {
            var exists = false;
            angular.forEach(list, function (item) {
              if (!exists) {
                console.log("searching item ", item, " in ", list, " by ", fieldNames, " for ", value);
                //console.log("searching in ", item, " by ", fieldNames);
                if (fieldNames instanceof Array) {
                  angular.forEach(fieldNames, function (fieldName) {
                    if (item[fieldName] == value) { exists = true; }
                    console.log("s:::: ", fieldName, item[fieldName], value, exists);
                  });
                }
                else {
                  if (item[fieldNames] == value) { exists = true; }
                  console.log("s!!!!! ", fieldNames, item[fieldNames], value, exists);
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
          scope.isTypeaheadRestrict = angular.isDefined(attrs.typeaheadRestrict);
          scope.isTypeaheadRestrictValidExcl = angular.isDefined(attrs.typeaheadRestrictValidExcl);

          if (angular.isDefined(attrs.typeaheadItemsSearchFields)) {
            scope.typeaheadItemsSearchFields = attrs.typeaheadItemsSearchFields.replace(/\s+/, "").split(",");
          }
          else {
            scope.typeaheadItemsSearchFields = "name";
          }

          scope.itemsField = attrs.inclistField;

          console.log("scope.typeaheadItemsSearchFields", scope.typeaheadItemsSearchFields);
        }
      };
    })

    .directive('inclistInput', function () {
      return {
        require: "^inclist",
        restrict: "AE",
        scope: {
          inclistForm: "="
        },
        replace: true,
        templateUrl: 'template/inclist/inclist-input.html',

        compile: function (tElement, tAttrs) {

          tElement.find('input').attr('ng-model', 'selection');

          tElement.find('input').attr('typeahead', 'item for item in getTypeaheadItems() | filter:$viewValue');

          if (tAttrs.inputType) {
            tElement.find('input').attr('type', tAttrs.inputType);
            console.log("inclistForm inputType", tAttrs.inputType);
          }

          return function (scope, element, attrs, inclistCtrl) {

            //console.log("inclistForm", scope.inclistForm);

            // Override placeholder if new one is defined
            element.find('input').attr('placeholder', attrs.placeholder);

            //if (attrs.inputType) {
            //  element.find('input').attr('type', attrs.inputType);
            //  console.log("inclistForm inputType", attrs.inputType);
            //}

            scope.addItemFromSelection = function () {

              if (inclistCtrl.addItem(scope.selection, !scope.inclistForm.inclistFormItemInput.$error.email)) {
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

