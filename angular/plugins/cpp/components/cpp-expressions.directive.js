(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .directive('jtgCppExpressions', cppExpressions);

  cppExpressions.$inject = ['workbench'];

  function cppExpressions(workbench) {

    function link(scope, element, attrs) {
      
      var table = $('<table id="jtg-cpp-exprs-table"></table>');
      element.append(table);
      
      var toolbar = [{
        text: 'Add',
        iconCls: 'icon-add',
        handler: onAddBtnClick
      },{
        text: 'Remove',
        iconCls: 'icon-remove',
        handler: onRemoveBtnClick
      }];
      
      table
        .datagrid({
          fit: true,
          fitColumns: true, 
          singleSelect: false,
          border: false, 
          toolbar: toolbar, 
          columns: [[{
            field: 'ck',
            checkbox: true
          }, { 
            field: 'expression',
            title: 'Expression',
            width: 10,
            editor: 'text'
          }, {
            field: 'value',
            title: 'Value',
            width: 10,
            formatter: valueFormatter
          }]]
        })
        .datagrid('enableCellEditing')
        .datagrid({ onAfterEdit: onAfterEdit });
      
      scope.cpp.getExpressions = getExpressions;
      
      scope.$on('jtg-cpp-clear-expressions', clearExpressionResults);
      
      
      function clearExpressionResults() {
        var rowsData = table.datagrid('getRows');
        for (var i = 0; i < rowsData.length; ++i) {
          rowsData[i].value = undefined;
          table.datagrid('refreshRow', i);
        }
      }
      
      
      function onAddBtnClick() {
        table
          .datagrid('appendRow', {
            expression: '',
            value: ''
          })
          .datagrid('editCell', {
            index: table.datagrid('getRows').length - 1,
            field: 'expression'
          });
      }
      
      function onRemoveBtnClick() {
        var rows = table.datagrid('getChecked');
        for (var i = 0; i < rows.length; i++) {
	        var index = table.datagrid('getRowIndex', rows[i]);
	        table.datagrid('deleteRow', index);
        }
      }
      
      function valueFormatter(value, row, index) {
        if (!value) return '';
        if (value.result == 'error') {
          return '<div><div class="jtg-cpp-expr-val-icon icon-error"></div> ' + value.data.msg + '</div>'; 
        } else if (value.result == 'done') {
          var val = replaceAll(value.data.value, '\n', '<br>');
          return '<div><div class="jtg-cpp-expr-val-icon icon-success"></div> ' + val + '</div>';
        }
        return '<div></div>';
      }
      
      function onAfterEdit(index, row, changes) {
        scope.cpp.evalExpressions([]);
      }
      
      
      function getExpressions() {
        table.datagrid('acceptChanges');
        var rowsData = table.datagrid('getRows');
        
        var exprs = [];
        for (var i = 0; i < rowsData.length; ++i) processExpression(i);
        return exprs;

        function processExpression(rowIdx) {
          var expression = rowsData[rowIdx].expression;
          expression = replaceAll(expression, '\\', '\\\\');
          expression = replaceAll(expression, '"', '\\"');
          exprs.push({
            text: '"' + expression + '"', 
            callback: onExpressionEvaled
          });

          function onExpressionEvaled(data) {
            rowsData[rowIdx].value = data;
            table.datagrid('refreshRow', rowIdx);
          }
        }
      }
      
    }

    function replaceAll(str, search, replacement) {
      search = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return str.replace(new RegExp(search, 'g'), replacement);
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
