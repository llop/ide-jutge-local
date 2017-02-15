(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgTerm', term);

  term.$inject = ['workbench'];

  function term(workbench) {
    
    var template = 
      '<div class="easyui-panel" title="&nbsp;" data-options="fit:true,border:false,tools:\'#jtg-term-tools\'">' + 
        '<div id="jtg-term-box" class="jtg-term-panel">' + 
        '</div>' + 
      '</div>' +
      '<div id="jtg-term-tools">' + 
        '<a id="jtg-term-clear-btn" href="#" class="easyui-tooltip icon-clear-term" title="Clear terminal"></a>' +
      '</div>';


    function link(scope, element, attrs) {
      
      var termBox = element.find('#jtg-term-box');
      var clearTermBtn = element.find('#jtg-term-clear-btn');
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      // create a terminal
      var term = new Terminal();
      
      // make it accessible and
      // destroy when socket closes
      workbench.ui.terminal = term;
      workbench.socket.on('disconnect', onDisconnect);
      
      // open it up for the user
      term.open(termBox[0]);
      
      var parentPanel = $(termBox[0].parentElement);
      parentPanel.panel({ 
        onResize: onTermPanelResize,
        fit: true
      });
      
      clearTermBtn.click(onClearTermBtnClick);
      
      
      function onClearTermBtnClick(event) {
        event.preventDefault();
        term.clear();
      }
      
      function onTermPanelResize(width, height) {
        term.fit();
      }
      
      function onDisconnect() {
        term.destroy();
      }
      
    }

    return {
      template: template,
      restrict: 'A',
      link: link
    };
  }

})();
