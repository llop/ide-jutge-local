var gpp = require('./gpp'),
    gdbMI = require('./gdb'),
    valgrind = require('./valgrind'),
    runExe = require('./run-exe'),
    gppParser = require('gcc-output-parser');

function cppPlugin(socket, execAdapter) {

  var gdb = new gdbMI(execAdapter);
  var valgr = undefined;
  var exe = undefined;
  
  var filePath = process.env.NODE_PATH + '/workspace/main.cc';
  var execPath = process.env.NODE_PATH + '/workspace/a.out';

  addSocketListeners();

  function addSocketListeners() {
    socket.on('disconnect', onDisconnect);
    socket.on('gdb-run', onGdbRun);
    socket.on('gdb-stop', onGdbStop);
    socket.on('gdb-pause', onGdbPause);
    socket.on('gdb-continue', onGdbContinue);
    socket.on('gdb-step-over', onGdbStepOver);
    socket.on('gdb-step-into', onGdbStepInto);
    socket.on('gdb-step-out', onGdbStepOut);
    //socket.on('gdb-set-selected-frame', onGdbSetSelectedFrame);
    socket.on('gdb-vars-stack-exprs', onGdbVarsStackExpr);
    //socket.on('gdb-eval-expression', onGdbEvalExpression);
    socket.on('gdb-insert-break', onGdbInsertBreak);
    socket.on('gdb-delete-break', onGdbDeleteBreak);
    //socket.on('gdb-enable-break', onGdbEnableBreak);
    //socket.on('gdb-disable-break', onGdbDisableBreak);
    socket.on('gdb-app-in', onGdbAppIn);
    
    socket.on('valgrind-stop', onValgrindStop);
    socket.on('valgrind-in', onValgrindIn);
    socket.on('valgrind-run', onValgrindRun);
    
    socket.on('exe-stop', onExeStop);
    socket.on('exe-in', onExeIn);
    socket.on('exe-run', onExeRun);
  }

  function removeSocketListeners() {
    socket.removeListener('disconnect', onDisconnect);
    socket.removeListener('gdb-run', onGdbRun);
    socket.removeListener('gdb-stop', onGdbStop);
    socket.removeListener('gdb-pause', onGdbPause);
    socket.removeListener('gdb-continue', onGdbContinue);
    socket.removeListener('gdb-step-over', onGdbStepOver);
    socket.removeListener('gdb-step-into', onGdbStepInto);
    socket.removeListener('gdb-step-out', onGdbStepOut);
    //socket.removeListener('gdb-set-selected-frame', onGdbSetSelectedFrame);
    socket.removeListener('gdb-vars-stack-exprs', onGdbVarsStackExpr);
    //socket.removeListener('gdb-eval-expression', onGdbEvalExpression);
    socket.removeListener('gdb-insert-break', onGdbInsertBreak);
    socket.removeListener('gdb-delete-break', onGdbDeleteBreak);
    //socket.removeListener('gdb-enable-break', onGdbEnableBreak);
    //socket.removeListener('gdb-disable-break', onGdbDisableBreak);
    socket.removeListener('gdb-app-in', onGdbAppIn);
    
    socket.removeListener('valgrind-stop', onValgrindStop);
    socket.removeListener('valgrind-in', onValgrindIn);
    socket.removeListener('valgrind-run', onValgrindRun);
    
    socket.removeListener('exe-stop', onExeStop);
    socket.removeListener('exe-in', onExeIn);
    socket.removeListener('exe-run', onExeRun);
  }

  function addGdbListeners() {
    gdb.on('app-out', onAppOut);
    gdb.on('app-err', onAppErr);
    gdb.on('gdb-out', onGdbOut);
    gdb.on('gdb-err', onGdbErr);
    gdb.on('gdb-killed', onGdbKilled);
    gdb.on('gdb-exec-state-change', onGdbExecStateChange);
    gdb.on('gdb-debug-state-change', onGdbDebugStateChange);
  }

  function removeGdbListeners() {
    gdb.removeListener('app-out', onAppOut);
    gdb.removeListener('app-err', onAppErr);
    gdb.removeListener('gdb-out', onGdbOut);
    gdb.removeListener('gdb-err', onGdbErr);
    gdb.removeListener('gdb-killed', onGdbKilled);
    gdb.removeListener('gdb-exec-state-change', onGdbExecStateChange);
    gdb.removeListener('gdb-debug-state-change', onGdbDebugStateChange);
  }
  
  
  function addValgrindListeners() {
    valgr.on('valgrind-killed', onValgrindKilled);
    valgr.on('valgrind-out', onValgrindOut);
    valgr.on('valgrind-err', onValgrindErr);
    valgr.on('valgrind-result', onValgrindResult);
  }
  
  function removeValgrindListeners() {
    if (!valgr) return;
    valgr.removeListener('valgrind-killed', onValgrindKilled);
    valgr.removeListener('valgrind-out', onValgrindOut);
    valgr.removeListener('valgrind-err', onValgrindErr);
    valgr.removeListener('valgrind-result', onValgrindResult);
  }
  
  
  function addExeListeners() {
    exe.on('exe-killed', onExeKilled);
    exe.on('exe-out', onExeOut);
    exe.on('exe-err', onExeErr);
  }
  
  function removeExeListeners() {
    if (!exe) return;
    exe.removeListener('exe-killed', onExeKilled);
    exe.removeListener('exe-out', onExeOut);
    exe.removeListener('exe-err', onExeErr);
  }
  
  
  function onExeKilled() {
    socket.emit('exe-killed');
    
    removeExeListeners();
    exe = undefined;
  }
  
  function onExeOut(data) {
    socket.emit('exe-out', data.toString());
  }
  
  function onExeErr(data) {
    socket.emit('exe-err', data.toString());
  }
  
  
  
  function onValgrindKilled() {
    socket.emit('valgrind-killed');
    
    removeValgrindListeners();
    valgr = undefined;
  }
  
  function onValgrindOut(data) {
    socket.emit('valgrind-out', data.toString());
  }
  
  function onValgrindErr(data) {
    socket.emit('valgrind-err', data.toString());
  }
  
  function onValgrindResult(data) {
    
    // process data
    var valgrindData = [];
    if (data.valgrindoutput.error)
      data.valgrindoutput.error.forEach(processValgrindError);
    socket.emit('valgrind-result', valgrindData);
    
    function processValgrindError(err) {
      // make sure we get no nullpointers
      if (!(err.stack && err.stack[0] && err.stack[0].frame && err.stack[0].frame[0])) return;
      
      // make sure the error happens in the main file
      var frame = err.stack[0].frame[0];
      var obj = frame.obj[0];
      if (!obj.endsWith('/workspace/a.out')) return;
      
      // add error
      var line = frame.line;
      var kind = err.kind;
      var what = err.what;
      var auxWhat = err.auxwhat;
      valgrindData.push({
        line: line || 1,
        kind: kind || '',
        what: what || '',
        auxwhat: auxWhat || ''
      });
    }
    
  }
  

  //----------------------------------------------------------------------------
  // 
  // socket event handling
  // 
  //----------------------------------------------------------------------------
  
  function onDisconnect() {
    removeSocketListeners();
    removeGdbListeners();
    removeValgrindListeners();
    removeExeListeners();
    
    gdb.reset();
    if (valgr) {
      valgr.kill();
      valgr = undefined;
    }
    if (exe) {
      exe.kill();
      exe = undefined;
    }
  }
  
  
  
  function onExeRun(config) {
    if (exe) return;
    config = sanitizeConfig(config);
    compileAndThen(config, onCompileDone);
    
    function onCompileDone() {
      // start
      exe = new runExe(execAdapter, config);
      exe.ready(onExeReady);
      
      function onExeReady() {
        addExeListeners();
        socket.emit('exe-start', config.programName);
      }
    }
  }
  
  function onExeIn(data) {
    if (exe) exe.write(data);
  }
  
  function onExeStop() {
    if (exe) {
      exe.kill();
      exe = undefined;
    }
  }
  
  
  
  function onValgrindRun(config) {
    if (valgr) return;
    config = sanitizeConfig(config);
    compileAndThen(config, onCompileDone);
    
    function onCompileDone() {
      // start
      valgr = new valgrind(execAdapter, config);
      valgr.ready(onValgrindReady);
      
      function onValgrindReady() {
        addValgrindListeners();
        socket.emit('valgrind-start', config.programName);
      }
    }
  }
  
  function onValgrindIn(data) {
    if (valgr) valgr.write(data);
  }
  
  function onValgrindStop() {
    if (valgr) {
      valgr.kill();
      valgr = undefined;
    }
  }
  
  
  function compileAndThen(config, callback) {
    var stderr = '';
    gpp(config.programName, config.sourceFiles, execAdapter, gppCallback);
    
    function gppCallback(proc) {
      proc.on('error', onGppProcError);
      proc.on('std-err', onGppProcStderr);
      proc.on('close', onGppProcClose);
    }
    function onGppProcError(error) {
      console.log('JUTGE ERROR - RUNNING GPP ' + config);
      console.log(error);
    }
    function onGppProcStderr(data) {
      stderr += data;
    }
    function onGppProcClose(code, signal) {
      if (stderr == '') {
        socket.emit('gpp-compile-ok', config.programName);
        callback();
      } else {
        var compileErrors = gppParser.parseString(stderr);
        socket.emit('gpp-compile-error', config.programName, compileErrors);
      }
    }
  }
  
  
  function sanitizeConfig(config) {
    return {
      name: 'main.cc',
      sourceFiles: [ filePath ],
      programName: execPath, 
      programArgs: []
    };
  }
  

  function onGdbRun(config, breakpoints) {
    if (!gdb.available()) return;
    config = sanitizeConfig(config);
    
    //--------------------------------------------------------------------------
    // 0 - compile the program
    //--------------------------------------------------------------------------
    compileAndThen(config, onCompileDone);
    
    function onCompileDone() {
      //------------------------------------------------------------------------
      // 1 - load debug session
      //------------------------------------------------------------------------
      gdb.load(config.programName, config.programArgs, onGdbLoadDone);
      function onGdbLoadDone(data) {
        addGdbListeners();

        //----------------------------------------------------------------------
        // 2 - set breakpoints
        //----------------------------------------------------------------------
        breakpoints.forEach(processBreakpoint);
        function processBreakpoint(bp) {
          //console.log("BREAK "+breakArgs);
          gdb.insertBreakpoint([bp.filename + ':' + bp.line]);
        }
        //if (config.slomo) {
          gdb.insertBreakpoint(['main']);
        //}

        //----------------------------------------------------------------------
        // 3 - start program execution
        //----------------------------------------------------------------------
        gdb.run(onGdbRunDone);
        
        function onGdbRunDone(data) {
          //console.log("GDB started "+JSON.stringify(data));
          socket.emit('gdb-debug-start', config.programName);
        }
      }
    }
  }

  function onGdbStop() {
    //console.log('gdb-stop ');
    gdb.stop(onGdbStopDone);
    function onGdbStopDone(data) {
      //console.log("GDB stopped "+JSON.stringify(data));
    }
  }
  
  function onGdbPause() {
    //console.log('gdb-pause ');
    gdb.pause(onGdbPauseDone);
    function onGdbPauseDone(data) {
      //console.log("GDB paused "+JSON.stringify(data));
    }
  }
  
  function onGdbContinue() {
    //console.log('gdb-continue ');
    gdb.continue(onGdbContinueDone);
    function onGdbContinueDone(data) {
      //console.log("GDB continuing "+JSON.stringify(data));
    }
  }
  
  function onGdbStepOver() {
    //console.log('gdb-step-over ');
    gdb.stepOver([], onGdbStepOverDone);
    function onGdbStepOverDone(data) {
      //console.log("GDB stepped over "+JSON.stringify(data));
    }
  }
  
  function onGdbStepInto() {
    //console.log('gdb-step-into ');
    gdb.stepInto([], onGdbStepIntoDone);
    function onGdbStepIntoDone(data) {
      //console.log("GDB stepped into "+JSON.stringify(data));
    }
  }
  
  function onGdbStepOut() {
    //console.log('gdb-step-out ');
    gdb.stepOut([], onGdbStepOutDone);
    function onGdbStepOutDone(data) {
      //console.log("GDB stepped out "+JSON.stringify(data));
    }
  }
  
  //function onGdbSetSelectedFrame() {
    //console.log('gdb-set-selected-frame ');
  //}

  function onGdbVarsStackExpr(exprs) {
    if (exprs.length == 0) {
      listVariables();
      callStack();
      return;
    }
    exprs.forEach(handleExpr);
    
    var cnt = 0;
    function handleExpr(expr) {
      gdb.evalExpression(expr.text, onGdbEvalExpressionDone);
      function onGdbEvalExpressionDone(data) {
        socket.emit('gdb-expr-evaled', expr.id, {
          result: data.class,
          data: data.result
        });
        
        if (++cnt == exprs.length) {
          listVariables();
          callStack();
        }
      }
    }
  }
  
  //function onGdbEvalExpression(exprId, expression) {
    //console.log('gdb-eval-expression ');
    //gdb.evalExpression(expression, onGdbEvalExpressionDone);

    //function onGdbEvalExpressionDone(data) {
      //console.log(JSON.stringify(data));
      //socket.emit('gdb-expr-evaled', exprId, {
        //result: data.class,
        //data: data.result
      //});
    //}
  //}
    
  function onGdbInsertBreak(filePath, line) {
    //console.log('gdb-insert-break ');
    gdb.insertBreakpoint([filePath + ':' + line], onGdbInsertBreakDone);
    function onGdbInsertBreakDone(data) {
      //socket.emit('gdb-break-inserted', data);
    }
  }
  
  function onGdbDeleteBreak(filePath, line) {
    //console.log('gdb-delete-break ');
    gdb.deleteBreakpoints([filePath + ':' + line], onGdbDeleteBreakDone);
    function onGdbDeleteBreakDone(data) {
      //socket.emit('gdb-break-inserted', data);
    }
  }
  
  function onGdbEnableBreak() {
    //console.log('gdb-enable-break ');
  }

  function onGdbDisableBreak() {
    //console.log('gdb-disable-break ');
  }

  function onGdbAppIn(data) {
    //console.log('gdb-app-in '+data);
    gdb.appStdinWrite(data);
  }


  //----------------------------------------------------------------------------
  // 
  // gdb event handling
  // 
  //----------------------------------------------------------------------------

  function onAppOut(data) {
    //console.log('app-out '+data.toString());
    socket.emit('gdb-app-out', data.toString());
  }

  function onAppErr(data) {
    //console.log('app-err '+data);
    //socket.emit('gdb-app-err', data.toString());
  }

  function onGdbOut(data) {
    //console.log('gdb-out '+data);
    //socket.emit('gdb-out', data.toString());
  }

  function onGdbErr(data) {
    //console.log('gdb-err '+data);
    //socket.emit('gdb-err', data.toString());
  }

  function onGdbKilled() {
    //socket.emit('gdb-killed');
  }

  function onGdbExecStateChange(data) {
    //console.log('gdb-exec-state-change '+data.class);
    socket.emit('gdb-exec-state-change', data.class);
    if (data.class=='stopped') onStopped(data);
  }

  function onStopped(data) {
    var stoppedWhere = getFilePathAndLine(data);
    if (stoppedWhere.filePath && stoppedWhere.line) {
      // step out of anything that is not in the main.cc file
      if (stoppedWhere.filePath != filePath) {
        gdb.stepOut([], onGdbStepOutDone);
        function onGdbStepOutDone(data) {
          //console.log("GDB stepped out "+JSON.stringify(data));
        }
      } else {
        socket.emit('gdb-stopped-at', stoppedWhere.filePath, stoppedWhere.line);
      }
    }
  }

  function onGdbDebugStateChange(data) {
    //console.log('gdb-debug-state-change '+data);
    socket.emit('gdb-debug-state-change', data);
    // reset if gdb finished
    if (data == 'idle') {
      removeGdbListeners();
      gdb.reset();
    }
  }


  //----------------------------------------------------------------------------
  // 
  // helper functions
  // 
  //----------------------------------------------------------------------------

  
  //----------------------------------------------------------------------------
  // list variables
  //----------------------------------------------------------------------------

  function listVariables() {
    gdb.listVariables(['--skip-unavailable', '--simple-values'], onSimpleValues);

    function onSimpleValues(data) {
      if (!(data.result && data.result.variables)) return;
      
      data.result.variables.forEach(processSimpleVariable);
      gdb.listVariables(['--skip-unavailable', '--all-values'], onAllValues);
    }

    function onAllValues(data) {
      if (!(data.result && data.result.variables)) return;
      
      data.result.variables.forEach(processAllVariable);
      sendVariables();
    }

    var variablesData = {};

    function processSimpleVariable(variable) {
      variablesData[variable.name] = { type: variable.type };
    }

    function processAllVariable(variable) {
      variablesData[variable.name].value = variable.value;
    }

    function sendVariables() {
      var variables = [];
      for (var variable in variablesData) {
        variables.push({
          name: variable,
          type: variablesData[variable].type,
          value: variablesData[variable].value
        });
      }
      socket.emit('gdb-list-variables', variables);
    }
  }

  //----------------------------------------------------------------------------
  // call stack
  //----------------------------------------------------------------------------

  function callStack() {
    gdb.callStack([], onCallStackDone);

    var framesStack = [];

    function onCallStackDone(data) {
      if (!(data.result && data.result.stack)) return;
      
      var numFrames = data.result.stack.length;
      data.result.stack.forEach(handleFrame);
      function handleFrame(frame) {
        framesStack.push({
          level: numFrames - frame.level - 1,
          function: frame.func,
          args: {}
        });
      }
      gdb.stackArgs(['--skip-unavailable', '--simple-values'], onSimpleValues);
    }

    function onSimpleValues(data) {
      if (!(data.result && data.result['stack-args'])) return;
      
      data.result['stack-args'].forEach(processSimpleFrame);
      gdb.stackArgs(['--skip-unavailable', '--all-values'], onAllValues);
    }

    function onAllValues(data) {
      if (!(data.result && data.result['stack-args'])) return;
      
      data.result['stack-args'].forEach(processAllFrame);
      sendFrames();
    }

    function processSimpleFrame(frame) {
      if (!frame.args) return;
      frame.args.forEach(processSimpleFrameArg);
      
      function processSimpleFrameArg(frameArg) {
        if (!(framesStack[frame.level])) return;
        
        framesStack[frame.level].args[frameArg.name] = { type: frameArg.type };
      }
    }

    function processAllFrame(frame) {
      if (!frame.args) return;
      
      frame.args.forEach(processAllFrameArg);
      function processAllFrameArg(frameArg) {
        if (!(framesStack[frame.level].args[frameArg.name])) return;
        
        framesStack[frame.level].args[frameArg.name].value = frameArg.value;
      }
    }

    function sendFrames() {
      framesStack.reverse();
      socket.emit('gdb-frame-stack', framesStack);
    }
  }

  // handle breakpoint hit
  // *stopped,reason="breakpoint-hit",disp="keep",bkptno="1",
  // frame={ addr="0x000000000040093e",func="main",args=[],
  //         file="workspace/main.cc",fullname="/root/workspace/main.cc",line="6" },
  // thread-id="1",stopped-threads=["1"],core="3"
  
  // handle step over
  // *stopped,reason="end-stepping-range",line="8",file="hello.c"
  
  // handle step into
  // *stopped,reason="end-stepping-range", 
  // frame={ func="foo",args=[{name="a",value="10"}, {name="b",value="0"}],
  //         file="recursive2.c", fullname="/home/foo/bar/recursive2.c",line="11" }
  
  // handle step out
  // *stopped,reason="function-finished",
  // frame={ func="main",args=[],
  //         file="hello.c",fullname="/home/foo/bar/hello.c",line="7" }
  function getFilePathAndLine(data) {
    var filePath = undefined,
        line = undefined,
        reason = data.result.reason;
    if (reason == 'breakpoint-hit') {
      // hit a breakpoint
      filePath = data.result.frame.file;
      line = data.result.frame.line;
    } else if (reason == 'end-stepping-range') {
      if (data.result.frame) {
        // step into
        filePath = data.result.frame.file;
        line = data.result.frame.line;
      } else {
        // step over
        filePath = data.result.file;
        line = data.result.line;
      }
    } else if (reason == 'function-finished') {
      // step out
      filePath = data.result.frame.file;
      line = data.result.frame.line;
    }
    return {
      filePath: filePath,
      line: line
    }
  }
  
}

module.exports = cppPlugin;
