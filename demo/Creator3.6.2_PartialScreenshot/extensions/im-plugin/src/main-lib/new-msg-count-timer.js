const _0x1d52=['__esModule','updateToolbar','getInstance','cleanUp','updateNewMsgCount','setUp','./service','instance','__importDefault','default','timer','defineProperty','../common-lib/update-toolbar'];(function(_0xed357c,_0x192dd8){const _0x1d526e=function(_0x170c62){while(--_0x170c62){_0xed357c['push'](_0xed357c['shift']());}};_0x1d526e(++_0x192dd8);}(_0x1d52,0xf3));const _0x170c=function(_0xed357c,_0x192dd8){_0xed357c=_0xed357c-0x18b;let _0x1d526e=_0x1d52[_0xed357c];return _0x1d526e;};const _0xaf0de0=_0x170c;'use strict';var __importDefault=this&&this[_0xaf0de0(0x197)]||function(_0x1c5ccc){return _0x1c5ccc&&_0x1c5ccc['__esModule']?_0x1c5ccc:{'default':_0x1c5ccc};};Object[_0xaf0de0(0x18d)](exports,_0xaf0de0(0x18f),{'value':!0x0});const service_1=__importDefault(require(_0xaf0de0(0x195))),update_toolbar_1=require(_0xaf0de0(0x18e));class NewMsgCountTimer{constructor(){const _0x29e891=_0xaf0de0;this[_0x29e891(0x18c)]=null,this['updateNewMsgCount']=this[_0x29e891(0x193)]['bind'](this);}static[_0xaf0de0(0x191)](){const _0x53f2f4=_0xaf0de0;return NewMsgCountTimer['instance']||(NewMsgCountTimer['instance']=new NewMsgCountTimer()),NewMsgCountTimer[_0x53f2f4(0x196)];}[_0xaf0de0(0x194)](){const _0x325559=_0xaf0de0;this['timer']||(this[_0x325559(0x193)](),this[_0x325559(0x18c)]=setInterval(this[_0x325559(0x193)],0x493e0));}[_0xaf0de0(0x192)](){const _0x486297=_0xaf0de0;this[_0x486297(0x18c)]&&(clearInterval(this[_0x486297(0x18c)]),this[_0x486297(0x18c)]=null);}async[_0xaf0de0(0x193)](){const _0x3d7ad7=_0xaf0de0,_0x4c3ce8=await service_1['default'][_0x3d7ad7(0x191)]();update_toolbar_1[_0x3d7ad7(0x190)]({'newMsgCount':await _0x4c3ce8['getNewMsgCount']()});}}exports[_0xaf0de0(0x18b)]=NewMsgCountTimer,NewMsgCountTimer[_0xaf0de0(0x196)]=null;