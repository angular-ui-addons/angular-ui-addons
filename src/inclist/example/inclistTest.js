angular.module('inclistTest', ['angular-ui-addons.inclist'])

    .controller("InclistCtrl", ["$scope", function ($scope) {

      // This to be extended
      $scope.list = [
        {id: "1", name: "name1"},
        {id: "2", name: "name2"},
        {id: "3", name: "name3"},
        {id: "4", name: "name4"}
      ];

      // Dunno why but this may be the "main's" scope variable
      $scope.propSelection = "";

    }]);
