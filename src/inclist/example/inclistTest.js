angular.module('inclistTest', ['angular-ui-addons.inclist'])

    .controller("InclistTestCtrl", ["$scope", function ($scope) {

      // This to be extended
      $scope.list1 = [
        {id: "1", name: "Elephant"},
        {id: "2", name: "Monkey"},
        {id: "3", name: "Tiger"},
        {id: "4", name: "Zebra"}
      ];

      $scope.typeaheadSrc = [
        {id: "1", name: "Elephant"},
        {id: "2", name: "Monkey"},
        {id: "3", name: "Tiger"},
        {id: "4", name: "Zebra"}
      ];

    }]);
