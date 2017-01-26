(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgViewMenu', viewMenu);

  viewMenu.$inject = ['workbench'];

  function viewMenu(workbench) {
    
    var template = 
      '<div>' + 
        '<span>Font size</span>' + 
        '<div>' +
          '<div id="jtg-menu-view-font-10">Smaller</div>' + 
          '<div id="jtg-menu-view-font-12">Small</div>' + 
          '<div id="jtg-menu-view-font-14" data-options="iconCls:\'icon-ok\'">Normal</div>' + 
          '<div id="jtg-menu-view-font-16">Large</div>' + 
          '<div id="jtg-menu-view-font-18">Larger</div>' + 
        '</div>' + 
      '</div>' + 
      '<div class="menu-sep"></div>' +
      '<div>' + 
        '<span>GUI themes</span>' + 
        '<div>' +
          '<div id="jtg-gui-theme-default" data-options="iconCls:\'icon-ok\'">Default</div>' +
          '<div id="jtg-gui-theme-bootstrap">Bootstrap</div>' +  
          '<div id="jtg-gui-theme-metro">Metro</div>' +
          '<div id="jtg-gui-theme-gray">Gray</div>' + 
          '<div id="jtg-gui-theme-black">Black</div>' +
          '<div id="jtg-gui-theme-material">Material</div>' +
          '<div class="menu-sep"></div>' +
          '<div id="jtg-gui-theme-cupertino">Cupertino</div>' + 
          '<div id="jtg-gui-theme-sunny">Sunny</div>' + 
          '<div id="jtg-gui-theme-pepper-grinder">Pepper grinder</div>' + 
          '<div id="jtg-gui-theme-dark-hive">Dark hive</div>' + 
          '<div class="menu-sep"></div>' +
          '<div id="jtg-gui-theme-metro-blue">Metro blue</div>' + 
          '<div id="jtg-gui-theme-metro-gray">Metro gray</div>' + 
          '<div id="jtg-gui-theme-metro-green">Metro green</div>' + 
          '<div id="jtg-gui-theme-metro-orange">Metro orange</div>' + 
          '<div id="jtg-gui-theme-metro-red">Metro red</div>' + 
        '</div>' + 
      '</div>' + 
      '<div>' + 
        '<span>Editor themes</span>' + 
        '<div>' +
          '<div id="jtg-editor-theme-chrome">Chrome</div>' + 
          '<div id="jtg-editor-theme-clouds">Clouds</div>' + 
          '<div id="jtg-editor-theme-crimson_editor">Crimson editor</div>' + 
          '<div id="jtg-editor-theme-dawn">Dawn</div>' + 
          '<div id="jtg-editor-theme-dreamweaver">Dreamweaver</div>' + 
          '<div id="jtg-editor-theme-eclipse">Eclipse</div>' + 
          '<div id="jtg-editor-theme-github">GitHub</div>' + 
          '<div id="jtg-editor-theme-iplastic">IPlastic</div>' +
          '<div id="jtg-editor-theme-katzenmilch">KatzenMilch</div>' + 
          '<div id="jtg-editor-theme-kuroir">Kuroir</div>' + 
          '<div id="jtg-editor-theme-solarized_light">Solarized light</div>' + 
          '<div id="jtg-editor-theme-sqlserver">SQL server</div>' + 
          '<div id="jtg-editor-theme-textmate" data-options="iconCls:\'icon-ok\'">Textmate</div>' + 
          '<div id="jtg-editor-theme-tomorrow">Tomorrow</div>' + 
          '<div id="jtg-editor-theme-xcode">XCode</div>' + 
          '<div class="menu-sep"></div>' +
          '<div id="jtg-editor-theme-ambiance">Ambiance</div>' + 
          '<div id="jtg-editor-theme-chaos">Chaos</div>' + 
          '<div id="jtg-editor-theme-clouds_midnight">Clouds midnight</div>' + 
          '<div id="jtg-editor-theme-cobalt">Cobalt</div>' + 
          '<div id="jtg-editor-theme-idle_fingers">Idle fingers</div>' + 
          '<div id="jtg-editor-theme-kr_theme">Kr theme</div>' + 
          '<div id="jtg-editor-theme-merbivore">Merbivore</div>' + 
          '<div id="jtg-editor-theme-merbivore_soft">Merbivore soft</div>' + 
          '<div id="jtg-editor-theme-mono_industrial">Mono industrial</div>' + 
          '<div id="jtg-editor-theme-monokai">Monokai</div>' + 
          '<div id="jtg-editor-theme-pastel_on_dark">Pastel on dark</div>' + 
          '<div id="jtg-editor-theme-solarized_dark">Solarized dark</div>' + 
          '<div id="jtg-editor-theme-terminal">Terminal</div>' + 
          '<div id="jtg-editor-theme-tomorrow_night">Tomorrow night</div>' + 
          '<div id="jtg-editor-theme-tomorrow_night_blue">Tomorrow night blue</div>' + 
          '<div id="jtg-editor-theme-tomorrow_night_bright">Tomorrow night bright</div>' + 
          '<div id="jtg-editor-theme-tomorrow_night_eighties">Tomorrow night 80s</div>' + 
          '<div id="jtg-editor-theme-twilight">Twilight</div>' + 
          '<div id="jtg-editor-theme-vibrant_ink">Vibrant ink</div>' + 
        '</div>' + 
      '</div>';
    
    function link(scope, element, attrs) {
      workbench.ui.menu.view = element;
    
      // view menu buttons
      var viewSmallerFontBtn = element.find('#jtg-menu-view-font-10');
      var viewSmallFontBtn = element.find('#jtg-menu-view-font-12');
      var viewNormalFontBtn = element.find('#jtg-menu-view-font-14');
      var viewLargeFontBtn = element.find('#jtg-menu-view-font-16');
      var viewLargerFontBtn = element.find('#jtg-menu-view-font-18');
      
      var guiThemeDefaultBtn = element.find('#jtg-gui-theme-default');
      var guiThemeBootstrapBtn = element.find('#jtg-gui-theme-bootstrap');
      var guiThemeMetroBtn = element.find('#jtg-gui-theme-metro');
      var guiThemeGrayBtn = element.find('#jtg-gui-theme-gray');
      var guiThemeBlackBtn = element.find('#jtg-gui-theme-black');
      var guiThemeMaterialBtn = element.find('#jtg-gui-theme-material');
      var guiThemeCupertinoBtn = element.find('#jtg-gui-theme-cupertino');
      var guiThemeSunnyBtn = element.find('#jtg-gui-theme-sunny');
      var guiThemePepperGrinderBtn = element.find('#jtg-gui-theme-pepper-grinder');
      var guiThemeDarkHiveBtn = element.find('#jtg-gui-theme-dark-hive');
      var guiThemeMetroBlueBtn = element.find('#jtg-gui-theme-metro-blue');
      var guiThemeMetroGrayBtn = element.find('#jtg-gui-theme-metro-gray');
      var guiThemeMetroGreenBtn = element.find('#jtg-gui-theme-metro-green');
      var guiThemeMetroOrangeBtn = element.find('#jtg-gui-theme-metro-orange');
      var guiThemeMetroRedBtn = element.find('#jtg-gui-theme-metro-red');
      
      var editorThemeAmbianceBtn = element.find('#jtg-editor-theme-ambiance');
      var editorThemeChaosBtn = element.find('#jtg-editor-theme-chaos');
      var editorThemeChromeBtn = element.find('#jtg-editor-theme-chrome');
      var editorThemeCloudsBtn = element.find('#jtg-editor-theme-clouds');
      var editorThemeCloudsNightBtn = element.find('#jtg-editor-theme-clouds_midnight');
      var editorThemeCobaltBtn = element.find('#jtg-editor-theme-cobalt');
      var editorThemeCrimsonEditorBtn = element.find('#jtg-editor-theme-crimson_editor');
      var editorThemeDawnBtn = element.find('#jtg-editor-theme-dawn');
      var editorThemeDreamweaverBtn = element.find('#jtg-editor-theme-dreamweaver');
      var editorThemeEclipseBtn = element.find('#jtg-editor-theme-eclipse');
      var editorThemeGithubBtn = element.find('#jtg-editor-theme-github');
      var editorThemeIdleFingersBtn = element.find('#jtg-editor-theme-idle_fingers');
      var editorThemeIplasticBtn = element.find('#jtg-editor-theme-iplastic');
      var editorThemeKatzenmilchBtn = element.find('#jtg-editor-theme-katzenmilch');
      var editorThemeKrThemeBtn = element.find('#jtg-editor-theme-kr_theme');
      var editorThemeKuroirBtn = element.find('#jtg-editor-theme-kuroir');
      var editorThemeMerbivoreBtn = element.find('#jtg-editor-theme-merbivore');
      var editorThemeMerbivoreSoftBtn = element.find('#jtg-editor-theme-merbivore_soft');
      var editorThemeMonoIndustrialBtn = element.find('#jtg-editor-theme-mono_industrial');
      var editorThemeMonokaiBtn = element.find('#jtg-editor-theme-monokai');
      var editorThemePastelOnDarkBtn = element.find('#jtg-editor-theme-pastel_on_dark');
      var editorThemeSolarizedDarkBtn = element.find('#jtg-editor-theme-solarized_dark');
      var editorThemeSolarizedLightBtn = element.find('#jtg-editor-theme-solarized_light');
      var editorThemeSqlServerBtn = element.find('#jtg-editor-theme-sqlserver');
      var editorThemeTerminalBtn = element.find('#jtg-editor-theme-terminal');
      var editorThemeTextmateBtn = element.find('#jtg-editor-theme-textmate');
      var editorThemeTomorrowBtn = element.find('#jtg-editor-theme-tomorrow');
      var editorThemeTomorrowNightBtn = element.find('#jtg-editor-theme-tomorrow_night');
      var editorThemeTomorrowNightBlueBtn = element.find('#jtg-editor-theme-tomorrow_night_blue');
      var editorThemeTomorrowNightBrightBtn = element.find('#jtg-editor-theme-tomorrow_night_bright');
      var editorThemeTomorrowNightEightiesBtn = element.find('#jtg-editor-theme-tomorrow_night_eighties');
      var editorThemeTwilightBtn = element.find('#jtg-editor-theme-twilight');
      var editorThemeVibrantInkBtn = element.find('#jtg-editor-theme-vibrant_ink');
      var editorThemeXcodeBtn = element.find('#jtg-editor-theme-xcode');
      
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      
      //-----------------------------------------------------------------------
      // view menu button actions
      //-----------------------------------------------------------------------
      
      // font size selection
      
      var selectedFontSizeBtn = viewNormalFontBtn;
      
      viewSmallerFontBtn.click(onViewSmallerFontBtnClick);
      viewSmallFontBtn.click(onViewSmallFontBtnClick);
      viewNormalFontBtn.click(onViewNormalFontBtnClick);
      viewLargeFontBtn.click(onViewLargeFontBtnClick);
      viewLargerFontBtn.click(onViewLargerFontBtnClick);
      
      function onViewSmallerFontBtnClick(event) {
        onViewFontBtnClick(10, viewSmallerFontBtn);
      }
      function onViewSmallFontBtnClick(event) {
        onViewFontBtnClick(12, viewSmallFontBtn);
      }
      function onViewNormalFontBtnClick(event) {
        onViewFontBtnClick(14, viewNormalFontBtn);
      }
      function onViewLargeFontBtnClick(event) {
        onViewFontBtnClick(16, viewLargeFontBtn);
      }
      function onViewLargerFontBtnClick(event) {
        onViewFontBtnClick(18, viewLargerFontBtn);
      }
      
      function onViewFontBtnClick(size, btn) {
        workbench.ui.editor.setFontSize(size);
        workbench.ui.editor.focus();
        
        element.menu('setIcon', { target: selectedFontSizeBtn, iconCls: 'icon-blank' });
        selectedFontSizeBtn = btn;
        element.menu('setIcon', { target: selectedFontSizeBtn, iconCls: 'icon-ok' });
      }
      
      
      // gui theme selection
      
      var selectedGuiThemeBtn = guiThemeDefaultBtn;
      
      guiThemeDefaultBtn.click(onGuiThemeDefaultBtnClick);
      guiThemeBootstrapBtn.click(onGuiThemeBootstrapBtnClick);
      guiThemeMetroBtn.click(onGuiThemeMetroBtnClick);
      guiThemeGrayBtn.click(onGuiThemeGrayBtnClick);
      guiThemeBlackBtn.click(onGuiThemeBlackBtnClick);
      guiThemeMaterialBtn.click(onGuiThemeMaterialBtnClick);
      guiThemeCupertinoBtn.click(onGuiThemeCupertinoBtnClick);
      guiThemeSunnyBtn.click(onGuiThemeSunnyBtnClick);
      guiThemePepperGrinderBtn.click(onGuiThemePepperGrinderBtnClick);
      guiThemeDarkHiveBtn.click(onGuiThemeDarkHiveBtnClick);
      guiThemeMetroBlueBtn.click(onGuiThemeMetroBlueBtnClick);
      guiThemeMetroGrayBtn.click(onGuiThemeMetroGrayBtnClick);
      guiThemeMetroGreenBtn.click(onGuiThemeMetroGreenBtnClick);
      guiThemeMetroOrangeBtn.click(onGuiThemeMetroOrangeBtnClick);
      guiThemeMetroRedBtn.click(onGuiThemeMetroRedBtnClick);
      
      function setGuiTheme(theme, btn) {
        var cssUrl = '/easy-ui/themes/' + theme + '/easyui.css';
        $('#jtg-gui-themes').attr('href', cssUrl);
        workbench.ui.editor.focus();
        
        element.menu('setIcon', { target: selectedGuiThemeBtn, iconCls: 'icon-blank' });
        selectedGuiThemeBtn = btn;
        element.menu('setIcon', { target: selectedGuiThemeBtn, iconCls: 'icon-ok' });
      }
      function onGuiThemeDefaultBtnClick(event) {
        setGuiTheme('default', $(this));
      }
      function onGuiThemeBootstrapBtnClick(event) {
        setGuiTheme('bootstrap', $(this));
      }
      function onGuiThemeMetroBtnClick(event) {
        setGuiTheme('metro', $(this));
      }
      function onGuiThemeGrayBtnClick(event) {
        setGuiTheme('gray', $(this));
      }
      function onGuiThemeBlackBtnClick(event) {
        setGuiTheme('black', $(this));
      }
      function onGuiThemeMaterialBtnClick(event) {
        setGuiTheme('material', $(this));
      }
      function onGuiThemeCupertinoBtnClick(event) {
        setGuiTheme('ui-cupertino', $(this));
      }
      function onGuiThemeSunnyBtnClick(event) {
        setGuiTheme('ui-sunny', $(this));
      }
      function onGuiThemePepperGrinderBtnClick(event) {
        setGuiTheme('ui-pepper-grinder', $(this));
      }
      function onGuiThemeDarkHiveBtnClick(event) {
        setGuiTheme('ui-dark-hive', $(this));
      }
      function onGuiThemeMetroBlueBtnClick(event) {
        setGuiTheme('metro-blue', $(this));
      }
      function onGuiThemeMetroGrayBtnClick(event) {
        setGuiTheme('metro-gray', $(this));
      }
      function onGuiThemeMetroGreenBtnClick(event) {
        setGuiTheme('metro-green', $(this));
      }
      function onGuiThemeMetroOrangeBtnClick(event) {
        setGuiTheme('metro-orange', $(this));
      }
      function onGuiThemeMetroRedBtnClick(event) {
        setGuiTheme('metro-red', $(this));
      }
      
      
      // editor theme selection
      
      var selectedEditorThemeBtn = editorThemeTextmateBtn;
      
      editorThemeAmbianceBtn.click(onEditorThemeAmbianceBtnClick);
      editorThemeChaosBtn.click(onEditorThemeChaosBtnClick);
      editorThemeChromeBtn.click(onEditorThemeChromeBtnClick);
      editorThemeCloudsBtn.click(onEditorThemeCloudsBtnClick);
      editorThemeCloudsNightBtn.click(onEditorThemeCloudsNightBtnClick);
      editorThemeCobaltBtn.click(onEditorThemeCobaltBtnClick);
      editorThemeCrimsonEditorBtn.click(onEditorThemeCrimsonEditorBtnClick);
      editorThemeDawnBtn.click(onEditorThemeDawnBtnClick);
      editorThemeDreamweaverBtn.click(onEditorThemeDreamweaverBtnClick);
      editorThemeEclipseBtn.click(onEditorThemeEclipseBtnClick);
      editorThemeGithubBtn.click(onEditorThemeGithubBtnClick);
      editorThemeIdleFingersBtn.click(onEditorThemeIdleFingersBtnClick);
      editorThemeIplasticBtn.click(onEditorThemeIplasticBtnClick);
      editorThemeKatzenmilchBtn.click(onEditorThemeKatzenmilchBtnClick);
      editorThemeKrThemeBtn.click(onEditorThemeKrThemeBtnClick);
      editorThemeKuroirBtn.click(onEditorThemeKuroirBtnClick);
      editorThemeMerbivoreBtn.click(onEditorThemeMerbivoreBtnClick);
      editorThemeMerbivoreSoftBtn.click(onEditorThemeMerbivoreSoftBtnClick);
      editorThemeMonoIndustrialBtn.click(onEditorThemeMonoIndustrialBtnClick);
      editorThemeMonokaiBtn.click(onEditorThemeMonokaiBtnClick);
      editorThemePastelOnDarkBtn.click(onEditorThemePastelOnDarkBtnClick);
      editorThemeSolarizedDarkBtn.click(onEditorThemeSolarizedDarkBtnClick);
      editorThemeSolarizedLightBtn.click(onEditorThemeSolarizedLightBtnClick);
      editorThemeSqlServerBtn.click(onEditorThemeSqlServerBtnClick);
      editorThemeTerminalBtn.click(onEditorThemeTerminalBtnClick);
      editorThemeTextmateBtn.click(onEditorThemeTextmateBtnClick);
      editorThemeTomorrowBtn.click(onEditorThemeTomorrowBtnClick);
      editorThemeTomorrowNightBtn.click(onEditorThemeTomorrowNightBtnClick);
      editorThemeTomorrowNightBlueBtn.click(onEditorThemeTomorrowNightBlueBtnClick);
      editorThemeTomorrowNightBrightBtn.click(onEditorThemeTomorrowNightBrightBtnClick);
      editorThemeTomorrowNightEightiesBtn.click(onEditorThemeTomorrowNightEightiesBtnClick);
      editorThemeTwilightBtn.click(onEditorThemeTwilightBtnClick);
      editorThemeVibrantInkBtn.click(onEditorThemeVibrantInkBtnClick);
      editorThemeXcodeBtn.click(onEditorThemeXcodeBtnClick);
      
      function setEditorTheme(theme, btn) {
        var editorTheme = 'ace/theme/' + theme;
        workbench.ui.editor.setTheme(editorTheme);
        workbench.ui.editor.focus();
        
        element.menu('setIcon', { target: selectedEditorThemeBtn, iconCls: 'icon-blank' });
        selectedEditorThemeBtn = btn;
        element.menu('setIcon', { target: selectedEditorThemeBtn, iconCls: 'icon-ok' });
      }
      
      function onEditorThemeAmbianceBtnClick(event) {
        setEditorTheme('ambiance', $(this));
      }
      function onEditorThemeChaosBtnClick(event) {
        setEditorTheme('chaos', $(this));
      }
      function onEditorThemeChromeBtnClick(event) {
        setEditorTheme('chrome', $(this));
      }
      function onEditorThemeCloudsBtnClick(event) {
        setEditorTheme('clouds', $(this));
      }
      function onEditorThemeCloudsNightBtnClick(event) {
        setEditorTheme('clouds_midnight', $(this));
      }
      function onEditorThemeCobaltBtnClick(event) {
        setEditorTheme('cobalt', $(this));
      }
      function onEditorThemeCrimsonEditorBtnClick(event) {
        setEditorTheme('crimson_editor', $(this));
      }
      function onEditorThemeDawnBtnClick(event) {
        setEditorTheme('dawn', $(this));
      }
      function onEditorThemeDreamweaverBtnClick(event) {
        setEditorTheme('dreamweaver', $(this));
      }
      function onEditorThemeEclipseBtnClick(event) {
        setEditorTheme('eclipse', $(this));
      }
      function onEditorThemeGithubBtnClick(event) {
        setEditorTheme('github', $(this));
      }
      function onEditorThemeIdleFingersBtnClick(event) {
        setEditorTheme('idle_fingers', $(this));
      }
      function onEditorThemeIplasticBtnClick(event) {
        setEditorTheme('iplastic', $(this));
      }
      function onEditorThemeKatzenmilchBtnClick(event) {
        setEditorTheme('katzenmilch', $(this));
      }
      function onEditorThemeKrThemeBtnClick(event) {
        setEditorTheme('kr_theme', $(this));
      }
      function onEditorThemeKuroirBtnClick(event) {
        setEditorTheme('kuroir', $(this));
      }
      function onEditorThemeMerbivoreBtnClick(event) {
        setEditorTheme('merbivore', $(this));
      }
      function onEditorThemeMerbivoreSoftBtnClick(event) {
        setEditorTheme('merbivore_soft', $(this));
      }
      function onEditorThemeMonoIndustrialBtnClick(event) {
        setEditorTheme('mono_industrial', $(this));
      }
      function onEditorThemeMonokaiBtnClick(event) {
        setEditorTheme('monokai', $(this));
      }
      function onEditorThemePastelOnDarkBtnClick(event) {
        setEditorTheme('pastel_on_dark', $(this));
      }
      function onEditorThemeSolarizedDarkBtnClick(event) {
        setEditorTheme('solarized_dark', $(this));
      }
      function onEditorThemeSolarizedLightBtnClick(event) {
        setEditorTheme('solarized_light', $(this));
      }
      function onEditorThemeSqlServerBtnClick(event) {
        setEditorTheme('sqlserver', $(this));
      }
      function onEditorThemeTerminalBtnClick(event) {
        setEditorTheme('terminal', $(this));
      }
      function onEditorThemeTextmateBtnClick(event) {
        setEditorTheme('textmate', $(this));
      }
      function onEditorThemeTomorrowBtnClick(event) {
        setEditorTheme('tomorrow', $(this));
      }
      function onEditorThemeTomorrowNightBtnClick(event) {
        setEditorTheme('tomorrow_night', $(this));
      }
      function onEditorThemeTomorrowNightBlueBtnClick(event) {
        setEditorTheme('tomorrow_night_blue', $(this));
      }
      function onEditorThemeTomorrowNightBrightBtnClick(event) {
        setEditorTheme('tomorrow_night_bright', $(this));
      }
      function onEditorThemeTomorrowNightEightiesBtnClick(event) {
        setEditorTheme('tomorrow_night_eighties', $(this));
      }
      function onEditorThemeTwilightBtnClick(event) {
        setEditorTheme('twilight', $(this));
      }
      function onEditorThemeVibrantInkBtnClick(event) {
        setEditorTheme('vibrant_ink', $(this));
      }
      function onEditorThemeXcodeBtnClick(event) {
        setEditorTheme('xcode', $(this));
      }
    
    }
    
    return {
      restrict: 'A',
      template: template,
      link: link
    };
  }

})();


