(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgFileMenu', fileMenu);

  fileMenu.$inject = ['workbench'];

  function fileMenu(workbench) {
    
    var template = 
      // menu buttons
      '<div id="jtg-menu-file-new-btn" data-options="iconCls:\'icon-filenew\'">New</div>' +
      '<div id="jtg-menu-file-open-btn" data-options="iconCls:\'icon-fileopen\'">Open</div>' +
      '<div id="jtg-menu-file-save-btn" data-options="iconCls:\'icon-save\'">Save</div>' + 
      '<div class="menu-sep"></div>' + 
      '<div id="jtg-menu-import-btn" data-options="iconCls:\'icon-import\'">Import</div>' + 
      '<div id="jtg-menu-export-btn" data-options="iconCls:\'icon-export\'">Export</div>' + 
      // open file dialog
      '<div id="jtg-file-open-dialog" class="easyui-dialog jtg-file-open-dialog" title="Open file" ' +
        'data-options="resizable:true,modal:true,closed:true">' +
        '<form id="jtg-file-open-form" class="jtg-file-open-form">' +
          '<div class="jtg-file-open-form-file">' +
            '<input id="jtg-file-open-form-file-input" class="easyui-filebox jtg-file-open-form-file-input" ' +
              'data-options="label:\'File:\',required:true">' + 
          '</div>' +
        '</form>' +
        '<div class="dialog-button">' + 
          '<a id="jtg-file-open-form-submit-btn" href="#" class="easyui-linkbutton wid80" data-options="iconCls:\'icon-ok\'">Open</a> ' + 
          '<a id="jtg-file-open-form-cancel-btn" href="#" class="easyui-linkbutton wid80" data-options="iconCls:\'icon-cancel\'">Cancel</a> ' + 
        '</div>' +
      '</div>' +
      // save file dialog
      '<div id="jtg-file-save-dialog" class="easyui-dialog jtg-file-save-dialog" title="Save to file" ' +
        'data-options="resizable:true,modal:true,closed:true">' +
        '<form id="jtg-file-save-form" class="jtg-file-save-form">' +
          '<div class="jtg-file-save-form-file">' +
            '<input id="jtg-file-save-form-file-input" class="easyui-textbox jtg-file-save-form-file-input" ' +
              'data-options="label:\'File name:\',required:true">' + 
          '</div>' +
        '</form>' +
        '<div class="dialog-button">' + 
          '<a id="jtg-file-save-form-submit-btn" href="#" class="easyui-linkbutton wid80" data-options="iconCls:\'icon-ok\'">Save</a> ' + 
          '<a id="jtg-file-save-form-cancel-btn" href="#" class="easyui-linkbutton wid80" data-options="iconCls:\'icon-cancel\'">Cancel</a> ' + 
        '</div>' +
      '</div>';
    
    function link(scope, element, attrs) {
      workbench.ui.menu.file = element;
    
      // file menu buttons
      var fileNewBtn = element.find('#jtg-menu-file-new-btn');
      var fileOpenBtn = element.find('#jtg-menu-file-open-btn');
      var fileSaveBtn = element.find('#jtg-menu-file-save-btn');
      var fileImportBtn = element.find('#jtg-menu-file-import-btn');
      var fileExportBtn = element.find('#jtg-menu-file-export-btn');
      
      // file open dialog
      var fileOpenDialog = element.find('#jtg-file-open-dialog');
      var fileOpenForm = fileOpenDialog.find('#jtg-file-open-form');
      var fileOpenFormFileInput = fileOpenForm.find('#jtg-file-open-form-file-input');
      var fileOpenFormCancelBtn = element.find('#jtg-file-open-form-cancel-btn');
      var fileOpenFormSubmitBtn = element.find('#jtg-file-open-form-submit-btn');
      
      // file save dialog
      var fileSaveDialog = element.find('#jtg-file-save-dialog');
      var fileSaveForm = fileSaveDialog.find('#jtg-file-save-form');
      var fileSaveFormFileInput = fileSaveForm.find('#jtg-file-save-form-file-input');
      var fileSaveFormCancelBtn = element.find('#jtg-file-save-form-cancel-btn');
      var fileSaveFormSubmitBtn = element.find('#jtg-file-save-form-submit-btn');
      
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      
      //-----------------------------------------------------------------------
      // file open dialog actions
      //-----------------------------------------------------------------------
      
      fileOpenDialog.dialog({ 
        onOpen: onOpenDialogOpen, 
        onClose: onOpenDialogClose
      });
      
      function onOpenDialogOpen() {
        document.addEventListener("keydown", closeOpenDialogHandler);
        fileOpenFormFileInput.filebox('textbox').focus();
      }
      
      // wait for user input to do validation
      fileOpenFormFileInput.filebox({ validateOnCreate: false });
      
      // add button click handlers
      fileOpenFormCancelBtn.click(onClickFileOpenFormCancelBtn);
      fileOpenFormSubmitBtn.click(onClickFileOpenFormSubmitBtn);
      
      // button click handlers
      function onClickFileOpenFormCancelBtn(event) {
        event.preventDefault();
        fileOpenDialog.dialog('close');
      }
      
      function onClickFileOpenFormSubmitBtn(event) {
        event.preventDefault();
        fileOpenForm.form('submit', {
	        onSubmit: onSubmitFileOpenForm,
	        success: onSuccessFileOpenForm
        });
      }
      
      // validate the file form
      function onSubmitFileOpenForm() {
        return fileOpenForm.form('validate');
      }
      
      // trigger the file read
      function onSuccessFileOpenForm() {
        // get selected file from the input
        var filesInput = fileOpenFormFileInput.next().find('.textbox-value');
        var selectedFile = filesInput[0].files[0];
        
        // read the file contents
        var reader = new FileReader();
        reader.onload = onLoadFileReader;
        reader.readAsText(selectedFile);
        
        workbench.ui.status.jtg.notifySuccess('File opened!', selectedFile.name);
      }
      
      // file read done handler
      function onLoadFileReader(event) {
        var text = event.target.result;
        workbench.ui.editor.setValue(text, -1);
        fileOpenDialog.dialog('close');
      }
      
      
      //-----------------------------------------------------------------------
      // file save dialog actions
      //-----------------------------------------------------------------------
      
      // focus input on open + wait for user input to do validation
      fileSaveDialog.dialog({ 
        onOpen: onSaveDialogOpen,
        onClose: onSaveDialogClose
      });
      fileSaveFormFileInput.textbox({ validateOnCreate: false });
      
      function onSaveDialogOpen() {
        // override Ctrl+S (save file)
        document.addEventListener("keydown", closeSaveDialogHandler);
        fileSaveFormFileInput.textbox('textbox').focus();
      }
      
      fileSaveFormCancelBtn.click(onClickFileSaveFormCancelBtn);
      fileSaveFormSubmitBtn.click(onClickFileSaveFormSubmitBtn);
      
      // button click handlers
      function onClickFileSaveFormCancelBtn(event) {
        event.preventDefault();
        fileSaveDialog.dialog('close');
      }
      
      function onClickFileSaveFormSubmitBtn(event) {
        event.preventDefault();
        fileSaveForm.form('submit', {
	        onSubmit: onSubmitFileSaveForm,
	        success: onSuccessFileSaveForm
        });
      }
      
      // validate the file form
      function onSubmitFileSaveForm() {
        return fileSaveForm.form('validate');
      }
      
      // save the file
      function onSuccessFileSaveForm() {
        var fileName = fileSaveFormFileInput.textbox('getValue');
        var fileContents = workbench.ui.editor.getValue();
        var blob = new Blob([ fileContents ], { type: "text/plain;charset=utf-8" });
        saveAs(blob, fileName);
        fileSaveDialog.dialog('close');
        
        workbench.ui.status.jtg.notifySuccess('File saved!', fileName);
      }
      
      
      //-----------------------------------------------------------------------
      // file menu button actions
      //-----------------------------------------------------------------------
      
      fileNewBtn.click(onFileNewBtnClick);
      fileOpenBtn.click(onFileOpenBtnClick);
      fileSaveBtn.click(onFileSaveBtnClick);
      
      
      function onFileNewBtnClick(event) {
        workbench.ui.editor.setValue('');
        workbench.ui.editor.focus();
      }
      
      function onFileOpenBtnClick(event) {
        openFileOpenDialog();
      }
      
      function onFileSaveBtnClick(event) {
        openFileSaveDialog();
      }
      
      
      function closeOpenDialogHandler(event) {
        if (event.keyCode == 27) {
          fileOpenDialog.dialog('close');
        }
      }
      function closeSaveDialogHandler(event) {
        if (event.keyCode == 27) {
          fileSaveDialog.dialog('close');
        }
      }
      
      
      scope.$on('jtg-open-file-dialog', openFileOpenDialog);
      scope.$on('jtg-save-file-dialog', openFileSaveDialog);
      
      var isFileOpenDialogOpen = false;
      var isFileSaveDialogOpen = false;
      
      function openFileOpenDialog() {
        if (isFileSaveDialogOpen || isFileOpenDialogOpen) return;
        isFileOpenDialogOpen = true;
        fileOpenDialog.dialog('open');
      }
      function onOpenDialogClose() {
        isFileOpenDialogOpen = false;
        document.removeEventListener("keydown", closeOpenDialogHandler);
        workbench.ui.editor.focus();
      }
      function openFileSaveDialog() {
        if (isFileSaveDialogOpen || isFileOpenDialogOpen) return;
        isFileSaveDialogOpen = true;
        fileSaveDialog.dialog('open');
      }
      function onSaveDialogClose() {
        isFileSaveDialogOpen = false;
        document.removeEventListener("keydown", closeSaveDialogHandler);
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


