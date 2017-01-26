(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgTerm', term);

  term.$inject = ['workbench'];

  function term(workbench) {

    function link(scope, element, attrs) {
      
      // create a terminal
      var term = new Terminal();
      
      // make it accessible and
      // destroy when socket closes
      workbench.ui.terminal = term;
      workbench.socket.on('disconnect', onDisconnect);
      
      // open it up for the user
      var termPanel = $(element[0].parentElement);
      term.open(termPanel[0]);
      termPanel.panel({ onResize: onTermPanelResize });
      
      function onTermPanelResize(width, height) {
        term.fit();
      }
      
      function onDisconnect() {
        term.destroy();
      }
      
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
