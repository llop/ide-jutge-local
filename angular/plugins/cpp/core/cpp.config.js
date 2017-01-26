(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .run(run);

  run.$inject = ['workbench'];

  function run(workbench) {
    workbench.registerPlugin({
      id: 'cpp', 
      name: 'C++',
      controller: 'CppController as cpp',
      components: {
        'jtg-menu-panel': '/plugins/cpp/components/menu-bar.html',
        'jtg-plugin-panel': '/plugins/cpp/components/panel.html'
      }
    });
  }

})();
