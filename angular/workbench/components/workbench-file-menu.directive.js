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
          '<div class="jtg-file-open-form-btns">' + 
            '<a id="jtg-file-open-form-cancel-btn" href="#" class="easyui-linkbutton wid80">Cancel</a> ' + 
            '<input id="jtg-file-open-form-submit-btn" type="submit" value="Open" class="l-btn l-btn-small l-btn-text wid80">' + 
          '</div>' +
        '</form>' +
      '</div>' +
      // save file dialog
      '<div id="jtg-file-save-dialog" class="easyui-dialog jtg-file-save-dialog" title="Save to file" ' +
        'data-options="resizable:true,modal:true,closed:true">' +
        '<form id="jtg-file-save-form" class="jtg-file-save-form">' +
          '<div class="jtg-file-save-form-file">' +
            '<input id="jtg-file-save-form-file-input" class="easyui-textbox jtg-file-save-form-file-input" ' +
              'data-options="label:\'File name:\',required:true">' + 
          '</div>' +
          '<div class="jtg-file-save-form-btns">' + 
            '<a id="jtg-file-save-form-cancel-btn" href="#" class="easyui-linkbutton wid80">Cancel</a> ' + 
            '<input id="jtg-file-save-form-submit-btn" type="submit" value="Save" class="l-btn l-btn-small l-btn-text wid80">' + 
          '</div>' +
        '</form>' +
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
      var fileOpenFormCancelBtn = fileOpenForm.find('#jtg-file-open-form-cancel-btn');
      var fileOpenFormSubmitBtn = fileOpenForm.find('#jtg-file-open-form-submit-btn');
      
      // file save dialog
      var fileSaveDialog = element.find('#jtg-file-save-dialog');
      var fileSaveForm = fileSaveDialog.find('#jtg-file-save-form');
      var fileSaveFormFileInput = fileSaveForm.find('#jtg-file-save-form-file-input');
      var fileSaveFormCancelBtn = fileSaveForm.find('#jtg-file-save-form-cancel-btn');
      var fileSaveFormSubmitBtn = fileSaveForm.find('#jtg-file-save-form-submit-btn');
      
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      
      //-----------------------------------------------------------------------
      // file open dialog actions
      //-----------------------------------------------------------------------
      
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
        workbench.ui.editor.focus();
        fileOpenDialog.dialog('close');
      }
      
      
      //-----------------------------------------------------------------------
      // file save dialog actions
      //-----------------------------------------------------------------------
      
      // focus input on open + wait for user input to do validation
      fileSaveDialog.dialog({ onOpen: onSaveDialogOpen });
      fileSaveFormFileInput.textbox({ validateOnCreate: false });
      
      function onSaveDialogOpen() {
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
        fileOpenDialog.dialog('open');
      }
      
      function onFileSaveBtnClick(event) {
        fileSaveDialog.dialog('open');
      }
      
      // override Ctrl+S (save file)
      document.addEventListener("keydown", saveHandler, false);
      
      function saveHandler(e) {
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          fileSaveDialog.dialog('open');
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


