var lumensWall = angular.module('lumensWall');

lumensWall.controller('contactsController', function($scope, $state, $http, $rootScope, Account, DTOptionsBuilder) {

  $scope.contact = {};
  $scope.records = [];
  $scope.showDetail = 0;
  $scope.userData = {};


  $scope.init = function() {
    $scope.getContacts();
    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('aaSorting', [[0, 'desc']]);
  };



  $scope.getContacts = function() {

    Account.getContacts($rootScope.currentUser.token, $rootScope.currentUser.id)
    .success(function(data) {
      // console.log("data", data);
      $scope.records = data.content.data;
      console.log($scope.records);
    })
    .error(function(data) {
       console.log("Error", data);

    });
  };

  $scope.addContact = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;


    Account.addContact($scope.userData)
    .success(function(data) {

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = data.content.message;
      window.scrollTo(0, 0);
      $scope.getContacts();
    })
    .error(function(data) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;

        window.scrollTo(0, 0);

    });

  };

  $scope.editContact = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;


    Account.editContact($scope.userData)
    .success(function(data) {

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = data.content.message;
      window.scrollTo(0, 0);
      $scope.getContacts();
    })
    .error(function(data) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;

        window.scrollTo(0, 0);

    });

  };

  $scope.deleteContact = function(id) {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;
    $scope.userData.contact_id = id;


    Account.deleteContact($scope.userData)
    .success(function(data) {

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = data.content.message;
      window.scrollTo(0, 0);

      $state.go('contacts', {}, {reload: true});

    })
    .error(function(data) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;

        window.scrollTo(0, 0);


    });

  };

  $scope.txDetail = function(tx) {
    $scope.txItem = tx;
    $scope.txItem.textArray = $scope.txItem.text.split('\n');
    console.log($scope.txItem.textArray);
    $scope.showDetail = true;
  };

  $scope.hideDetail = function() {
    $scope.showDetail = false;
    $scope.txItem = {};
  };


  $scope.switchView = function(id, contact) {
    $scope.showDetail = id;
    $scope.contact = contact;
    $scope.userData = {};
    if (id == 2 || id == 3) {
      $scope.userData.contact_name = contact.name;
      $scope.userData.contact_accountId = contact.account_id;
      $scope.userData.contact_id = contact.id;
    }
  };





});