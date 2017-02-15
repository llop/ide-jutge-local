(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .directive('jtgCppRunBtn', cppRunBtn);

  function cppRunBtn() {
    
    var template = 
      '<a id="jtg-cpp-main-run-btn" href="#" class="easyui-splitbutton marl5" ' + 
        'data-options="menu:\'#jtg-cpp-exec-menu\',iconCls:\'icon-start\',disabled:true" ' + 
          'data-jtg-easyui-disabled="' +
'!workbench.boxReady || ' +
'cpp.state.debug!=\'idle\' || cpp.state.run!=\'idle\' || cpp.state.valgrind!=\'idle\'"' + 
        '>Run</a>' + 
      '<div id="jtg-cpp-exec-menu" class="easyui-menu wid150">' + 
        '<div id="jtg-cpp-run-btn" data-options="iconCls:\'icon-start\'">Run</div>' + 
        '<div id="jtg-cpp-debug-btn" data-options="iconCls:\'icon-debug\'">Debug</div>' + 
        '<div id="jtg-cpp-slomo-btn" data-options="iconCls:\'icon-auto-play\'">Slow motion</div>' + 
        '<div id="jtg-cpp-valgrind-btn" data-options="iconCls:\'icon-valgrind\'">Valgrind</div>' + 
      '</div>';

    function link(scope, element, attrs) {
      $.parser.parse(element);
      
      var mainBtn = $('#jtg-cpp-main-run-btn');
      var menu = $('#jtg-cpp-exec-menu');
      var runBtn = $('#jtg-cpp-run-btn');
      var debugBtn = $('#jtg-cpp-debug-btn');
      var sloMoBtn = $('#jtg-cpp-slomo-btn');
      var valgrindBtn = $('#jtg-cpp-valgrind-btn');
      
      runBtn.click(onRunBtnClick);
      debugBtn.click(onDebugBtnClick);
      sloMoBtn.click(onSloMoBtnClick);
      valgrindBtn.click(onValgrindBtnClick);
      mainBtn.click(onMainBtnClick);
      
      
      var selected = 'run';
      
      function onMainBtnClick(event) {
        event.preventDefault();
        if (invalid()) return;
        doSelectedAction();
      }
      
      function onRunBtnClick(event) {
        onBtnClick('run', runBtn);
      }
      
      function onDebugBtnClick(event) {
        onBtnClick('debug', debugBtn);
      }
      
      function onSloMoBtnClick(event) {
        onBtnClick('slomo', sloMoBtn);
      }
      
      function onValgrindBtnClick(event) {
        onBtnClick('valgrind', valgrindBtn);
      }
      
      
      function onBtnClick(what, btn) {
        if (invalid()) return;
        
        if (selected != what) {
          selected = what;
          var item = menu.menu('getItem', btn);
          mainBtn.splitbutton({ 
            iconCls: item.iconCls,
            text: item.text
          });
        }
        
        doSelectedAction();
      }
      
      function doSelectedAction() {
        scope.workbench.ui.editor.jtg.setActiveLine(undefined);
        if (selected == 'run') scope.cpp.startExe();
        else if (selected == 'debug') scope.cpp.startDebug(false);
        else if (selected == 'slomo') scope.cpp.startDebug(true);
        else if (selected == 'valgrind') scope.cpp.startValgrind();
      }
      
      function invalid() {
        return !scope.workbench.boxReady || scope.cpp.state.debug!='idle' ||
          scope.cpp.state.run!='idle' || scope.cpp.state.valgrind!='idle';
      }
      
    }

    return {
      restrict: 'A',
      template: template, 
      link: link
    };
  }

})();
