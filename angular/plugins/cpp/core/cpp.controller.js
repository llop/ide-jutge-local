(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .controller('CppController', cppController);

  cppController.$inject = ['$scope', '$interval', 'workbench'];

  function cppController($scope, $interval, workbench) {
    
    //-------------------------------------------------------------------------
    // setup
    //-------------------------------------------------------------------------
    var me = this;

    me.socket = workbench.socket;
    me.terminal = workbench.ui.terminal;

    me.state = {
      mode: 'none',
      run: 'idle',
      valgrind: 'idle',
      debug: 'idle',
      exec: 'stopped'
    };

    me.pauseDebug = pauseDebug;
    me.continueDebug = continueDebug;
    me.stepOver = stepOver;
    me.stepInto = stepInto;
    me.stepOut = stepOut;
    
    me.kill = kill;
    
    me.startDebug = startDebug;
    me.startExe = startExe;
    me.startValgrind = startValgrind;

    me.sloMo = undefined;
    me.sloMoInterval = 4000;
    me.slowMotionStart = slowMotionStart;
    me.slowMotionStop = slowMotionStop;
    me.setSloMoInterval = setSloMoInterval;

    me.sourceFilePath = 'workspace/main.cc';
    me.programName = 'workspace/a.out';
    me.execConfig = {
      name: 'main.cc',
      sourceFiles: [ me.sourceFilePath ],
      programName: me.programName, 
      programArgs: [],
      slomo: false
    };

    me.breakpoints = [];

    me.frames = [];
    me.variables = [];
    me.valgrind = [];

    me.getExpressions = undefined;
    me.evalExpressions = evalExpressions;

    me.onLoad = onLoad;
    me.postLink = postLink;
    
    me.activate = activate;
    me.deactivate = deactivate;
    
    
    
    function onLoad() {
      // init data structures
      
    }
    
    function postLink() {
      // do whatever
    }

    function activate() {
      //me.terminal.on('data', onTerminalData);
      //me.socket.on('gdb-app-out', onAppOut);
      
      // show components
      //$('#jtg-cpp-panel').show();
      //$('#jtg-cpp-menu-bar').show();
      // malo!
      // enviar un evento y que lo pille una directive
    }

    function deactivate() {
      //me.terminal.off('data', onTerminalData);
      //me.socket.removeListener('gdb-app-out', onAppOut);

      // hide components
      //$('#jtg-cpp-panel').hide();
      //$('#jtg-cpp-menu-bar').hide();
    }
    

    me.deregBreakpointInsert = undefined;
    me.deregBreakpointDelete = undefined;

    me.exprId = 0;
    me.expressions = {};
    
    
    init();


    //-------------------------------------------------------------------------
    // initialization
    //-------------------------------------------------------------------------
    
    function init() {
      me.socket.on('gpp-compile-ok', onCompileOk);
      me.socket.on('gpp-compile-error', onCompileError);
      me.socket.on('gdb-debug-start', onDebugStart);
      me.socket.on('gdb-exec-state-change', onExecStateChange);
      me.socket.on('gdb-debug-state-change', onDebugStateChange);
      me.socket.on('gdb-list-variables', onListVariables);
      me.socket.on('gdb-frame-stack', onFrameStack);
      me.socket.on('gdb-stopped-at', onStoppedAt);
      me.socket.on('gdb-app-out', onAppOut);
      me.socket.on('gdb-expr-evaled', onExpressionEvaled);
      
      me.socket.on('valgrind-start', onValgrindStart);
      me.socket.on('valgrind-out', onValgrindOut);
      me.socket.on('valgrind-err', onValgrindErr);
      me.socket.on('valgrind-killed', onValgrindKilled);
      me.socket.on('valgrind-result', onValgrindResult);
      
      me.socket.on('exe-start', onRunStart);
      me.socket.on('exe-out', onRunOut);
      me.socket.on('exe-err', onRunErr);
      me.socket.on('exe-killed', onRunKilled);
      
      me.terminal.on('data', onTerminalData);
    }
    
    
    function kill() {
      if (me.state.debug == 'active') me.socket.emit('gdb-stop');
      else if (me.state.run == 'active') me.socket.emit('exe-stop');
      else if (me.state.valgrind == 'active') me.socket.emit('valgrind-stop');
      
      clearGrids();
    }
    
    //--------------------------------------------------------------------------
    // valgrind
    //--------------------------------------------------------------------------
    function onValgrindStart(programName) {
      me.state.valgrind = 'active';
      workbench.ui.status.jtg.notifySuccess('Compilation successful!', 'Starting valgrind');
      
      workbench.ui.tabs.tabs('select', 'Terminal');
      workbench.ui.terminal.focus();
    }
    
    function onValgrindOut(data) {
      me.terminal.write(data);
    }
    
    function onValgrindErr(data) {
      me.terminal.write(data);
    }
    
    function onValgrindKilled() {
      me.state.mode = 'none';
      me.state.valgrind = 'idle';
    }
    
    function onValgrindResult(data) {
      workbench.ui.status.jtg.notifySuccess('Valgrind finished!', 'Check results in the Valgrind tab');
      setValgrind(data);
      
      // select valgrind tab
      $('#jtg-cpp-panel').tabs('select', 'Valgrind');
      workbench.ui.editor.focus();
    }
    
    
    //--------------------------------------------------------------------------
    // run
    //--------------------------------------------------------------------------
    function onRunStart(programName) {
      me.state.run = 'active';
      workbench.ui.status.jtg.notifySuccess('Compilation successful!', 'Starting run');
      
      workbench.ui.tabs.tabs('select', 'Terminal');
      workbench.ui.terminal.focus();
    }
    
    function onRunOut(data) {
      me.terminal.write(data);
    }
    
    function onRunErr(data) {
      me.terminal.write(data);
    }
    
    function onRunKilled() {
      me.state.mode = 'none';
      me.state.run = 'idle';
      
      workbench.ui.editor.focus();
      workbench.ui.status.jtg.notifySuccess('Execution finished!', '');
    }
    
    

    //--------------------------------------------------------------------------
    // GDB
    //--------------------------------------------------------------------------
    function onStoppedAt(filePath, line) {
      if (slomoStart) {
        slomoStart = false;
        slowMotionStart();
      }
      
      workbench.ui.status.jtg.notifyInfo('Breakpoint hit!', 'Line ' + line);
      
      workbench.ui.editor.jtg.setActiveLine(line, "jtg-editor-highlight-breakpoint");
      $scope.$broadcast('gdb-stopped');
      evalExpressions([]);
    }

    function onListVariables(data) {
      setVariables(data);
    }

    function onFrameStack(data) {
      setFrames(data);
    }

    function onCompileOk(programName) {
      // flash result
      workbench.ui.status.jtg.notifySuccess('Compilation successful!', 'Starting debug');
      workbench.ui.tabs.tabs('select', 'Terminal');
    }
    

    function onCompileError(programName, errors) {
      // reset state
      me.state.mode = 'none';
      me.state.exec = 'stopped';
      me.state.debug = 'idle';
      me.state.run = 'idle';
      me.state.valgrind = 'idle';

      // notify compile failure
      workbench.ui.status.jtg.notifyError('Compilation error!', 'Check the errors in the problems tab');

      // filter errors array
      var errorsTmp = [];
      for (var i = 0; i < errors.length; ++i) {
        if (errors[i].filename == me.sourceFilePath) {
          errors[i].column -= 1;
          errorsTmp.push(errors[i]);
        }
      }

      // send errors to workspace
      workbench.ui.problems.jtg.setProblems(errorsTmp);
      workbench.ui.tabs.tabs('select', 'Diagnostics');
    }
    
    var slomoStart = false;

    function onDebugStart(programName) {
      workbench.ui.tabs.tabs('select', 'Terminal');
      workbench.ui.terminal.focus();
      
      me.state.debug = 'active';

      // add breakpoint listeners
      me.deregBreakpointInsert = $scope.$on('jtg-breakpoint-insert', onBreakpointInsert);
      me.deregBreakpointDelete = $scope.$on('jtg-breakpoint-delete', onBreakpointDelete);
    }

    function onExecStateChange(data) {
      me.state.exec = data.toString();
    }

    function onDebugStateChange(data) {
      me.state.debug = data.toString();
      if (me.state.debug == 'idle') onDebuggerIdle();
      workbench.ui.editor.jtg.setActiveLine(undefined);
    }

    function onDebuggerIdle() {
      // remove breakpoint listeners
      me.deregBreakpointInsert();
      me.deregBreakpointDelete();
      me.deregBreakpointInsert = undefined;
      me.deregBreakpointDelete = undefined;

      // cancel slo mo
      slowMotionStop();
      clearGrids();
      
      me.state.mode = 'none';
      workbench.ui.status.jtg.notifySuccess('Debug finished!', '');
    }

    function onBreakpointInsert(event, line) {
      me.socket.emit('gdb-insert-break', me.sourceFilePath, line + 1);
    }

    function onBreakpointDelete(event, line) {
      me.socket.emit('gdb-delete-break', me.sourceFilePath, line + 1);
    }
    

    //-------------------------------------------------------------------------
    // function definintions
    //-------------------------------------------------------------------------

    function onTerminalData(data) {
      if (me.state.debug == 'active') me.socket.emit('gdb-app-in', data);
      else if (me.state.valgrind == 'active') me.socket.emit('valgrind-in', data);
      else if (me.state.run == 'active') me.socket.emit('exe-in', data);
    }

    function onAppOut(data) {
      me.terminal.write(data);
    }
    
    // 'run program' flow
    // 
    //  client
    //  ------
    // 
    //  save-file --------------> file save
    // 
    function startExe() {
      me.state.mode = 'exe';
      me.state.run = 'compiling';
      
      setValgrind([]);
      workbench.ui.problems.jtg.setProblems([]);
      workbench.saveFile(me.sourceFilePath, onFileSaved);
      
      function onFileSaved() {
        workbench.ui.status.jtg.notifySuccess('File uploaded!', 'Compiling...');
        me.socket.emit('exe-run', me.execConfig);
      }
    }
    
    
    function startValgrind() {
      me.state.mode = 'valgrind';
      me.state.valgrind = 'compiling';
      
      setValgrind([]);
      workbench.ui.problems.jtg.setProblems([]);
      workbench.saveFile(me.sourceFilePath, onFileSaved);
      
      function onFileSaved() {
        workbench.ui.status.jtg.notifySuccess('File uploaded!', 'Compiling...');
        me.socket.emit('valgrind-run', me.execConfig);
      }
    }

    function startDebug(slomo) {
      me.state.mode = slomo ? 'slomo' : 'debug';
      me.state.debug = 'compiling';

      // clear errors
      setValgrind([]);
      workbench.ui.problems.jtg.setProblems([]);
      workbench.saveFile(me.sourceFilePath, onFileSaved);

      // save file then compile it
      function onFileSaved() {

        // notify files have been saved
        workbench.ui.status.jtg.notifyInfo('File uploaded!', 'Compiling...');

        // make breakpoints list
        me.breakpoints = [];
        workbench.ui.editor.jtg.getBreakpoints().forEach(processBreakpoint);
        function processBreakpoint(line) {
          me.breakpoints.push({
            filename: me.sourceFilePath,
            line: line + 1
          });
        }

        // send compile + debug signal
        slomoStart = slomo;
        me.execConfig.slomo = slomo;
        me.socket.emit('gdb-run', me.execConfig, me.breakpoints);
      }
    }

    function pauseDebug() {
      if (me.state.mode == 'slomo') me.slowMotionStop();
      else if (me.state.mode == 'debug') me.socket.emit('gdb-pause');
    }

    function continueDebug() {
      clearGrids();
      if (me.state.mode == 'slomo') me.slowMotionStart();
      else if (me.state.mode == 'debug') me.socket.emit('gdb-continue');
    }

    function stepOver() {
      me.state.exec = 'running';
      me.socket.emit('gdb-step-over');
    }

    function stepInto() {
      me.state.exec = 'running';
      me.socket.emit('gdb-step-into');
    }

    function stepOut() {
      me.state.exec = 'running';
      me.socket.emit('gdb-step-out');
    }

    function evalExpressions(exprs) {
      exprs = exprs.concat(me.getExpressions());

      var exprsData = [];
      exprs.forEach(processExpr);
      me.socket.emit('gdb-vars-stack-exprs', exprsData);

      function processExpr(expr) {
        var id = me.exprId;
        me.expressions[me.exprId] = expr.callback;
        ++me.exprId;
        exprsData.push({
          id: id,
          text: expr.text
        });
      }
    }

    function onExpressionEvaled(id, data) {
      var callback = me.expressions[id];
      if (callback != undefined) {
        callback(data);
        delete me.expressions[id];
      }
    }

    function clearGrids() {
      // clear grids
      setVariables([]);
      setFrames([]);
      setValgrind([]);

      $scope.$broadcast('jtg-cpp-clear-expressions');
    }
    
    
    //----------------------------------------------------------------------
    // setting these variables fires events:
    //   - variables
    //   - frames
    //   - valgrind results
    //----------------------------------------------------------------------
    
    function setVariables(variablesData) {
      me.variables = variablesData;
      $scope.$broadcast('jtg-cpp-variables-change', me.variables);
    }
    
    function setFrames(framesData) {
      me.frames = framesData;
      $scope.$broadcast('jtg-cpp-frames-change', me.frames);
    }
    
    function setValgrind(valgrindData) {
      me.valgrind = valgrindData;
      $scope.$broadcast('jtg-cpp-valgrind-change', me.valgrind);
    }
    
    
    /*
      slow motion
      
      button    mode      hidden                      disabled
      
      play      debug     cpp.state.exec!='stopped'   cpp.state.debug!='active'
                
                slomo     me.sloMo!=undefined
      
      pause     debug     cpp.state.exec!='running'   cpp.state.debug!='active'
                
                slomo     me.sloMo==undefined
    */
    function setSloMoInterval(value) {
      me.sloMoInterval = value;
      if (me.sloMo != undefined) {
        slowMotionStop();
        slowMotionStart();
      }
    }

    function slowMotionStart() {
      if (me.sloMo == undefined) {
        if (me.state.exec == 'running') me.socket.emit('gdb-pause');
        me.sloMo = $interval(sloMoIntervalFunction, me.sloMoInterval);
      }
    }
    
    function slowMotionStop() {
      if (me.sloMo != undefined) {
        $interval.cancel(me.sloMo);
        me.sloMo = undefined;
      }
    }

    function sloMoIntervalFunction() {
      if (me.state.exec == 'running') slowMotionStop();
      else me.stepInto();
    }

  }

})();
