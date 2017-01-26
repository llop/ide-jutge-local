(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .directive('jtgCppFrames', cppFrames);

  function cppFrames() {

    function link(scope, element, attrs) {
      
      var table = $('<table id="jtg-cpp-frames-table"></table>');
      element.append(table);
      
      table.datagrid({
        fit: true,
        fitColumns: true, 
        singleSelect: true,
        border: false, 
        columns: [[
          { 
            field: 'level',
            title: 'Level',
          },
          {
            field: 'function',
            title: 'Function',
            width: 10,
            formatter: functionFormatter
          }
        ]]
      });
      
      scope.$on('jtg-cpp-frames-change', onFramesChanged);
      
      
      var framesData = [];
      
      function functionFormatter(value, row, index) {
        return getFunctionString(row);
      }
      
      // repaint every time we get new variables data
      function onFramesChanged(event, data) {
        framesData = data;
        table.datagrid({ data: framesData });
      }

      function getFunctionString(frame) {
        var str = frame.function + '(';
        var b = true;
        for (var varName in frame.args) if (varName != 'this') {
          if (b) b = false;
          else str += ', ';
          str += frame.args[varName].value;
        }
        str += ')';
        return str;
      }
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
