(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{111:function(e,t,n){"use strict";function r(e){var t,n,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=r(e[t]))&&(a&&(a+=" "),a+=n);else for(t in e)e[t]&&(a&&(a+=" "),a+=t);return a}t.a=function(){for(var e,t,n=0,a="";n<arguments.length;)(e=arguments[n++])&&(t=r(e))&&(a&&(a+=" "),a+=t);return a}},112:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return b}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function u(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=a.a.createContext({}),s=function(e){var t=a.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=s(e.components);return a.a.createElement(l.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},m=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,c=e.parentName,l=u(e,["components","mdxType","originalType","parentName"]),p=s(n),m=r,b=p["".concat(c,".").concat(m)]||p[m]||f[m]||o;return n?a.a.createElement(b,i(i({ref:t},l),{},{components:n})):a.a.createElement(b,i({ref:t},l))}));function b(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,c=new Array(o);c[0]=m;var i={};for(var u in t)hasOwnProperty.call(t,u)&&(i[u]=t[u]);i.originalType=e,i.mdxType="string"==typeof e?e:r,c[1]=i;for(var l=2;l<o;l++)c[l]=n[l];return a.a.createElement.apply(null,c)}return a.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},113:function(e,t,n){"use strict";var r=n(111),a=n(0),o=n.n(a),c=n(55),i=n.n(c);t.a=function(e){var t=e.roles,n=Object(a.useMemo)((function(){return t.filter((function(e){return!!e})).map((function(e){return e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()})).sort()}),[t]);return o.a.createElement("div",{className:i.a.roleContainer},o.a.createElement("span",{className:i.a.roleLabel},"Roles:"),n.map((function(e){return o.a.createElement("span",{key:e,className:Object(r.a)("badge badge--primary",i.a.role)},e)})))}},114:function(e,t,n){"use strict";var r=n(111),a=n(0),o=n.n(a),c=n(56),i=n.n(c);t.a=function(e){var t=e.icon,n=e.small;return o.a.createElement("span",{className:Object(r.a)(i.a.wrapper,n&&i.a["wrapper-small"])},o.a.createElement(t,null))}},83:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return u})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return p}));var r=n(3),a=n(7),o=(n(0),n(112)),c=n(113),i=(n(114),{id:"ID",title:"TITLE",sidebar_label:"SIDEBAR"}),u={unversionedId:"handbook/ID",id:"handbook/ID",isDocsHomePage:!1,title:"TITLE",description:"SECTION_TITLE",source:"@site/docs/handbook/_template.md",slug:"/handbook/ID",permalink:"/Tutor-Management-System/docs/handbook/ID",editUrl:"https://github.com/Dudrie/Tutor-Management-System/edit/main/docs/docs/handbook/_template.md",version:"current",sidebar_label:"SIDEBAR"},l=[{value:"SECTION_TITLE",id:"section_title",children:[]}],s={toc:l};function p(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)(c.a,{roles:["admin"],mdxType:"Roles"}),Object(o.b)("h2",{id:"section_title"},"SECTION_TITLE"),Object(o.b)("p",null,"\ud83d\udee0 WORK IN PROGRESS"))}p.isMDXComponent=!0}}]);