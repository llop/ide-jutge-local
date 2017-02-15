(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgHelpMenu', helpMenu);

  helpMenu.$inject = ['workbench'];

  function helpMenu(workbench) {
    
    var about = workbench.about;
    var template = 
      // menu buttons
      '<div id="jtg-menu-help-help-btn" data-options="iconCls:\'icon-help\'">Help</div>' +
      '<div class="menu-sep"></div>' +
      '<div id="jtg-menu-help-about-btn" data-options="iconCls:\'icon-about\'">About</div>' +
      // help dialog
      '<div id="jtg-help-help-dialog" class="easyui-dialog jtg-help-help-dialog" title="ide.jutge help" ' +
        'data-options="resizable:true,modal:true,closed:true">' +
        '<div class="jtg-help-text-box">' + 
          '<br><a class="jtg-doc-lnk" href="' + about.documentationUrl + '" target="_blank">IDE Components Overview</a><br>' +
          '<br><a class="jtg-doc-lnk" href="' + about.faqUrl + '" target="_blank">FAQ</a><br>' +
        '</div>' + 
        '<div class="dialog-button">' + 
          '<a id="jtg-help-ok-btn" href="#" class="easyui-linkbutton wid80" data-options="iconCls:\'icon-ok\'">Ok</a> ' + 
        '</div>' +
      '</div>' +
      // about dialog
      '<div id="jtg-help-about-dialog" class="easyui-dialog jtg-help-about-dialog" title="About ide.jutge" ' +
        'data-options="resizable:true,modal:true,closed:true">' +
        '<div class="icon-jutge jtg-about-img"></div>' + 
        '<div class="jtg-about-text-box">' + 
          '<span class="fonb">' + about.name + '</span><br>' +
          '<br><span>' + about.version + '</span><br>' + 
          '<br><span>' + about.copyright + '</span>' + 
        '</div>' + 
        '<div class="dialog-button">' + 
          '<a id="jtg-about-ok-btn" href="#" class="easyui-linkbutton wid80" data-options="iconCls:\'icon-ok\'">Ok</a> ' + 
        '</div>' +
      '</div>';
    
    function link(scope, element, attrs) {
      workbench.ui.menu.help = element;
    
      // file menu buttons
      var helpBtn = element.find('#jtg-menu-help-help-btn');
      var aboutBtn = element.find('#jtg-menu-help-about-btn');
      
      var helpDialog = element.find('#jtg-help-help-dialog');
      var aboutDialog = element.find('#jtg-help-about-dialog');
      
      var documentationLink = helpDialog.find('.jtg-doc-lnk');
      
      var helpOkBtn = helpDialog.find('#jtg-help-ok-btn');
      var aboutOkBtn = aboutDialog.find('#jtg-about-ok-btn');
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      
      // open/close dialog handlers
      helpDialog.dialog({ 
        onOpen: onHelpDialogOpen, 
        onClose: onHelpDialogClose
      });
      aboutDialog.dialog({ 
        onOpen: onAboutDialogOpen, 
        onClose: onAboutDialogClose
      });
      
      
      // add dialog button click listeners
      helpOkBtn.click(helpDialogCloseHandler);
      aboutOkBtn.click(aboutDialogCloseHandler);
      
      
      // add button click handlers
      helpBtn.click(onClickHelpBtn);
      aboutBtn.click(onClickAboutBtn);
      
      documentationLink.each(addLinkClickListener);
      
      
      function addLinkClickListener(index) {
        $(this).click(onClickDocLink);
      }
      // button click handlers
      function onClickDocLink(event) {
        helpDialog.dialog('close');
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
        event.preventDefault();
        helpDialog.dialog('close');
      }
      
      function aboutDialogCloseHandler(event) {
        event.preventDefault();
        aboutDialog.dialog('close');
      }
      
      
      //-----------------------------------------------------------------------
      // allow dialogs to be closed with the 'esc' key
      //-----------------------------------------------------------------------
      
      function onHelpDialogOpen() {
        document.addEventListener("keydown", closeHelpDialogHandler);
      }
      function onHelpDialogClose() {
        document.removeEventListener("keydown", closeHelpDialogHandler);
        workbench.ui.editor.focus();
      }
      function closeHelpDialogHandler(event) {
        if (event.keyCode == 27) {
          helpDialog.dialog('close');
        }
      }
      
      function onAboutDialogOpen() {
        document.addEventListener("keydown", closeAboutDialogHandler);
      }
      function onAboutDialogClose() {
        document.removeEventListener("keydown", closeAboutDialogHandler);
        workbench.ui.editor.focus();
      }
      function closeAboutDialogHandler(event) {
        if (event.keyCode == 27) {
          aboutDialog.dialog('close');
        }
      }
    }
    
    return {
      restrict: 'A',
      template: template,
      link: link
    };
  }

})();


