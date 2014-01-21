angular.module('angular-ui-addons.inclist', ['ui.bootstrap'])

    .directive('inclist', function () {
      return {
        restrict: "AE",
        scope: {
          items: '=',
          typeaheadItems: '='
        },

        controller: function ($scope) {

          this.addItem = function (selection) {
            var rawItems = [];
            angular.forEach($scope.items, function(item) { rawItems.push(item.name); });

            if (angular.isDefined(selection) && selection != ""
                && (!$scope.isUnique || !_isItemExistIn(selection, rawItems))
                && (!$scope.isTypeaheadRestrict || _isItemExistIn(selection, this.getTypeaheadItems()))) {
              $scope.items.push({id: "item-" + Date.now(), name: selection});
              return true;
            }
            return false;
          };

          this.getItems = function () {
            return $scope.items;
          };

          this.removeItem = function (itemId) {
            var result = [];
            angular.forEach($scope.items, function (item) { if (item.id != itemId) { result.push(item); } });
            $scope.items = result;
          };

          this.getTypeaheadItems = function () {
            var result = [];
            angular.forEach($scope.typeaheadItems,
                function (item) {
                  if (angular.isObject(item) && angular.isUndefined(item.name))
                    throw Error("Typeahead list should contain plain strings or objects with " +
                        "'name' field to extract plain string from");
                  result.push(angular.isObject(item) ? item.name : item)
                }
            );
            return result;
          };

          var _isItemExistIn = function (value, list) {
            var result = false;
            angular.forEach(list, function (item) {
              if (item == value) { result = true; }
            });
            return result;
          };

        },

        link: function (scope, element, attrs) {
          scope.isUnique = angular.isDefined(attrs.inclistUnique);
          scope.isTypeaheadRestrict = angular.isDefined(attrs.inclistTypeaheadRestrict);
          console.log("Restrict = " + scope.isTypeaheadRestrict);
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
              var typeaheadItems = inclistCtrl.getTypeaheadItems();
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

          scope.removeItem = function (item) {
            inclistCtrl.removeItem(item);
            scope.items = inclistCtrl.getItems();
          };

        }
      };
    });

