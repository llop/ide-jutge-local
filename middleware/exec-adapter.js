var util = require('util'),
    EventEmitter = require('events'),
    termSpawn = require('pty.js').spawn,
    childSpawn = require('child_process').spawn;


//-----------------------------------------------------------------------------
// term process wrapper
//-----------------------------------------------------------------------------
function TermProc(term) {
  EventEmitter.call(this);
  this.term = term;
}

util.inherits(TermProc, EventEmitter);

TermProc.prototype.kill = killTerm;
TermProc.prototype.write = writeTerm;
TermProc.prototype.end = endTerm;

function killTerm() {
  if (this.term) this.term.destroy();
}
function writeTerm(data) {
  if (this.term) this.term.write(data);
}
function endTerm(data) {
  if (this.term) this.term.end(data);
}


//-----------------------------------------------------------------------------
// child process wrapper
//-----------------------------------------------------------------------------
function ChildProc(child) {
  EventEmitter.call(this);
  this.child = child;
}

util.inherits(ChildProc, EventEmitter);

ChildProc.prototype.kill = killChild;
ChildProc.prototype.write = writeChild;
ChildProc.prototype.end = endChild;

function killChild() {
  if (this.child) this.child.kill();
}
function writeChild(data) {
  if (this.child && this.child.stdin) this.child.stdin.write(data);
}
function endChild(data) {
  if (this.child && this.child.stdin) this.child.stdin.end(data);
}


//-----------------------------------------------------------------------------
// local process adapter
//-----------------------------------------------------------------------------
function localAdapter() {
  return {
    spawn: spawn,
    exec: exec
  };
  
  //---------------------------------------------------------------------------
  // spawn method
  //---------------------------------------------------------------------------
  function spawn(cmd, args, callback) {
    var term = termSpawn(cmd, args);
    var proc = new TermProc(term);
    
    term.on('error', onTermError);
    term.on('close', onTermClose);
    term.on('data', onTermData);
    // no stderr for terminal
    
    callback(proc);
    proc.emit('ready');
    
    function onTermError(error) {
      proc.emit('error', error);
    }
    function onTermClose(code, signal) {
      proc.emit('close', code, signal);
    }
    function onTermData(data) {
      proc.emit('std-out', data);
    }
  }

  //---------------------------------------------------------------------------
  // exec method
  //---------------------------------------------------------------------------
  function exec(cmd, args, callback) {
    var child = childSpawn(cmd, args);
    var proc = new ChildProc(child);
    
    child.on('error', onChildError);
    child.on('close', onChildClose);
    child.stdout.on('data', onChildData);
    child.stderr.on('data', onChildStderrData);
    
    callback(proc);
    proc.emit('ready');
    
    function onChildError(error) {
      proc.emit('error', error);
    }
    function onChildClose(code, signal) {
      proc.emit('close', code, signal);
    }
    function onChildData(data) {
      proc.emit('std-out', data);
    }
    function onChildStderrData(data) {
      proc.emit('std-err', data);
    }
  }
}


//-----------------------------------------------------------------------------
// helper function
//-----------------------------------------------------------------------------
function joinCommand(cmd, args) {
  var command = cmd;
  if (args && args.length>0) command += ' ' + args.join(' ');
  return command;
}


//-----------------------------------------------------------------------------
// exports
//-----------------------------------------------------------------------------
module.exports = {
  localAdapter: localAdapter
};















