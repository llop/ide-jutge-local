(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgAceEditor', aceEditor);

  aceEditor.$inject = ['workbench', '$timeout'];

  function aceEditor(workbench, $timeout) {

    function link(scope, element, attrs) {
      
      var editor = ace.edit(element[0]);
      workbench.ui.editor = editor;
      
      editor.setTheme("ace/theme/textmate");
      editor.$blockScrolling = Infinity;  // removes a nasty warning!
      editor.setFontSize('14px');
      editor.on("gutterclick", onEditorGutterClick);
      //editor.setHighlightActiveLine(false);
      
      editor.jtg = {
        annotationMarkers: [],
        breakpointMarkers: [],
        
        getBreakpoints: getBreakpoints,
        
        activeLine: undefined,
        setActiveLine: setActiveLine
      };
      
      var session = editor.session;
      session.setMode("ace/mode/c_cpp");
      session.setUseWrapMode(true);
      session.setOptions({
        tabSize: 2,
        useSoftTabs: true
      });
      //session.on("change", onEditorChange);
      
      doLocalStorage();
      
      element.panel({ onResize: onResizePanel });
      
      $timeout(focusEditor);
      
      
      function onResizePanel(width, height) {
        editor.resize();
      }
      
      // use localstorage to keep user's code if page is reloaded
      // http://www.w3schools.com/html/html5_webstorage.asp
      function doLocalStorage() {
        if (typeof(Storage) === "undefined") return;
        
        // save code to localStorage when window unloads
        $(window).on('unload', onWindowUnload);
        
        function onWindowUnload() {
          var code = editor.getValue();
          localStorage.code = code;
        }
        
        // load code from localStorage, if present
        var currentCode = localStorage.code;
        if (currentCode != undefined) editor.setValue(currentCode, -1);        
      }
      
      
      var aceRange = ace.require('ace/range').Range;  

      function getBreakpoints() {
        var breakpoints = [];
        var breakpointMarkers = editor.jtg.breakpointMarkers;
        for (var i = 0; i < breakpointMarkers.length; ++i) 
          if (breakpointMarkers[i] != undefined) 
            breakpoints.push(i);
        return breakpoints;
      }

      function setActiveLine(line, markerClass) {
        var jtg = editor.jtg;
        if (jtg.activeLine) session.removeMarker(jtg.activeLine);
        jtg.activeLine = undefined;

        if (!line) return;
        line -= 1;
        var range = new aceRange(line, 0, line, 1);
        jtg.activeLine = session.addMarker(range, markerClass, "fullLine", true);
      }
    
      function focusEditor() {
        editor.focus();
      }
      
      function onEditorChange(delta) {
        var annotationMarkers = editor.jtg.annotationMarkers;
        if (!annotationMarkers.length) return;
        var firstRow = delta.start.row;
        var len = delta.end.row - firstRow;
        if (len === 0) {
            // do nothing
        } else {
          if (delta.action == 'remove') {
            annotationMarkers.splice(firstRow, len + 1, null);
          } else {
            var args = new Array(len + 1);
            args.unshift(firstRow, 1);
            annotationMarkers.splice.apply(annotationMarkers, args);
          }
          //updateEditorDecorations();
        }
      }

      function onEditorGutterClick(event, editor) {
        // those may be useful too:
        // event.inSelection();
        // event.getButton();
        // event.getShiftKey();
        // event.getAccelKey();
        var target = event.domEvent.target; 
        if (target.className.indexOf("ace_gutter-cell") == -1 ||
            !editor.isFocused() ||
            event.clientX > 25 + target.getBoundingClientRect().left) 
          return;

        var breakpoints = editor.session.getBreakpoints(row, 0);
        var row = event.getDocumentPosition().row;
        if (breakpoints[row] == undefined) {
          editor.session.setBreakpoint(row);

          // mark the line along with the gutter
          var range = new aceRange(row, 0, row, 1);
          var marker = editor.session.addMarker(range, "jtg-editor-highlight-breakpoint-set", "fullLine", false);

          editor.jtg.breakpointMarkers[row] = marker;

          // broadcast the breakpoint insert event so plugins may take notice
          scope.$broadcast('jtg-breakpoint-insert', row);
        } else {
          editor.session.clearBreakpoint(row);

          // remove the corresponding line marker
          editor.session.removeMarker(editor.jtg.breakpointMarkers[row]);
          delete editor.jtg.breakpointMarkers[row];

          // broadcast the brakpoint delete event so plugins may take notice
          scope.$broadcast('jtg-breakpoint-delete', row);
        }
        event.stop();
      }

      function updateEditorDecorations() {
        // remove all breakpoints and markers
        //editor.session.clearBreakpoints();
        var markers = editor.session.getMarkers(true);
        for (var x in markers) editor.session.removeMarker(markers[x].id);

        // add updated breakpoints and markers
        var annotationMarkers = editor.jtg.annotationMarkers;
        for (var i = 0; i < annotationMarkers.length; ++i) {
          if (annotationMarkers[i] != undefined) {
            var range = new aceRange(i, 0, i, 1);
            editor.session.addMarker(range, "jtg-editor-highlight", "fullLine", true);
          }
        }
      }
      
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
