(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgHelpMenu', helpMenu);

  helpMenu.$inject = ['workbench'];

  function helpMenu(workbench) {
    
    var template = 
      // menu buttons
      '<div id="jtg-menu-help-help-btn" data-options="iconCls:\'icon-help\'">Help</div>' +
      '<div class="menu-sep"></div>' +
      '<div id="jtg-menu-help-about-btn" data-options="iconCls:\'icon-about\'">About</div>' +
      // help dialog
      '<div id="jtg-help-help-dialog" class="easyui-dialog" title="ide.jutge help" ' +
        'data-options="resizable:true,modal:true,closed:true">' +
        '<div style="text-align:center;padding:20px">' + 
          '<br><a id="jtg-doc-lnk" href="/documentation" target="_blank">Documentation</a><br>' +
        '</div>' + 
      '</div>' +
      // about dialog
      '<div id="jtg-help-about-dialog" class="easyui-dialog" title="About ide.jutge" ' +
        'data-options="resizable:true,modal:true,closed:true">' +
        '<div class="icon-jutge" style="width:100%;height:128px;"></div>' + 
        '<div style="text-align:center;padding:20px">' + 
          '<br><span class="fonb">ide.jutge</span><br>' +
          '<br><span>1.0 beta</span><br>' + 
          '<br><span>Copyright (c) 2016-2017 Albert Lobo Cusidó</span>' + 
        '</div>' + 
      '</div>';
    
    function link(scope, element, attrs) {
      workbench.ui.menu.help = element;
    
      // file menu buttons
      var helpBtn = element.find('#jtg-menu-help-help-btn');
      var aboutBtn = element.find('#jtg-menu-help-about-btn');
      
      var helpDialog = element.find('#jtg-help-help-dialog');
      var aboutDialog = element.find('#jtg-help-about-dialog');
      
      var documentationLink = element.find('#jtg-doc-lnk');
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      // add dialog buttons
      helpDialog.dialog({ buttons: [{ text: 'Close', handler: helpDialogCloseHandler }] });
      aboutDialog.dialog({ buttons: [{ text: 'Close', handler: aboutDialogCloseHandler }] });
      
      
      // add button click handlers
      helpBtn.click(onClickHelpBtn);
      aboutBtn.click(onClickAboutBtn);
      
      documentationLink.click(onClickDocLink);
      
      // button click handlers
      function onClickDocLink(event) {
        helpDialog.dialog('close');
        workbench.ui.editor.focus();
      }
      
      function onClickHelpBtn(event) {
        event.preventDefault();
        helpDialog.dialog('open');
      }
      
      function onClickAboutBtn(event) {
        event.preventDefault();
        aboutDialog.dialog('open');
      }
      
      function helpDialogCloseHandler(event) {
        helpDialog.dialog('close');
        workbench.ui.editor.focus();
      }
      
      function aboutDialogCloseHandler() {
        aboutDialog.dialog('close');
        workbench.ui.editor.focus();
      }
    
    }
    
    return {
      restrict: 'A',
      template: template,
      link: link
    };
  }

})();


