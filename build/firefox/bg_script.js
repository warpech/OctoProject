(function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={i:d,l:!1,exports:{}};return a[d].call(e.exports,e,e.exports,b),e.l=!0,e.exports}var c={};return b.m=a,b.c=c,b.d=function(a,c,d){b.o(a,c)||Object.defineProperty(a,c,{configurable:!1,enumerable:!0,get:d})},b.n=function(a){var c=a&&a.__esModule?function(){return a['default']}:function(){return a};return b.d(c,'a',c),c},b.o=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)},b.p='',b(b.s=0)})([function(){if('undefined'!=typeof chrome&&'undefined'==typeof a)var a=chrome;a.tabs.onUpdated.addListener(function(b){a.storage.sync.get({openMode:'userSelect'},function(c){c&&'userSelect'!==c.openMode||a.pageAction.setPopup({tabId:b,popup:'popup/index.html'})}),a.tabs.sendMessage(b,{content:'Hey! Are you a Starcounter app?'},{},function(c){'Yup!'===c&&a.pageAction.show(b)})});const b=function(b,c){a.tabs.sendMessage(b.id,{content:'showDebugAid',type:c},function(){})};a.pageAction.onClicked.addListener(function(c){a.storage.sync.get({openMode:'userSelect'},function(a){a&&'userSelect'!==a.openMode&&b(c,a.openMode)})})}]);