(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .directive('jtgCppValgrind', cppValgrind);

  cppValgrind.$inject = ['workbench'];

  function cppValgrind(workbench) {

    function link(scope, element, attrs) {
      
      var table = $('<table id="jtg-cpp-valgrind-table"></table>');
      element.append(table);
      
      table.datagrid({
        fit: true,
        fitColumns: true, 
        singleSelect: true,
        border: false, 
        columns: [[{ 
          field: 'line',
          title: 'Line',
        }, {
          field: 'kind',
          title: 'Kind'
        }, {
          field: 'what',
          title: 'What',
          width: 10
        }, {
          field: 'auxwhat',
          title: 'Aux what',
          width: 20
        }]],
        view: valgrindView,
        emptyMsg: 'No errors found',
        onClickRow: onClickRow
      });
      
      scope.$on('jtg-cpp-valgrind-change', onValgrindChanged);

      // show a message if no results came for this datagrid by extending datagrid view
      // http://www.jeasyui.com/forum/index.php?topic=1881.0
      function refreshView(target) {
	      var opts = $(target).datagrid('options');
	      var vc = $(target).datagrid('getPanel').children('div.datagrid-view');
	      vc.children('div.datagrid-empty').remove();
	      if (!$(target).datagrid('getRows').length){
		      var d = $('<div class="datagrid-empty"></div>').html(opts.emptyMsg || 'no records').appendTo(vc);
		      d.css({
			      position:'absolute',
			      left:0,
			      top:50,
			      width:'100%',
			      textAlign:'center'
		      });
	      }
      }

      var valgrindView = $.extend({}, $.fn.datagrid.defaults.view, {
	      onAfterRender: function(target){
		      $.fn.datagrid.defaults.view.onAfterRender.call(this, target);
		      refreshView(target);
	      },
	      insertRow: function(target, index, row) {
		      $.fn.datagrid.defaults.view.insertRow.call(this, target, index, row);
		      refreshEmpty(target);
	      },
	      deleteRow: function(target, index) {
		      $.fn.datagrid.defaults.view.deleteRow.call(this, target, index);
		      refreshEmpty(target);
	      }
      });
      
      // repaint every time we get new variables data
      function onValgrindChanged(event, data) {
        table.datagrid({ data: data });
      }
      
      function onClickRow(index, row) {
        workbench.ui.editor.focus();
        workbench.ui.editor.scrollToLine(row.line, true, true, doNothing);
        workbench.ui.editor.gotoLine(row.line, 0);
      }
      
      function doNothing() {
        // do nothing
      }
      
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
