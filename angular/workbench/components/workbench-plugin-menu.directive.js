(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgPluginMenu', pluginMenu);

  pluginMenu.$inject = ['workbench'];

  function pluginMenu(workbench) {
    
    function link(scope, element, attrs) {
      workbench.ui.menu.plugins = element;
      
      // have easyUI do its thang
      element = element.menu();
      
      //-----------------------------------------------------------------------
      // init plugins menu
      //-----------------------------------------------------------------------
      
      var selectedPluginBtn = undefined;
      
      for (var pluginId in workbench.plugins) {
        var pluginConfig = workbench.plugins[pluginId];
        var pluginName = pluginConfig.name;
        var b = pluginId == workbench.firstPlugin;
        appendPluginsMenuItem(pluginId, pluginName, b);
      }
      
      function appendPluginsMenuItem(pluginId, pluginName, b) {
        element.menu('appendItem', {
	        text: pluginName,
	        iconCls: b ? 'icon-ok' : 'icon-blank',
	        onclick: onPluginBtnClick
        });
        
        if (b) {
          var item = element.menu('findItem', pluginName);
          selectedPluginBtn = item.target;
        }
        
        function onPluginBtnClick() {
          element.menu('setIcon', { target: selectedPluginBtn, iconCls: 'icon-blank' });
          selectedPluginBtn = $(this);
          element.menu('setIcon', { target: selectedPluginBtn, iconCls: 'icon-ok' });
          workbench.loadPlugin(pluginId);
        }
      }
      
    }
    
    return {
      restrict: 'A',
      template: '',
      link: link
    };
  }

})();


