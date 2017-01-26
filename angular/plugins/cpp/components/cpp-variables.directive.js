(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .directive('jtgCppVariables', cppVariables);

  cppVariables.$inject = ['workbench', '$timeout'];

  function cppVariables(workbench, $timeout) {

    //https://www.tutorialspoint.com/cplusplus/cpp_data_types.htm
    function isSimpleType(type) {
      return type == 'int' || 
        type == 'float' || 
        type == 'double' || 
        type == 'char' || 
        type == 'bool' || 
        type == 'std::__cxx11::string' ||
        type == 'short' || 
        type == 'long' || 
        type == 'long double' ||
        type == 'long long' ||
        type == 'wchar_t' ||
        type == 'unsigned char' ||
        type == 'signed char' ||
        type == 'unsigned int' ||
        type == 'signed int' ||
        type == 'short int' ||
        type == 'unsigned short int' ||
        type == 'signed short int' ||
        type == 'long int' ||
        type == 'signed long int' ||
        type == 'unsigned long int'
        type == 'signed long long' ||
        type == 'unsigned long long';
    }

    function getAssignExpression(name, type, value) {
      if (type == 'std::__cxx11::string') {
        value = replaceAll(value, '\\', '\\\\\\\\');
        value = replaceAll(value, '"', '\\\\\\"');
        return '"' + name + '.assign(\\"' + value + '\\")"';
      }
      return '"' + name + '=' + value + '"';
    }

    function link(scope, element, attrs) {
      
      var table = $('<table id="jtg-cpp-vars-table"></table>');
      element.append(table);
      
      table
        .datagrid({
          fit: true,
          fitColumns: true, 
          singleSelect: true,
          border: false, 
          columns: [[
            { 
              field: 'name',
              title: 'Name',
              width: 20,
              formatter: nameFormatter
            },
            { 
              field: 'type',
              title: 'Type',
              width: 20
            },
            {
              field: 'value',
              title: 'Value',
              width: 60,
              formatter: valueFormatter,
              editor: 'text'
            }
          ]]
        })
        .datagrid('enableCellEditing')
        .datagrid({ 
          onBeforeCellEdit: onBeforeCellEdit,
          onAfterEdit: onAfterEdit
        });
        
      
      scope.$on('jtg-cpp-variables-change', onVariablesChanged);
      
      
      function onBeforeCellEdit(index, field) {
        return rowEditable[index];
      }
      
      function onAfterEdit(index, row, changes) {
        var name = row.name;
        var type = row.type;
        var newValue = changes.value;
        var expression = getAssignExpression(name, type, newValue);
        scope.cpp.evalExpressions([{
          text: expression, 
          callback: onExpressionEvaled
        }]);

        function onExpressionEvaled(data) {
          if (data.result == 'error') {
            //editableGrid.setValueAt(rowIdx, colIdx, oldValue, true);
            //flashRow(rowIdx, '#F88');
            workbench.ui.status.jtg.notifyError('could not set variable value', data.data.msg);
          } else {
            //flashRow(rowIdx, '#8F8');
            //formatStringVariable(data.data);
            workbench.ui.status.jtg.notifySuccess('variable value updated', 'new value: ' + data.data.value);
          }
        }
      }
      
      function nameFormatter(value, row, index) {
        return '<div class="fonb">' + value + '</div>';
      }
      function valueFormatter(value, row, index) {
        return '<div>' + replaceAll(value, '\n', '<br>') + '</div>';
      }
      

      // the variable value cell is editable depending on type
      // this will be an array of booleans telling if the corresponding row
      // has a variable whose vaule is editable
      var rowEditable = undefined;

      function onVariablesChanged(event, data) {
        // set new data
        for (var i = 0; i < data.length; ++i) {
          var variable = data[i];
          variable.type = $("<div>").text(variable.type).html();
          if (variable.type == 'std::__cxx11::string') 
            formatStringVariable(variable);
        }
        rowEditable = data.map(processVar);
        table.datagrid({ data: data });
      }

      function formatStringVariable(variable) {
        // escape html
        variable.value = $("<div>").text(variable.value).html();
        
        if (variable.value == undefined) variable.value = '';
        if (variable.value.startsWith('"')) 
          variable.value = variable.value.substr(1);
        if (variable.value.endsWith('"')) 
          variable.value = variable.value.substr(0, variable.value.length - 1);
        variable.value = replaceAll(variable.value, '\\"', '"');
        variable.value = replaceAll(variable.value, '\\\\', '\\');
      }

      function processVar(value) {
        var type = value.type;
        return isSimpleType(type);
      }

      function flashRow(rowIdx, color) {
        var row = $('#debug-vars-table_' + (rowIdx + 1));
        row.effect("highlight", { color: color }, 3000);
      }

    }    

    function replaceAll(str, search, replacement) {
      search = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
      return str.replace(new RegExp(search, 'g'), replacement);
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
