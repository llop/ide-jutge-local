(function() {
  'use strict';

  angular
    .module('ide.jutge.easyui')
    .directive('jtgEasyuiDisabled', easyuiDisabled);
    
  function easyuiDisabled() {

    function link(scope, element, attrs) {
      var easyuiComponent = undefined;
      var classList = attrs['class'].split(/\s+/);
      for (var i = 0; i < classList.length; ++i) 
        if (classList[i].startsWith('easyui-')) {
          easyuiComponent = classList[i].substring(7);
          break;
        }
          
      if (easyuiComponent != undefined) 
        scope.$watch(attrs['jtgEasyuiDisabled'], watchAction);
      
      
      function watchAction(value) {
        var func = value ? 'disable' : 'enable';
        element[easyuiComponent](func);
      }
            
    }
    
    return {
      restrict: 'A',
      link: link
    };
  }

})();
