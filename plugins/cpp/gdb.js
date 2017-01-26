var events = require('events'),
    gdbExec = require('./gdb-exec'),
    gdbParser = require('gdb-mi-parser');

//------------------------------------------------------------------------------
// 
// javascript gdb wrapper
// 
// What you need on your system:
// 
// * gdbserver (^7.7.1)
// 
// * gdb (^7.7.1)
//     
//   You MUST add this to your ~/.gdbinit file:
//     set pagination off
//     set non-stop on
//     set target-async on
//     
//   This sets gdb in non-stop mode (see 
//   https://sourceware.org/gdb/onlinedocs/gdb/Non_002dStop-Mode.html)
//   and allows '-exec-interrupt' to actually work!
//   
//------------------------------------------------------------------------------
function gdb(execAdapter) {

  //----------------------------------------------------------------------------
  // 
  // make this an event emitter
  // 
  //----------------------------------------------------------------------------
  var me = this;
  events.EventEmitter.call(me);
  Object.setPrototypeOf(gdb.prototype, events.EventEmitter.prototype);

  //----------------------------------------------------------------------------
  // 
  // debug API
  // 
  //----------------------------------------------------------------------------
  gdb.prototype.reset = reset;
  gdb.prototype.sendCommand = sendCommand;
  gdb.prototype.appStdinWrite = appStdinWrite;  
  gdb.prototype.load = load;
  gdb.prototype.run =
  gdb.prototype.continue = run;
  gdb.prototype.pause = pause;
  gdb.prototype.stop = stop;
  gdb.prototype.stepOver = stepOver;
  gdb.prototype.stepInto = stepInto;
  gdb.prototype.stepOut = stepOut;
  gdb.prototype.evalExpression = evalExpression;
  //gdb.prototype.setVariableValue = setVariableValue;
  gdb.prototype.insertBreakpoint = insertBreakpoint;
  gdb.prototype.enableBreakpoints = enableBreakpoints;
  gdb.prototype.deleteBreakpoints = deleteBreakpoints;
  gdb.prototype.disableBreakpoints = disableBreakpoints;
  gdb.prototype.listVariables = listVariables;
  gdb.prototype.callStack = callStack;
  gdb.prototype.stackArgs = stackArgs;
  gdb.prototype.selectedFrameInfo = selectedFrameInfo;
  gdb.prototype.setSelectedFrame = setSelectedFrame;
  
  gdb.prototype.available = available;

  //----------------------------------------------------------------------------
  // 
  // event lookup table
  // 
  //----------------------------------------------------------------------------
  var outputTypeToGdbEvent = {
    'console': 'gdb-console-out',       // these are the 'stream records'
    'log':     'gdb-internals-out',     // they are usually junk
    'target':  'gdb-target-out',
    
    'result':  'gdb-command-response',  // these are the 'async record'
    'exec':    'gdb-state-change',      // to simplify, let's call these 2 'exec out records'
    
    'notify':  'gdb-info',              // and these 2 'notify out records'
    'status':  'gdb-progress'
  };

  //----------------------------------------------------------------------------
  // prefix commands with a token so we can invoke the right callback later
  //----------------------------------------------------------------------------
  var currentToken = 0;
  var commandCallbacks = {};

  var debuggerState = 'idle';      // 'idle' or 'active'
  var executionState = 'stopped';  // 'stopped' or 'running'
  var avail = true;
  
  var gdbExecInstance = undefined;

  var host = 'localhost';
  var port = 4321;
  var comm = host + ':' + port;


  //----------------------------------------------------------------------------
  // back to initial state
  //----------------------------------------------------------------------------
  function reset() {
    if (gdbExecInstance) gdbExecInstance.kill();
    gdbExecInstance = undefined;
    
    debuggerState = 'idle';
    executionState = 'stopped';
    
    avail = true;
  }
  
  function available() {
    return avail;
  }
  
  //----------------------------------------------------------------------------
  //
  // ADVANCED USE: send any one command to gdb
  // 
  //----------------------------------------------------------------------------
  function sendCommand(command, args, callback) {
    if (debuggerState == 'idle') {
      callback({ error: 'You cannot issue a command if you are not debugging' });
      return;
    }
    command(command, args, callback);
  }
  
  function appStdinWrite(data) {
    if (gdbExecInstance) gdbExecInstance.appStdinWrite(data);
  }
  
  
  //----------------------------------------------------------------------------
  // 
  // loads the debug session for the specified program
  // 
  //----------------------------------------------------------------------------
  function load(programName, programArgs, callback) {
    // debug one program at a time!
    if (debuggerState == 'active') {
      callback({ error: 'Already debugging a program' });
      return;
    }
    debuggerState = 'active';
    avail = false;
    
    gdbExecInstance = new gdbExec(execAdapter, {
      programName: programName,
      programArgs: programArgs,
      comm: comm
    });
    gdbExecInstance.ready(onGdbExecInstanceReady);
    function onGdbExecInstanceReady() {
      // hook up events
      gdbExecInstance.on('app-out', onGdbExecAppOut);
      gdbExecInstance.on('app-err', onGdbExecAppErr);  // this one should not happen if we are using a terminal
      gdbExecInstance.on('gdb-out', onGdbExecGdbOut);
      gdbExecInstance.on('gdb-err', onGdbExecGdbErr);
      gdbExecInstance.on('gdb-killed', onGdbExecGdbKilled);
      
      // -file-exec-and-symbols -> Specify the executable file to be debugged. 
      // This file is the one from which the symbol table is also read. 
      // If no file is specified, the command clears the executable and symbol information. 
      // If breakpoints are set when using this command with no arguments, gdb will produce error messages. 
      // Otherwise, no output is produced, except a completion notification.
      command('-file-exec-and-symbols', [programName]);

      // -exec-arguments -> Set the inferior program arguments, to be used in the next ‘-exec-run’.
      command('-exec-arguments', programArgs);

      // -target-select -> Connect gdb to the remote target. This command takes two args:
      //   'type' -> The type of target, for instance ‘remote’, etc. 
      //   'parameters' -> Device names, host names and the like. 
      //                   See Commands for Managing Targets, for more details.
      //                   https://sourceware.org/gdb/onlinedocs/gdb/Target-Commands.html
      // The output is a connection notification, followed by the address 
      // at which the target program is, in the following form:
      //   ^connected,addr="address",func="function name",args=[arg list]
      command('-target-select', ['remote', comm], callback);
    }

    function onGdbExecAppOut(data) {
      me.emit('app-out', data);
    }
    
    function onGdbExecAppErr(data) {
      me.emit('app-err', data);
    }
    
    function onGdbExecGdbOut(data) {
      me.emit('gdb-out', data);
      processGdbMiOutput(data);
    }
    
    function onGdbExecGdbErr(data) {
      me.emit('gdb-err', data);
    }
      
    function onGdbExecGdbKilled() {
      me.emit('gdb-killed');
      me.emit('gdb-debug-state-change', 'idle');
    }
  }
  
  function run(callback) {
    // make sure we have started debugging something and we are on pause (status 'stopped')
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    // exec-continue -> Resumes the execution of the inferior program, which will continue to execute 
    // until it reaches a debugger stop event. If the ‘--reverse’ option is specified, execution resumes 
    // in reverse until it reaches a stop event. Stop events may include
    //   breakpoints or watchpoints
    //   signals or exceptions
    //   the end of the process (or its beginning under ‘--reverse’)
    //   the end or beginning of a replay log if one is being used.
    // In all-stop mode (see All-Stop Mode), may resume only one thread, or all threads, 
    // depending on the value of the ‘scheduler-locking’ variable. If ‘--all’ is specified, 
    // all threads (in all inferiors) will be resumed. The ‘--all’ option is ignored in all-stop mode. 
    // If the ‘--thread-group’ options is specified, then all threads in that thread group are resumed.
    command('-exec-continue', ['--all'], callback);
  }
  
  function pause(callback) {
    // make sure we have started debugging something and we are 'running'
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    
    // -exec-interrupt -> Interrupts the background execution of the target. 
    // Note how the token associated with the stop message is the one for the execution command that has been interrupted. 
    // The token for the interrupt itself only appears in the ‘^done’ output. 
    // If the user is trying to interrupt a non-running program, an error message will be printed.
    // 
    // Note that when asynchronous execution is enabled, this command is asynchronous just like other execution commands. 
    // That is, first the ‘^done’ response will be printed, and the target stop will be reported after that using the ‘*stopped’ notification.
    // 
    // In non-stop mode, only the context thread is interrupted by default. 
    // All threads (in all inferiors) will be interrupted if the ‘--all’ option is specified. 
    // If the ‘--thread-group’ option is specified, all threads in that group will be interrupted.
    command('-exec-interrupt', ['--all'], callback);
  }
  
  function stop(callback) {
    // if not running, u r stupid
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    
    // -gdb-exit -> Exit gdb immediately.
    command('-gdb-exit', [], callback);
  }
  
  //-------------------------------------------------------------------------
  // Step methods
  //-------------------------------------------------------------------------
  function stepOver(args, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot step over' });
      return;
    }

    // -exec-next -> Asynchronous command. Resumes execution of the inferior program, 
    // stopping when the beginning of the next source line is reached.
    command('-exec-next', args, callback);
  }
  
  function stepInto(args, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot step into' });
      return;
    }

    // -exec-step -> Asynchronous command. Resumes execution of the inferior program, 
    // stopping when the beginning of the next source line is reached, 
    // if the next source line is not a function call. 
    // If it is, stop at the first instruction of the called function
    command('-exec-step', args, callback);
  }
  
  function stepOut(args, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot step out' });
      return;
    }

    // -exec-finish -> Asynchronous command. Resumes the execution of the inferior program 
    // until the current function is exited. 
    // Displays the results returned by the function
    command('-exec-finish', args, callback);
  }
  
  //-------------------------------------------------------------------------
  // 
  // Query methods
  // 
  //-------------------------------------------------------------------------
  
  function evalExpression(expr, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot eval expression' });
      return;
    }
    
    // -data-evaluate-expression -> Evaluate expr as an expression. The expression 
    // could contain an inferior function call. The function call will execute synchronously. 
    // If the expression contains spaces, it must be enclosed in double quotes.
    command('-data-evaluate-expression', [expr], callback);
  }
  
  // deprected: use evalExpression instead
  function setVariableValue(varName, varValue, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot set variable value' });
      return;
    }
    
    // https://sourceware.org/gdb/current/onlinedocs/gdb/Assignment.html
    // To alter the value of a variable, evaluate an assignment expression
    command('-data-evaluate-expression', [varName + "=" + varValue], callback);
  }
  
  //-------------------------------------------------------------------------
  // 
  // Breakpoint methods
  // 
  //-------------------------------------------------------------------------
  
  function insertBreakpoint(args, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }

    // -break-insert -> inserts a breakpoint
    command('-break-insert', args, callback);
  }
  function enableBreakpoints(breakpoints, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }

    // -break-enable -> Enable (previously disabled) breakpoint(s)
    command('-break-enable', breakpoints, callback);
  }
  
  function deleteBreakpoints(breakpoints, callback) {
    // error check
    if (debuggerState=='idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }

    // -break-delete -> Delete the breakpoint(s) whose number(s) are specified in the argument list. 
    // This is obviously reflected in the breakpoint list.
    //command("-break-delete", breakpoints, callback);
    command('clear', breakpoints, callback);
  }

  function disableBreakpoints(breakpoints, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }

    // -break-disable -> Disable the named breakpoint(s). 
    // The field `enabled' in the break list is now set to `n' for the named breakpoint(s).
    command('-break-disable', breakpoints, callback);
  }

  function listBreakpoints(callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }

    // -break-list -> Displays the list of inserted breakpoints
    command('-break-list', [], callback);
  }
  
  // set args = ["2"] to get more data
  // use the --frame option to select frame --frame 0
  function listVariables(args, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot list variables' });
      return;
    }

    // -stack-list-variables -> Display the names of local variables and function arguments for the 
    // selected frame. If print-values is 0 or --no-values, print only the names of the variables; if it 
    // is 1 or --all-values, print also their values; and if it is 2 or --simple-values, print the name, 
    // type and value for simple data types, and the name and type for arrays, structures and unions. 
    command('-stack-list-variables', args, callback);
  }
  
  function callStack(args, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot get call stack' });
      return;
    }

    // -stack-list-frames -> List the frames currently on the stack
    command('-stack-list-frames', args, callback);
  }

  function stackArgs(args, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot get stack arguments' });
      return;
    }

    // stack-list-arguments -> Display a list of the arguments for the frames
    command('-stack-list-arguments', args, callback);
  }
  
  function selectedFrameInfo(callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot get info about selected frame' });
      return;
    }

    // -stack-info-frame -> Get info on the selected frame
    command('-stack-info-frame', [], callback);
  }
  
  function setSelectedFrame(framenum, callback) {
    // error check
    if (debuggerState == 'idle') {
      callback({ error: 'Not debugging a program' });
      return;
    }
    if (executionState == 'running') {
      callback({ error: 'Program is running, cannot set selected frame' });
      return;
    }

    // -stack-select-frame -> Change the selected frame. Select a different frame framenum on the stack
    command('-stack-select-frame', [framenum], callback);
  }


  //----------------------------------------------------------------------------
  // 
  // helper functions
  // 
  //----------------------------------------------------------------------------
  
  function command(name, args, callback) {
    if (gdbExecInstance) {
      commandCallbacks[currentToken] = callback;
      var cmd = currentToken.toString() + name + ' ' + args.join(' ') + '\n';
      ++currentToken;
      //console.log("CMD: "+cmd);
      gdbExecInstance.write(cmd);
    }
  }
  
  function processResultRecord(result) {
    // execute corresponding callback
    var token = result.token;
    var callback = commandCallbacks[token];
    if (callback) callback(result);
    delete commandCallbacks[token];
  }

  function processStreamRecord(result) {
    // those are usually junk
    // ignore for now
  }

  function processAsyncRecord(result) {
    if (result.outputType=='exec') {
      // update execution state
      executionState = result.class;
      me.emit('gdb-exec-state-change', result);
    } else if (result.outputType=='status') {
      // do nothing
    } else if (result.outputType=='notify') {
      // do nothing
    }
  }
  
  function processGdbMiResult(result) {
    if (!result) return;
    // console.log("processed result "+JSON.stringify(result));
    
    // record type can be 'result', 'stream', or 'async'
    if (result.recordType=='result') processResultRecord(result);
    else if (result.recordType=='stream') processStreamRecord(result);
    else if (result.recordType=='async') processAsyncRecord(result);
    // fire gdb event
    var event = outputTypeToGdbEvent[result.outputType];
    me.emit(event, result);
  }
  
  function processGdbMiOutput(data) {
    var result = gdbParser(data);
    result.outOfBandRecords.forEach(processOutOfBandRecord);
    processGdbMiResult(result.resultRecord);
    function processOutOfBandRecord(outOfBandRecord) {
      processGdbMiResult(outOfBandRecord);
    }
  }

}

module.exports = gdb;
