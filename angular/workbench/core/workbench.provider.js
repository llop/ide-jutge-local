(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .provider('workbench', workbenchProvider);

  function workbenchProvider() {

    /*
    // a plugin is an angular app
    // that can take advantage of the base workbench app
    // a plugin can add components to the dom to customize the menu bar and the right panel
    // a plugin can add services to interact with the workbench
    
    // to add a new plugin, 
    // you need an angular service that registers it
    CppService:
    var plugin = {
      id: 'cpp',
      name: 'C++',
      components: {
        'menu-bar': '../menu-bar.html',
        'panel': '../panel.html'
      },
      services: {
        'cpp-service': me
      }
    };
    workbenchProvider.registerPlugin(plugin);
    
    // the jtg-plugin-loader directive will automatically load templates
    // these templates are defined in the plugin descriptor as URL paths
    // each template is loaded via ajax, parsed by easui and complied by angular
    // typically you will want to create controllers and maybe directives
    
    // plugin services are required to implement the activate and deactivate methods
    // which are executed when the user changes between plugins
    */
    

    var me = this;
    me.$get = workbench;


    //-------------------------------------------------------------------------
    // the provider instance
    //------------------------------------------------------------------------- 

    workbench.$inject = ['socketFactory'];
    
    function workbench(socketFactory) {

      // service instance
      var me = {
        // socket
        socket: socketFactory(),

        // plugins
        registerPlugin: registerPlugin,
        activatePlugin: activatePlugin,
        
        plugins: {},

        activePlugin: undefined,
        firstPlugin: undefined,

        ui: undefined,

        saveFile: saveFile
      }


      // plugin management
      function registerPlugin(pluginConfig) {
        if (me.firstPlugin == undefined) me.firstPlugin = pluginConfig.id;
        me.plugins[pluginConfig.id] = pluginConfig;
      }
      
      
      function activatePlugin(pluginId) {
        if (me.activePlugin == pluginId) return;

        if (me.activePlugin != undefined) {
          var plugin = me.plugins[me.activePlugin];
          plugin.controllerImpl.deactivate();
        }

        me.activePlugin = pluginId;
        var plugin = me.plugins[me.activePlugin];
        plugin.controllerImpl.deactivate();
      }



      // files
      function saveFile(filePath, callback) {
        var editor = me.ui.editor;
        var undoManager = editor.session.getUndoManager();
        if (!undoManager.isClean()) {
          var fileContent = editor.getValue();
          undoManager.markClean();

          function onSaveFileDone(savedFilePath) {
            me.socket.removeListener('text-file-save-done', onSaveFileDone);
            callback();
          }
          me.socket.on('text-file-save-done', onSaveFileDone);
          me.socket.emit('text-file-save', filePath, fileContent);
        } else callback();
      }

      // return the provider instance
      return me;
    }

  }

})();
