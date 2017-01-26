(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .service('cppService', cppService);

  cppService.$inject = ['workbench'];
  
  function cppService() {
    var me = this;
    
    me.onLoad = onLoad;
    
    me.activate = activate;
    me.deactivate = deactivate;
    
    
    function onLoad() {
      // init data structures
      // add templates to menu
    }
    
    function activate() {
      // show components
    }
    
    function deactivate() {
      // hide components
    }
    
  }
  
})();
