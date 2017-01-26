(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .controller('WorkbenchController', workbenchController);

  workbenchController.$inject = ['$scope', 'workbench'];

  function workbenchController($scope, workbench) {
    //-------------------------------------------------------------------------
    // setup
    //-------------------------------------------------------------------------
    var me = this;

    me.boxReady = false;

    me.ui = {
      editor: undefined,
      pluginPanel: undefined,
      
      tabs: undefined,
      terminal: undefined,
      problems: undefined,
      
      menu: {},
      status: undefined
    };

    init();

    //-------------------------------------------------------------------------
    // activation
    //-------------------------------------------------------------------------
    function init() {
      workbench.ui = me.ui;
      // get a sandbox
      workbench.socket.on('box-ready', onBoxReady);
      workbench.socket.emit('box-request');
    }

    //-------------------------------------------------------------------------
    // event handlers
    //-------------------------------------------------------------------------

    // handle sandbox load
    function onBoxReady() {
      me.boxReady = true;
      $scope.$broadcast('box-ready');
    }  
    
  }


})();
