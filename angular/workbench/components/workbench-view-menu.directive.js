(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgViewMenu', viewMenu);

  viewMenu.$inject = ['workbench', '$timeout'];

  function viewMenu(workbench, $timeout) {
    
    // define menu options
    var fontSizes = [
      { value: 10, text: 'Smaller' },
      { value: 12, text: 'Small' },
      { value: 14, text: 'Normal' },
      { value: 16, text: 'Large' },
      { value: 18, text: 'Larger' }
    ];
    var guiThemes = [
      { value: 'default', text: 'Default' },
      { value: 'bootstrap', text: 'Bootstrap' },
      { value: 'metro', text: 'Metro' },
      { value: 'gray', text: 'Gray' },
      { value: 'black', text: 'Black' },
      { value: 'material', text: 'Material' },
      { value: '', text: '' },
      { value: 'ui-cupertino', text: 'Cupertino' },
      { value: 'ui-sunny', text: 'Sunny' },
      { value: 'ui-pepper-grinder', text: 'Pepper grinder' },
      { value: 'ui-dark-hive', text: 'Dark hive' },
      { value: '', text: '' },
      { value: 'metro-blue', text: 'Metro blue' },
      { value: 'metro-gray', text: 'Metro gray' },
      { value: 'metro-green', text: 'Metro green' },
      { value: 'metro-orange', text: 'Metro orange' },
      { value: 'metro-red', text: 'Metro red' }
    ];
    var editorThemes = [
      { value: 'chrome', text: 'Chrome' },
      { value: 'clouds', text: 'Clouds' },
      { value: 'crimson_editor', text: 'Crimson editor' },
      { value: 'dawn', text: 'Dawn' },
      { value: 'dreamweaver', text: 'Dreamweaver' },
      { value: 'eclipse', text: 'Eclipse' },
      { value: 'github', text: 'GitHub' },
      { value: 'iplastic', text: 'IPlastic' },
      { value: 'katzenmilch', text: 'KatzenMilch' },
      { value: 'kuroir', text: 'Kuroir' },
      { value: 'solarized_light', text: 'Solarized light' },
      { value: 'sqlserver', text: 'SQL server' },
      { value: 'textmate', text: 'Textmate' },
      { value: 'tomorrow', text: 'Tomorrow' },
      { value: 'xcode', text: 'XCode' },
      { value: '', text: '' },
      { value: 'ambiance', text: 'Ambiance' },
      { value: 'chaos', text: 'Chaos' },
      { value: 'clouds_midnight', text: 'Clouds midnight' },
      { value: 'cobalt', text: 'Cobalt' },
      { value: 'idle_fingers', text: 'Idle fingers' },
      { value: 'kr_theme', text: 'Kr theme' },
      { value: 'merbivore', text: 'Merbivore' },
      { value: 'merbivore_soft', text: 'Merbivore soft' },
      { value: 'mono_industrial', text: 'Mono industrial' },
      { value: 'monokai', text: 'Monokai' },
      { value: 'pastel_on_dark', text: 'Pastel on dark' },
      { value: 'solarized_dark', text: 'Solarized dark' },
      { value: 'terminal', text: 'Terminal' },
      { value: 'tomorrow_night', text: 'Tomorrow night' },
      { value: 'tomorrow_night_blue', text: 'Tomorrow night blue' },
      { value: 'tomorrow_night_bright', text: 'Tomorrow night bright' },
      { value: 'tomorrow_night_eighties', text: 'Tomorrow night 80s' },
      { value: 'twilight', text: 'Twilight' },
      { value: 'vibrant_ink', text: 'Vibrant ink' }
    ];
    var fontSizeId = 'jtg-menu-view-font-';
    var guiThemeId = 'jtg-gui-theme-';
    var editorThemeId = 'jtg-editor-theme-';
    var template = buildTemplate();
    
    function buildTemplate() {
      var html = [];
      // font sizes
      html.push('<div>');
      html.push('<span>Font size</span>');
      html.push(buildMenuOptions(fontSizeId, fontSizes));
      html.push('</div>');
      html.push('<div class="menu-sep"></div>');
      // gui themes
      html.push('<div>');
      html.push('<span>IDE themes</span>');
      html.push(buildMenuOptions(guiThemeId, guiThemes));
      html.push('</div>');
      // editor themes
      html.push('<div>');
      html.push('<span>Editor themes</span>');
      html.push(buildMenuOptions(editorThemeId, editorThemes));
      html.push('</div>');
      return html.join('');
    }
    
    function buildMenuOptions(id, options) {
      var html = [];
      html.push('<div>');
      for (var i = 0; i < options.length; ++i) {
        var obj = options[i];
        html.push(
          obj.value == '' ?
            '<div class="menu-sep"></div>' :
            '<div id="' + id + obj.value + '">' + obj.text + '</div>'
        );
      }
      html.push('</div>');
      return html.join('');
    }
    
    
    function link(scope, element, attrs) {
      workbench.ui.menu.view = element;
      
      // selected options
      var selectedFontSize = 14;
      var selectedGuiTheme = 'default';
      var selectedEditorTheme = 'textmate';
      
      doLocalStorage();
      
      // add click listeners
      addAllClickListeners(fontSizes, fontSizeId, setFontSize);
      addAllClickListeners(guiThemes, guiThemeId, setGuiTheme);
      addAllClickListeners(editorThemes, editorThemeId, setEditorTheme);
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      // activate view options later
      // wait a few digest cycles so plugins can load
      // otherwise css stylesheet change can mess up the page
      timeoutLater(3, activateOptions);
      
      function timeoutLater(cycles, func) {
        if (cycles == 0) func();
        else $timeout(timeoutFunc);
        
        function timeoutFunc() {
          timeoutLater(cycles - 1, func);
        }
      }
      
      function activateOptions() {
        setFontSize(selectedFontSize);
        setEditorTheme(selectedEditorTheme);
        setGuiTheme(selectedGuiTheme);
      }
      
      function addAllClickListeners(options, id, func) {
        for (var i = 0; i < options.length; ++i) {
          var obj = options[i];
          if (obj.value != '') addClickListener(id, func, obj.value);
        }
      }
      
      function addClickListener(id, func, value) {
        element.find('#' + id + value).click(clickCallback);
        function clickCallback(event) { func(value); }
      }
      
      function setFontSize(size) {
        workbench.ui.editor.setFontSize(size);
        workbench.ui.editor.focus();
        
        var button = $('#' + fontSizeId + selectedFontSize);
        element.menu('setIcon', { target: button[0], iconCls: 'icon-blank' });
        
        selectedFontSize = size;
        button = $('#' + fontSizeId + selectedFontSize);
        element.menu('setIcon', { target: button[0], iconCls: 'icon-ok' });
      }
      
      function setGuiTheme(theme) {
        var cssUrl = '/easy-ui/themes/' + theme + '/easyui.css';
        $('#jtg-gui-themes').attr('href', cssUrl);
        workbench.ui.editor.focus();
        
        var button = $('#' + guiThemeId + selectedGuiTheme);
        element.menu('setIcon', { target: button[0], iconCls: 'icon-blank' });
        selectedGuiTheme = theme;
        button = $('#' + guiThemeId + selectedGuiTheme);
        element.menu('setIcon', { target: button[0], iconCls: 'icon-ok' });
      }
      
      function setEditorTheme(theme) {
        var editorTheme = 'ace/theme/' + theme;
        workbench.ui.editor.setTheme(editorTheme);
        workbench.ui.editor.focus();
        
        var button = $('#' + editorThemeId + selectedEditorTheme);
        element.menu('setIcon', { target: button[0], iconCls: 'icon-blank' });
        
        selectedEditorTheme = theme;
        button = $('#' + editorThemeId + selectedEditorTheme);
        element.menu('setIcon', { target: button[0], iconCls: 'icon-ok' });
      }
      
      
      // use localstorage to keep user's view if page is reloaded
      // http://www.w3schools.com/html/html5_webstorage.asp
      function doLocalStorage() {
        if (typeof(Storage) === "undefined") return;
        
        // save configuration to localStorage when window unloads
        $(window).on('unload', onWindowUnload);
        
        function onWindowUnload() {
          localStorage.fontSize = selectedFontSize;
          localStorage.guiTheme = selectedGuiTheme;
          localStorage.editorTheme = selectedEditorTheme;
        }
        
        // load configuration from localStorage, if present
        var fontSize = localStorage.fontSize;
        var guiTheme = localStorage.guiTheme;
        var editorTheme = localStorage.editorTheme;
        if (fontSize) selectedFontSize = fontSize;
        if (guiTheme) selectedGuiTheme = guiTheme;
        if (editorTheme) selectedEditorTheme = editorTheme;
      }
    }
    
    return {
      restrict: 'A',
      template: template,
      link: link
    };
  }

})();


