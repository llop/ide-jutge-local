(function() {
  'use strict';

  angular
    .module('ide.jutge.workbench')
    .directive('jtgStatusBar', statusBar);
    
  statusBar.$inject = ['workbench'];

  function statusBar(workbench) {

    function link(scope, element, attrs) {
      element.jtg = {
        // notifications
        notify: notify, 
        notifyInfo: notifyInfo,
        notifySuccess: notifySuccess,
        notifyError: notifyError,
      };
      workbench.ui.status = element;
      
      // notifications
      function notify(notifyOpts) {
        var template = 
          '<div class="disp-inl jtg-status-msg icon-' + notifyOpts.type + '">' +
            '<span class="fonb">' + notifyOpts.title + '</span> ' + 
            '<span>' + notifyOpts.text + '</span>' + 
          '</div>';
        element.html(template);
      }
      
      function clear() {
        element.html('');
      }
      
      function notifyType(type, title, text) {
        notify({
          type: type,
          title: title,
          text: text
        });
      }
      function notifyInfo(title, text) {
        notifyType('info', title, text);
      }
      function notifySuccess(title, text) {
        notifyType('success', title, text);
      }
      function notifyError(title, text) {
        notifyType('error', title, text);
      }
    }

    return {
      restrict: 'A',
      link: link
    };
  }

})();
