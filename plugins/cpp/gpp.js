function gpp(programName, sourceFiles, execAdapter, callback) {
  // run g++: g++-6 -g -o programName sourceFiles -lncurses
  var sourcesStr = sourceFiles.join(' ');
  var args = ['-g', '-std=c++14', '-o', programName, sourcesStr/*, '-lncurses'*/];
  execAdapter.exec('g++', args, callback);
}

module.exports = gpp;
