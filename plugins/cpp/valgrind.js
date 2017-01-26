var events = require('events'),
    parseString = require('xml2js').parseString;

function valgrind(execAdapter, valgrindOptions) {
  
  //----------------------------------------------------------------------------
  // 
  // this is an event emitter
  // 
  //----------------------------------------------------------------------------
  var me = this;
  events.EventEmitter.call(me);
  Object.setPrototypeOf(valgrind.prototype, events.EventEmitter.prototype);
  
  
  //----------------------------------------------------------------------------
  // 
  // valgrind API
  // 
  //----------------------------------------------------------------------------
  valgrind.prototype.write = write;
  valgrind.prototype.ready = ready;
  valgrind.prototype.kill = kill;
  
  
  //----------------------------------------------------------------------------
  // 
  // valgrind proc
  // 
  //----------------------------------------------------------------------------
  var valgr = undefined;
  
  
  //----------------------------------------------------------------------------
  // 
  // write
  // 
  //----------------------------------------------------------------------------
  
  function write(data) {
    if (valgr) valgr.write(data);
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
      if (valgr) valgr.kill();
      valgr = undefined;
      me.emit('valgrind-killed');
    }
  }
  
  
  //----------------------------------------------------------------------------
  // 
  // parse options
  // 
  //----------------------------------------------------------------------------
  
  // program name and gdb-gdbServer connection params
  valgrindOptions = valgrindOptions || {};
  var programName = valgrindOptions.programName;
  var programArgs = valgrindOptions.programArgs || [];
  
  
  //----------------------------------------------------------------------------
  // 
  // start valgrind
  // 
  //----------------------------------------------------------------------------
  
  var logFile = process.env.NODE_PATH + '/workspace/valgrind-out.xml';
  var args = ['--xml=yes', '--xml-file=' + logFile, programName].concat(programArgs);
  execAdapter.spawn('valgrind', args, onValgrindSpawn);
  
  function onValgrindSpawn(proc) {
    valgr = proc;
    proc.on('ready', onValgrindSpawnReady);
    proc.on('error', onValgrindSpawnError);
    proc.on('close', onValgrindClose);
    proc.on('std-out', onValgrindData);
    proc.on('std-err', onValgrindStderrData);
  }
  function onValgrindSpawnReady() {
    readyHandler();
  }
  function onValgrindSpawnError(error) {
    console.log('JUTGE ERROR - VALGRIND SPAWN ' + programName + ' ' + programArgs);
    console.log(error);
    
    processResult();
  }
  function onValgrindClose(code, signal) {
    processResult();
  }

  function onValgrindData(data) {
    me.emit("valgrind-out", data);
  }

  function onValgrindStderrData(data) {
    me.emit("valgrind-err", data);
  }
  
  
  //----------------------------------------------------------------------------
  // 
  // process valgrind result
  // 
  //----------------------------------------------------------------------------
  
  function processResult() {
    execAdapter.exec('cat', [logFile], onCatDone);
  }
  function onCatDone(proc) {
    var stdout = '';
    proc.on('error', onCatExecError);
    proc.on('std-out', onCatExecData);
    proc.on('close', onCatExecClose);
    
    function onCatExecData(data) {
      stdout += data;
    }
    function onCatExecClose(code, signal) {
      parseString(stdout, onParseStringDone);
    }
  }
  function onCatExecError(error) {
    console.log('JUTGE ERROR - VALGRIND CAT EXEC ' + programName + ' ' + programArgs);
    console.log(error);
    
    me.kill();
  }
  function onParseStringDone(err, result) {
    me.emit('valgrind-result', result);
    me.kill();
  }

}

module.exports = valgrind;


