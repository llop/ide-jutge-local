(function() {
  'use strict';

  angular
    .module('ide.jutge.plugins.cpp')
    .directive('jtgCppCodeTemplates', cppCodeTemplates);

  cppCodeTemplates.$inject = ['workbench'];

  function cppCodeTemplates(workbench) {

    //--------------------------------------------------------------------------
    // c++ template programs
    //--------------------------------------------------------------------------
    var sourceTemplatesOptions = [
        { name: 'Hello world!', source:'#include <iostream>\n\
using namespace std;\n\
\n\
int main() {\n\
  string s="Hello world!";\n\
  cout<<s<<endl;\n\
  return 0;\n\
}' },
        { name: 'Fill in a vector', source:'#include <iostream>\n\
#include <vector>\n\
using namespace std;\n\
\n\
// fill in a vector!\n\
int main() {\n\
  cout<<"How many numbers do you want to have in your vector?"<<endl;\n\
  int n;\n\
  cin>>n;\n\
  vector<int> v(n);\n\
  cout<<"Alright, write them!"<<endl;\n\
  for (int i=0; i<n; ++i) {\n\
    cin>>v[i];\n\
  }\n\
  cout<<"Your vector contains "<<n<<" numbers, and they are:"<<endl;\n\
  for (int i=0; i<n; ++i) {\n\
    if (i) cout<<", ";\n\
    cout<<v[i];\n\
  }\n\
  cout<<endl;\n\
  return 0;\n\
}' },
        { name: 'Iterative GCD', source:'#include <iostream>\n\
using namespace std;\n\
\n\
// Calculate the greatest common divisor iteratively!\n\
long long gcd(long long a, long long b) {\n\
  long long c;\n\
  while (b) {\n\
    c = b;\n\
    b = a % b;\n\
    a = c;\n\
  }\n\
  return a;\n\
}\n\
\n\
int main() {\n\
  cout<<"Calculate the greatest common divisor iteratively!"<<endl;\n\
  cout<<"Enter the two numbers whose GCD you want to know:"<<endl;\n\
  long long a, b;\n\
  cin>>a;\n\
  cin>>b;\n\
  long long x=gcd(a, b);\n\
  cout<<"The GCD of "<<a<<" and "<<b<<" is "<<x<<endl;\n\
  return 0;\n\
}' },
        { name: 'Correct parenthesization?', source:'#include <iostream>\n\
#include <stack>\n\
using namespace std;\n\
\n\
// Check whether a parenthesized expression is correct or otherwise!\n\
int main() {\n\
  cout<<"I\'ll tell you if an expression is correctly parenthesized"<<endl;\n\
  cout<<"Write it!"<<endl;\n\
  string s;\n\
  cin>>s;\n\
  stack<int> p;\n\
  bool b=true;\n\
  for (int i=0; b and i<s.size(); ++i) {\n\
    if (s[i]==\'(\') {\n\
      p.push(0);\n\
    } else if (s[i]==\')\') {\n\
      if (not p.empty() and p.top()==0) {\n\
        p.pop();\n\
      } else {\n\
        b=false;\n\
      }\n\
    }\n\
  }\n\
  if (b and p.empty()) cout<<"That\'s good!"<<endl;\n\
  else cout<<"Nurh urh!"<<endl;\n\
  return 0;\n\
}' },
        { name: 'Fibonacci in a vector', source:'#include <iostream>\n\
#include <vector>\n\
using namespace std;\n\
\n\
// Create a vector with the first n terms of the Fibonacci sequence!\n\
long long fibonacci(unsigned int n) {\n\
  if (n==0) return 0;\n\
  if (n==1) return 1;\n\
  long long a=0;\n\
  long long b=1;\n\
  for (int i=1; i<n; ++i) {\n\
    long long c=b;\n\
    b+=a;\n\
    a=c;\n\
  }\n\
  return b;\n\
}\n\
\n\
int main() {\n\
  cout<<"Calculate the n-th term of the Fibonacci sequence!"<<endl;\n\
  cout<<"Enter the number of terms you want:"<<endl;\n\
  unsigned int n;\n\
  cin>>n;\n\
  vector<long long> v(n+1);\n\
  v[0]=0;\n\
  if (n>=1) {\n\
    v[1]=1;\n\
  }\n\
  for (int i=2; i<=n; ++i) {\n\
    v[i]=v[i-1]+v[i-2];\n\
  }\n\
  cout<<"The first "<<n<<" terms of the Fibonacci sequence are:"<<endl;\n\
  for (int i=1; i<=n; ++i) {\n\
    if (i>1) cout<<", ";\n\
    cout<<v[i];\n\
  }\n\
  cout<<endl;\n\
  return 0;\n\
}' },
        { name: 'Recursive factorial', source:'#include <iostream>\n\
using namespace std;\n\
\n\
// calculate the factorial of a number\n\
long long factorial(unsigned int x) {\n\
  if (x<=1) return 1;\n\
  long long f=x*factorial(x-1);\n\
  return f;\n\
}\n\
\n\
int main() {\n\
  cout<<"Calculate the factorial of an integer!"<<endl;\n\
  cout<<"Write the number:"<<endl;\n\
  unsigned int x;\n\
  cin>>x;\n\
  long long f=factorial(x);\n\
  cout<<"The factorial of "<<x<<" is "<<f<<endl;\n\
  return 0;\n\
}' }];

    function link(scope, element, attrs) {
      // add templates to menu
      
      var text = 'C++ templates';
      var fileMenu = workbench.ui.menu.file;
      fileMenu.menu('appendItem', { separator: true });
      fileMenu.menu('appendItem', { 
        iconCls: 'icon-cpp-templates', 
        text: text
      });
      
      var cppTemplatesMenu = fileMenu.menu('findItem', text).target;
      for (var i = 0; i < sourceTemplatesOptions.length; ++i) {
        var template = sourceTemplatesOptions[i];
        appendCppTemplateOption(template.name, template.source);
      }
      
      // fill in with helloworld
      var currentCode = workbench.ui.editor.getValue();
      if (currentCode == '')
        workbench.ui.editor.setValue(sourceTemplatesOptions[0].source, -1);
      
      function appendCppTemplateOption(name, source) {
        fileMenu.menu('appendItem', { 
          parent: cppTemplatesMenu,
          text: name,
          onclick: onCppTemplateClick
        });
        
        function onCppTemplateClick() {
          workbench.ui.editor.setValue(source, -1);
          workbench.ui.editor.focus();
        }
      }
    }

    return {
      restrict: 'A',
      link: link
    };
  }


})();
