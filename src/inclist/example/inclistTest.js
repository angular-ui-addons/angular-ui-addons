angular.module('inclistTest', ['ngSanitize', 'angular-ui-addons.inclist'])

    .filter('replace', function() {
      return function(text, needle, replacement) {
        return text.replace(needle, replacement);
      };
    })

    .controller("InclistTestCtrl", ["$scope", function ($scope) {

      $scope.inclistForm = {};

      // This to be extended
      $scope.list1 = [
        {id: "1", name: "Elephant"},
        {id: "2", name: "Monkey"},
        {id: "3", name: "Tiger"},
        {id: "4", name: "Zebra"}
      ];

      $scope.typeaheadSrc = [
        {id: "1", name: "Elephant", email: "mr.elephant@gmail.com"},
        {id: "2", name: "Monkey", email: "mr.monkey@gmail.com"},
        {id: "3", name: "Tiger", email: "mr.tiger@gmail.com"},
        {id: "4", name: "Zebra", email: "mr.zebra@gmail.com"}
      ];

      $scope.printForm = function() {
        console.log("inclistForm inclistFormItemInput", $scope.inclistForm.inclistFormItemInput);
      };

    }]);
