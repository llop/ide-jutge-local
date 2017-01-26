(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgPluginLoader', pluginLoader);

  pluginLoader.$inject = ['workbench', '$controller', '$templateRequest', '$q', '$compile'];

  function pluginLoader(workbench, $controller, $templateRequest, $q, $compile) {

    function link(scope, element, attrs) {
      
      // create the controller instance for all the plugins
      // and call the onLoad function
      // load the html templates
      for (var pluginId in workbench.plugins) {
        var plugin = workbench.plugins[pluginId];
        var controllerName = plugin.controller;
        var childScope = scope.$new();
        var controllerImpl = $controller(controllerName, { $scope: childScope });
        plugin.controllerImpl = controllerImpl;
        controllerImpl.onLoad();
        
        // create plugin components
        var promises = [];
        for (var componentId in plugin.components) {
          var componentUrl = plugin.components[componentId];
          promises.push(loadAndCompile(componentId, componentUrl, childScope));
        }
        getAllTemplates(pluginId, promises);
      }
      
      function loadAndCompile(id, url, childScope) {
        var promise = $templateRequest(url);
        promise.then(onTemplateRequestDone);
        return promise;
        
        function onTemplateRequestDone(html) {
          var template = $(html);
          
          var component = $('#' + id);
          component.append(template);
          
          $.parser.parse();
          $compile(template)(childScope);
        }
      }
      
      function getAllTemplates(pluginId, promises) {
        $q.all(promises).then(onGetAllTemplatesDone);
        
        function onGetAllTemplatesDone(all) {
          var controller = workbench.plugins[pluginId].controllerImpl;
          controller.postLink();
          
          var active = workbench.firstPlugin == pluginId;
          if (active) controller.activate();
          else controller.deactivate();
        }
      }
    }

    return {
      terminal: true,  // we want this one to go last
      restrict: 'A',
      link: link
    };
  }

})();
