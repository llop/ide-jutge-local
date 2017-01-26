(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgMenuBar', menuBar);

  menuBar.$inject = ['workbench'];

  function menuBar(workbench) {
    
    var template =
      // the menu bar
      '<div id="jtg-menu" class="easyui-panel" data-options="fit:true,border:false">' +
        '<a id="jtg-menu-file-btn" href="#" class="easyui-menubutton" ' + 
          'data-options="menu:\'#jtg-menu-file\'">File</a>' +
        '<a id="jtg-menu-edit-btn" href="#" class="easyui-menubutton" ' + 
          'data-options="menu:\'#jtg-menu-edit\'">Edit</a>' +
        '<a id="jtg-menu-view-btn" href="#" class="easyui-menubutton" ' + 
          'data-options="menu:\'#jtg-menu-view\'">View</a>' +
        //'<a id="jtg-menu-plugins-btn" href="#" class="easyui-menubutton" ' + 
        //  'data-options="menu:\'#jtg-menu-plugins\'">Plugins</a>' + 
        '<a id="jtg-menu-help-btn" href="#" class="easyui-menubutton" ' + 
          'data-options="menu:\'#jtg-menu-help\'">Help</a>' +
          
        '<div id="jtg-menu-panel" class="jtg-menu-panel"></div>' + 
        '<div class="jtg-github-panel" data-jtg-github></div>' + 
        
      '</div>' + 
      // dialogs and menus go in this invisible div
      '<div class="disp-no">' + 
        // menues: file, edit, view, plugins
        '<div id="jtg-menu-file" class="easyui-menu wid150" data-jtg-file-menu></div>' + 
        '<div id="jtg-menu-edit" class="easyui-menu wid150" data-jtg-edit-menu></div>' + 
        '<div id="jtg-menu-view" class="easyui-menu wid150" data-jtg-view-menu></div>' + 
        //'<div id="jtg-menu-plugins" class="easyui-menu wid150" data-jtg-plugin-menu></div>' + 
        '<div id="jtg-menu-help" class="easyui-menu wid150" data-jtg-help-menu></div>' + 
      '</div>';
    
    function link(scope, element, attrs) {
      
      // have easyUI do its thang
      $.parser.parse(element);
      
      // top-level menus
      //var fileMenu = $('#jtg-menu-file');
      //var editMenu = $('#jtg-menu-edit');
      //var viewMenu = $('#jtg-menu-view');
      //var pluginsMenu = $('#jtg-menu-plugins');
      //var helpMenu = $('#jtg-menu-help');
      
      //workbench.ui.menu = {
      //  file: fileMenu,
      //  edit: editMenu,
      //  view: viewMenu,
      //  plugins: pluginsMenu,
      //  help: helpMenu
      //}
    }
    
    
    //-------------------------------------------------------------------------
    // 
    // navigate the menus using keyboard keys
    // 
    //-------------------------------------------------------------------------
    
    $.extend($.fn.menubutton.methods, { enableNav: enableNav });
    $.fn.menubutton.methods.enableNav();
      
    function getParentMenu(rootMenu, menu) {
      return findParent(rootMenu);
      
      function findParent(pmenu){
        var p = undefined;
        $(pmenu).find('.menu-item').each(processMenuItem);
        return p;
        
        function processMenuItem() {
          if (!p && this.submenu) {
            if ($(this.submenu)[0] == $(menu)[0]) p = pmenu;
            else p = findParent(this.submenu);
          }
        }
      }
    }
    
    function getParentItem(pmenu, menu){
      var item = undefined;
      $(pmenu).find('.menu-item').each(processMenuItem);
      return item;
      
      function processMenuItem() {
        if ($(this.submenu)[0] == $(menu)[0]){
          item = $(this);
          return false;
        }
      }
    }
    
    function enableNav(enabled){
      var curr;
      $(document).unbind('.menubutton');
      if (enabled == undefined) enabled = true;
      if (enabled) $(document).bind('keydown.menubutton', onMenuButtonKeyDown);
      
      function onMenuButtonKeyDown(e) {
        var currButton = $(this).find('.m-btn-active,.m-btn-plain-active,.l-btn:focus');
        if (!currButton.length) return;
        if (!curr || curr.button != currButton[0]) {
          curr = {
            menu: currButton.data('menubutton') ? $(currButton.menubutton('options').menu) : $(),
            button: currButton[0]
          };
        }
        var item = curr.menu.find('.menu-active');
        switch (e.keyCode) {
          case 13:  // enter
            item.trigger('click');
            break;
          case 27:  // esc
            currButton.trigger('mouseleave');
            break;
          case 38:  // up
            var prev = !item.length ? 
              curr.menu.find('.menu-item:last') : item.prevAll('.menu-item:first');
            prev.trigger('mouseenter');
            return false;
          case 40:  // down
            var next = !item.length ? 
              curr.menu.find('.menu-item:first') : item.nextAll('.menu-item:first');
            next.trigger('mouseenter');
            return false;
          case 37:  // left
            var pmenu = getParentMenu(currButton.data('menubutton') ? 
              $(currButton.menubutton('options').menu) : $(), curr.menu);
            if (pmenu) {
              item.trigger('mouseleave');
              var pitem = getParentItem(pmenu, curr.menu);
              if (pitem) pitem.trigger('mouseenter');
              curr.menu = pmenu;
            } else {
              var prev = currButton.prevAll('.l-btn:first');
              if (prev.length) {
                currButton.trigger('mouseleave');
                prev.focus();
              }
            }
            return false;
          case 39:  // right
            if (item.length && item[0].submenu) {
              curr.menu = $(item[0].submenu);
              curr.button = currButton[0];
              curr.menu.find('.menu-item:first').trigger('mouseenter');
            } else {
              var next = currButton.nextAll('.l-btn:first');
              if (next.length) {
                currButton.trigger('mouseleave');
                next.focus();
              }
            }
            return false;
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

