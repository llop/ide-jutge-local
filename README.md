# ide-jutge-local

**ide.jutge** is a Web IDE that supports the C++ language

![alt tag](/readme/ide-img2b.png)

## Features

- C++ code editor
- Terminal (for program IO)
- Detect compilation and memory-related problems
- Execute and debug C++ programs
- *Slow-motion* debug mode (execute one line at a time)
- Breakpoints
- Call stack display
- View and edit variables
- Evaluate C++ expressions
- Several GUI and editor themes
- Other awesome features yet to be implemented

## Getting started
You will need the following software to run **ide.jutge**:
- [Node.js](https://nodejs.org/)
- [Bower](https://bower.io/)
- [GCC](https://gcc.gnu.org/) and [GDB](https://www.gnu.org/s/gdb/) [*](#caveats)
- [Valgrind](http://valgrind.org/)

### Installation
Once you have everything else, start by cloning this repo
```
git clone https://github.com/llop/ide-jutge-local.git
```
Go into the `ide-jutge-local` folder, and run:
```
npm install
bower install
```
**ide.jutge** is now installed! :+1:

### Run it!
You can use the `npm start &` command to get **ide.jutge** up and running

Then, open `http://localhost:3000` in your browser to start coding! :smiley:
  
The app can be halted with `npm stop`

### Caveats
- G++ should support the *C++14* standard
```
add-apt-repository -y ppa:ubuntu-toolchain-r/test
apt-get -y update
apt-get -y install gcc-6 g++-6
```
- GDB should be compiled with python support
```
wget https://ftp.gnu.org/gnu/gdb/gdb-7.12.tar.gz
tar -xvzf gdb-7.12.tar.gz
cd gdb-7.12
./configure --with-python=yes
make
make install
```
- GDB should run in *asynchronous* mode. Add this to the *.gdbinit* file:
```
python
import sys
sys.path.append('/usr/share/gcc-6/python')
from libstdcxx.v6.printers import register_libstdcxx_printers
register_libstdcxx_printers (None)
end
set pagination off
set non-stop on
set target-async on
set print pretty on
```
## Author

**Albert Lobo Cusidó** - [llop](https://github.com/llop)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments
* [Jutge.org](https://jutge.org/)
* [Jordi Petit](https://github.com/jordi-petit)

