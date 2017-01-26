(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgEditMenu', editMenu);

  editMenu.$inject = ['workbench', '$timeout'];

  function editMenu(workbench, $timeout) {
    
    var template = 
      '<div id="jtg-menu-edit-undo-btn" data-options="iconCls:\'icon-undo\'">Undo</div>' +
      '<div id="jtg-menu-edit-redo-btn" data-options="iconCls:\'icon-redo\'">Redo</div>' +
      '<div class="menu-sep"></div>' +
      //'<div id="jtg-menu-edit-cut-btn">Cut</div>' +
      //'<div id="jtg-menu-edit-copy-btn">Copy</div>' +
      //'<div id="jtg-menu-edit-paste-btn">Paste</div>' +
      //'<div class="menu-sep"></div>' +
      '<div id="jtg-menu-edit-select-all-btn" data-options="iconCls:\'icon-selectall\'">Select all</div>';
    
    function link(scope, element, attrs) {
      
      workbench.ui.menu.edit = element;
    
      // edit menu buttons
      var editUndoBtn = element.find('#jtg-menu-edit-undo-btn');
      var editRedoBtn = element.find('#jtg-menu-edit-redo-btn');
      //cut, copy and paste are considered unsafe operations 'cos they mess with the clipboard
      //var editCutBtn = element.find('#jtg-menu-edit-cut-btn');
      //var editCopyBtn = element.find('#jtg-menu-edit-copy-btn');
      //var editPasteBtn = element.find('#jtg-menu-edit-paste-btn');
      var editSelectAllBtn = element.find('#jtg-menu-edit-select-all-btn');
      
      
      // have easyUI do its thang
      var canUndo = undefined;
      var canRedo = undefined;
      $timeout(addEditorInputListener);  // do this next digest iteration, editor will be ready
      
      function addEditorInputListener() {
        workbench.ui.editor.on('input', onEditorInput);
      }
      
      // same as $watch, but more efficient
      function onEditorInput(event) {
        var undoManager = workbench.ui.editor.getSession().getUndoManager();
        var newCanUndo = undoManager.hasUndo();
        var newCanRedo = undoManager.hasRedo();
        if (canUndo !== newCanUndo) {
          canUndo = newCanUndo;
          if (canUndo) element.menu('enableItem', editUndoBtn);
          else element.menu('disableItem', editUndoBtn);
        }
        if (canRedo !== newCanRedo) {
          canRedo = newCanRedo;
          if (canRedo) element.menu('enableItem', editRedoBtn);
          else element.menu('disableItem', editRedoBtn);
        }
      }
      
      
      //-----------------------------------------------------------------------
      // edit menu button actions
      //
      // warning: copy, cut and paste are unsafe! 
      //-----------------------------------------------------------------------
      
      editUndoBtn.click(onEditUndoBtnClick);
      editRedoBtn.click(onEditRedoBtnClick);
      //editCutBtn.click(onEditCutBtnClick);
      //editCopyBtn.click(onEditCopyBtnClick);
      //editPasteBtn.click(onEditPasteBtnClick);
      editSelectAllBtn.click(onEditSelectAllBtnClick);
      
      function onEditUndoBtnClick(event) {
        var undoManager = workbench.ui.editor.session.getUndoManager();
        if (undoManager.hasUndo()) undoManager.undo();
        workbench.ui.editor.focus();
      }
      
      function onEditRedoBtnClick(event) {
        var undoManager = workbench.ui.editor.session.getUndoManager();
        if (undoManager.hasRedo()) undoManager.redo();
        workbench.ui.editor.focus();
      }
      
      //function onEditCutBtnClick(event) {
      //}
      //function onEditCopyBtnClick(event) {
      //}
      //function onEditPasteBtnClick(event) {
      //}
      
      function onEditSelectAllBtnClick(event) {
        workbench.ui.editor.selection.selectAll();
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


