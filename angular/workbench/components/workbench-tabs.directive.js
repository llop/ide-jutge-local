(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgTabs', tabs);
    
  tabs.$inject = ['workbench'];

  function tabs(workbench) {

    function link(scope, element, attrs) {
      workbench.ui.tabs = element;
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
