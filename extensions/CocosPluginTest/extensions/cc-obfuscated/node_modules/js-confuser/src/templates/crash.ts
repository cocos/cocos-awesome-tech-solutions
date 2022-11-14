import Template from "./template";

export const CrashTemplate1 = Template(`
try {
    if(typeof process !== "undefined") {
        Math.random() > 0.5 && process && process.exit();
    }
} catch ( e ) {
    
}

var {var} = "a";
while(1){
    {var} = {var} += "a";    //add as much as the browser can handle
}
`);

export const CrashTemplate2 = Template(`
while(true) {
    for(var {var} = 99; {var} == {var}; {var} *= {var}) {
        !{var} && console.log({var});
        if ({var} <= 10){
            break;
        }
    };
 };`);

export const CrashTemplate3 = Template(`
try {
    function {$2}(y, x){
        return x;
      }
      
      var {$1} = {$2}(this, function () {
        var {$3} = function () {
            var regExp = {$3}
                .constructor('return /" + this + "/')()
                .constructor('^([^ ]+( +[^ ]+)+)+[^ ]}');
            
            return !regExp.call({$1});
        };
        
        return {$3}();
      });
      
      {$1}();
} catch ( e ) {
    while(e ? e : !e){
        var b;
        var c = 0;
        (e ? !e : e) ? (function(e){
            c = e ? 0 : !e ? 1 : 0;
        })(e) : b = 1;

        if(b&&c){break;}
        if(b){continue;}
    }
}
`);
