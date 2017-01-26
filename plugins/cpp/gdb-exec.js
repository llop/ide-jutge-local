var events = require('events');


function gdbExec(execAdapter, gdbOptions) {
  //----------------------------------------------------------------------------
  // 
  // this is an event emitter
  // 
  //----------------------------------------------------------------------------
  var me = this;
  events.EventEmitter.call(me);
  Object.setPrototypeOf(gdbExec.prototype, events.EventEmitter.prototype);

  //----------------------------------------------------------------------------
  // 
  // gdbExec API
  // 
  //----------------------------------------------------------------------------
  
  gdbExec.prototype.appStdinWrite = appStdinWrite;
  gdbExec.prototype.write = write;
  gdbExec.prototype.ready = ready;
  gdbExec.prototype.kill = kill;
  
  //----------------------------------------------------------------------------
  // 
  // parse options
  // 
  //----------------------------------------------------------------------------
  
  // program name and gdb-gdbServer connection params
  gdbOptions = gdbOptions || {};
  var programName = gdbOptions.programName;
  var programArgs = gdbOptions.programArgs || [];
  var comm = gdbOptions.comm;

  //----------------------------------------------------------------------------
  // 
  // gdbServer and gdb io streams
  // 
  //----------------------------------------------------------------------------  
  
  var gdb = undefined;
  var gdbServer = undefined;
  
  //----------------------------------------------------------------------------
  // 
  // write
  // 
  //----------------------------------------------------------------------------
  
  function appStdinWrite(data) {
    if (gdbServer) gdbServer.write(data);
  }
  
  function write(data) {
    if (gdb) gdb.write(data);
  }

  //----------------------------------------------------------------------------
  // 
  // ready event
  // 
  //----------------------------------------------------------------------------
  
  var readyFlag = false;
  var readyCallbackQueue = [];
  
  function readyHandler() {
    readyFlag = true;
    while (readyCallbackQueue.length > 0) {
      var callback = readyCallbackQueue.shift();
      callback();
    }
  }
  
  function ready(callback) {
    if (readyFlag) callback();
    else readyCallbackQueue.push(callback);
  }

  //----------------------------------------------------------------------------
  // 
  // kill
  // 
  //----------------------------------------------------------------------------
  
  var killed = false;
  
  function kill() {
    if (!killed) {
      killed = true;
      // kill server and debugger
      if (gdbServer) gdbServer.kill();
      if (gdb) gdb.kill();
      // unreference 
      gdbServer = undefined;
      gdb = undefined;
      // broadcast death!
      //console.log("GDB KILLED!");
      me.emit('gdb-killed');
    }
  }

  //----------------------------------------------------------------------------
  // 
  // start gdbServer, then gdb
  // 
  //----------------------------------------------------------------------------
  
  var gdbServerCmd = 'gdbserver';
  var gdbServerArgs = [comm, programName].concat(programArgs);
  execAdapter.spawn(gdbServerCmd, gdbServerArgs, onGdbServerSpawn);
  
  
  function onGdbServerSpawn(proc) {
    gdbServer = proc;
    proc.on('error', onGdbServerSpawnError);
    proc.on('ready', onGdbServerSpawnReady);
    proc.on('close', onGdbServerClose);
    proc.on('std-out', onGdbServerData);
    proc.on('std-err', onGdbServerStderrData);
  }
  
  function onGdbServerSpawnError(error) {
    //console.log('JUTGE ERROR - GDBSERVER SPAWN ' + comm + ' ' + programName + ' ' + programArgs);
    //console.log(error);
    
    me.kill();
  }
  function onGdbServerSpawnReady() {
    execAdapter.exec('gdb', ['-i', 'mi'], onGdbSpawn);
  }
  function onGdbServerClose(code, signal) {
    me.kill();
  }
  function onGdbServerData(data) {
    me.emit("app-out", data);
  }
  function onGdbServerStderrData(data) {
    me.emit("app-err", data);
  }


  //---------------------------------------------------------------------------
  // gdb proc callbacks
  //---------------------------------------------------------------------------
  function onGdbSpawn(proc) {
    gdb = proc;
    proc.on('error', onGdbSpawnError);
    proc.on('ready', onGdbSpawnReady);
    proc.on('close', onGdbClose);
    proc.on('std-out', onGdbData);
    proc.on('std-err', onGdbStderrData);
  }
  function onGdbSpawnError(error) {
    //console.log('JUTGE ERROR - GDB SPAWN ' + programName + ' ' + programArgs);
    //console.log(error);
    
    me.kill();
  }
  function onGdbSpawnReady() {
    // we can call this later, gdb needs some time to start up
    // TODO: let gdb notify us when it's ready instead of hoping the timeout is enough
    setTimeout(readyHandler, 100);
  }
  function onGdbClose(code, signal) {
    me.kill();
  }
  function onGdbData(data) {
    me.emit("gdb-out", data);
  }
  function onGdbStderrData(data) {
    me.emit("gdb-err", data);
  }
}

module.exports = gdbExec;
