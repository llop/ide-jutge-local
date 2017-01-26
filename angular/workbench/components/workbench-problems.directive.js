(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgProblems', problems);

  problems.$inject = ['workbench'];

  function problems(workbench) {
    
    var template = 
      '<table id="jtg-problems-datagrid" class="easyui-datagrid jtg-problems-datagrid" data-options="fit:true,border:false">' +
        '<thead>' +
          '<tr>' +
            '<th data-options="field:\'line\'">Line</th>' +
            '<th data-options="field:\'column\'">Column</th>' +
            '<th data-options="field:\'type\'">Type</th>' +
            '<th data-options="field:\'text\',width:10">Message</th>' +
          '</tr>' +
        '</thead>' +
      '</table>';

    function link(scope, element, attrs) {
      // EasyUI parse
      $.parser.parse(element);
      
      // init grid      
      var datagrid = element.find('#jtg-problems-datagrid');
      datagrid.datagrid({
        fitColumns: true, 
        singleSelect: true,
        onClickRow: onClickRow,
        view: problemsView,
        emptyMsg: 'Nothing to report'
      });
      
      // set workbench accessor
      datagrid.jtg = { setProblems: setProblems };
      workbench.ui.problems = datagrid;
      
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

      var problemsView = $.extend({}, $.fn.datagrid.defaults.view, {
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
      
      // when u click on an error, go to corresponding line in editor
      function onClickRow(index, row) {
        workbench.ui.editor.focus();
        workbench.ui.editor.scrollToLine(row.line, true, true, doNothing);
        workbench.ui.editor.gotoLine(row.line, row.column);
        //workbench.ui.editor.jtg.setActiveLine(row.line, "jtg-editor-highlight");
      }
      
      function doNothing() {
        // do nothing
      }
      
      var aceRange = ace.require('ace/range').Range;
      
      function getProblemType(type) {
        if (type == 'error' || type == 'warning' || type == 'info') return type;
        return 'warning';
      }
      
      function setProblems(problems) {
        // fill problems grid
        // and mark problems in editor
        var editor = workbench.ui.editor;
        editor.jtg.annotationMarkers = [];
        var annotations = [];
        for (var i = 0; i < problems.length; ++i) {
          var problem = problems[i];
          var line = problem.line - 1;
          var problemType = getProblemType(problem.type);
          var annotation = {
            row: line, 
            column: problem.column, 
            text: problem.text, 
            type: problemType
          };
          editor.jtg.annotationMarkers[line] = annotation;
          annotations.push(annotation);
          
          //var range = new aceRange(line, 0, line, 1);
          //editor.session.addMarker(range, "jtg-editor-highlight", "fullLine", false);
        }

        editor.session.setAnnotations(annotations);
        editor.on('change', removeAnnotations);
        
        datagrid.datagrid({ data: problems });
        
        function removeAnnotations() {
          editor.removeListener('change', removeAnnotations);
          editor.session.setAnnotations([]);
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
