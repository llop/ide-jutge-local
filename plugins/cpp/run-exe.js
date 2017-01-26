var events = require('events');

function runExe(execAdapter, exeOptions) {
  
  //----------------------------------------------------------------------------
  // 
  // this is an event emitter
  // 
  //----------------------------------------------------------------------------
  var me = this;
  events.EventEmitter.call(me);
  Object.setPrototypeOf(runExe.prototype, events.EventEmitter.prototype);
  
  
  //----------------------------------------------------------------------------
  // 
  // valgrind API
  // 
  //----------------------------------------------------------------------------
  runExe.prototype.write = write;
  runExe.prototype.ready = ready;
  runExe.prototype.kill = kill;
  
  
  //----------------------------------------------------------------------------
  // 
  // program process
  // 
  //----------------------------------------------------------------------------
  var runner = undefined;
  
  
  //----------------------------------------------------------------------------
  // 
  // write
  // 
  //----------------------------------------------------------------------------
  function write(data) {
    if (runner) runner.write(data);
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
      if (runner) runner.kill();
      runner = undefined;
      me.emit('exe-killed');
    }
  }
  
  
  //----------------------------------------------------------------------------
  // 
  // parse options
  // 
  //----------------------------------------------------------------------------
  
  // program name and gdb-gdbServer connection params
  exeOptions = exeOptions || {};
  var programName = exeOptions.programName;
  var programArgs = exeOptions.programArgs || [];
  
  
  //----------------------------------------------------------------------------
  // 
  // start valgrind
  // 
  //----------------------------------------------------------------------------
  execAdapter.spawn('./' + programName, programArgs, onExeSpawn);
  
  
  function onExeSpawn(proc) {
    runner = proc;
    proc.on('ready', onExeSpawnReady);
    proc.on('error', onExeSpawnError);
    proc.on('close', onExeClose);
    proc.on('std-out', onExeData);
    proc.on('std-err', onExeStderrData);
  }
  
  function onExeSpawnReady() {
    readyHandler();
  }
  function onExeSpawnError(error) {
    //console.log('JUTGE ERROR - EXE SPAWN ' + programName + ' ' + programArgs);
    //console.log(error);
    
    me.kill();
  }
  function onExeClose(code, signal) {
    me.kill();
  }
  function onExeData(data) {
    //console.log("app-out "+data);
    me.emit("exe-out", data);
  }
  function onExeStderrData(data) {
    //console.log("app-err "+data);
    me.emit("exe-err", data);
  }
}

module.exports = runExe;


