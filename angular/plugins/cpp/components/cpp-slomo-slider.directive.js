(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .directive('jtgCppSlomoSlider', cppSlomoSlider);

  function cppSlomoSlider() {
    
    function link(scope, element, attrs) {
      var slider = $('<input class="easyui-slider">');
      element.append(slider);
      
      slider.slider({
        width: 100,
        min: 1,
        max: 10,
        onChange: onSliderChange
      });
      
      var value = scope.cpp.sloMoInterval / 1000;
      slider.slider('setValue', value);
      element.tooltip({
        content: 'Slow motion interval: ' + value + 's'
      });
      
      function onSliderChange(newValue, oldValue) {
        scope.cpp.setSloMoInterval(newValue * 1000);
        element.tooltip({
          content: 'Slow motion interval: ' + newValue + 's'
        });
      }
      
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
