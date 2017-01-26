var localAdapter = require('../../middleware/exec-adapter').localAdapter,
    plugins = require('../../plugins/plugins.js'),
    fs = require('fs');
    

function workbenchController(io) {
  var execAdapter = localAdapter();
  io.on('connection', onIoConnection);
  
  //---------------------------------------------------------------------------
  // intercept every connection to add listeners to the socket:
  //   - 'disconnect'
  //   - 'box-request'
  // and after the sandbox is granted:
  //   - 'text-file-save'
  //   - 'text-file-request'
  //   - listeners that plugins will attach
  //---------------------------------------------------------------------------
  function onIoConnection(socket) {
    console.log('USER ' + socket.id + ' CONNECTED!');

    socket.on('disconnect', onDisconnect);
    socket.on('box-request', onBoxRequest);

    function onBoxRequest() {
      socket.removeListener('box-request', onBoxRequest);
      
      socket.on('text-file-save', onTextFileSave);
      
      // apply all plugins on the socket
      plugins().forEach(loadPlugin);
      function loadPlugin(plugin) {
        plugin(socket, execAdapter);
      }
      
      // vm is up and ready for stuff
      socket.emit('box-ready');
      
      //-----------------------------------------------------------------------
      // text file save callbacks
      //-----------------------------------------------------------------------
      function onTextFileSave(filePath, fileContent) {
        filePath = process.env.NODE_PATH + '/' + filePath;
        
        fs.writeFile(filePath, fileContent, 'utf8', onTextFileSaveDone);
        
        function onTextFileSaveDone(error) {
          if (error) {
            console.log('JUTGE ERROR - SAVE TEXT FILE ' + filePath);
            console.log(error);
          } else {
            socket.emit('text-file-save-done', filePath);
          }
        }
      }
    }

    function onDisconnect() {
      console.log('USER ' + socket.id + ' DISCONNECTED!');
    }
  }
}

module.exports = workbenchController;
