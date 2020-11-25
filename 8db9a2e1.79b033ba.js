(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{94:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return m})),n.d(t,"metadata",(function(){return h})),n.d(t,"rightToc",(function(){return v})),n.d(t,"default",(function(){return O}));var r=n(2),a=n(6),i=n(0),o=n(96),c=n(97),l=n(98),s=n(99);function u(){return(u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function d(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var b=i.createElement("path",{d:"M16 9C22 9 22 13 22 13V15H16V13C16 13 16 11.31 14.85 9.8C14.68 9.57 14.47 9.35 14.25 9.14C14.77 9.06 15.34 9 16 9M2 13C2 13 2 9 8 9S14 13 14 13V15H2V13M9 17V19H15V17L18 20L15 23V21H9V23L6 20L9 17M8 1C6.34 1 5 2.34 5 4S6.34 7 8 7 11 5.66 11 4 9.66 1 8 1M16 1C14.34 1 13 2.34 13 4S14.34 7 16 7 19 5.66 19 4 17.66 1 16 1Z"});var p=function(e){var t=e.title,n=e.titleId,r=d(e,["title","titleId"]);return i.createElement("svg",u({xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",width:24,height:24,viewBox:"0 0 24 24","aria-labelledby":n},r),t?i.createElement("title",{id:n},t):null,b)},m={id:"student_overview",title:"Student Overview (Admin)",sidebar_label:"Student Overview"},h={unversionedId:"handbook/student_overview",id:"handbook/student_overview",isDocsHomePage:!1,title:"Student Overview (Admin)",description:"Overview",source:"@site/docs/handbook/student_overview.md",slug:"/handbook/student_overview",permalink:"/Tutor-Management-System/docs/handbook/student_overview",editUrl:"https://github.com/Dudrie/Tutor-Management-System/edit/add-documentation/docs/docs/handbook/student_overview.md",version:"current",sidebar_label:"Student Overview",sidebar:"handbook",previous:{title:"Tutorial Management",permalink:"/Tutor-Management-System/docs/handbook/tutorial_management"},next:{title:"Hand-Ins",permalink:"/Tutor-Management-System/docs/handbook/hand_ins"}},v=[{value:"Overview",id:"overview",children:[]},{value:"Change Tutorial",id:"change-tutorial",children:[]},{value:"Print List with Results",id:"print-list-with-results",children:[]}],f={rightToc:v};function O(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},f,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)(c.a,{roles:["admin"],mdxType:"Roles"}),Object(o.b)("h2",{id:"overview"},"Overview"),Object(o.b)("p",null,"The overview page shows all students saved in the system and their current schein status. As an adminstrator you can edit or delete students by clicking on the menu button ",Object(o.b)(l.a,{icon:s.a,mdxType:"IconInText"})," and selecting the desired option. You can access the ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"./student_info"}),Object(o.b)("em",{parentName:"a"},"Student info page")),' by clicking on the "Information" button. Furthermore, you can search for a specific student by using the search bar at the top. For more information see the ',Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"./student_management"}),Object(o.b)("em",{parentName:"a"},"Student Management page")),"."),Object(o.b)("h2",{id:"change-tutorial"},"Change Tutorial"),Object(o.b)("p",null,"You can move a student from one tutorial to another by clicking on the menu button ",Object(o.b)(l.a,{icon:s.a,mdxType:"IconInText"}),' and selecting the "',Object(o.b)(l.a,{icon:p,mdxType:"IconInText"}),' Change Tutorial" option. A dialog opens up in which you can select the new tutorial.'),Object(o.b)("div",{className:"admonition admonition-important alert alert--info"},Object(o.b)("div",Object(r.a)({parentName:"div"},{className:"admonition-heading"}),Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",Object(r.a)({parentName:"h5"},{className:"admonition-icon"}),Object(o.b)("svg",Object(r.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(o.b)("path",Object(r.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"important")),Object(o.b)("div",Object(r.a)({parentName:"div"},{className:"admonition-content"}),Object(o.b)("p",{parentName:"div"},"While the student keeps it gradings (and while they will adjust if the old ones are changed) he/she loses the team. The tutor of the new tutorial has to assign him/her to a team."))),Object(o.b)("h2",{id:"print-list-with-results"},"Print List with Results"),Object(o.b)("p",null,'To print a list with the schein results click on the "Print Scheinlist" button. A PDF will be generated containing a table where each student will be displayed with a shortened/masked matriculation number and their result ("passed" / "not passed").'),Object(o.b)("p",null,'To print a list with completly readable matriculation number click on the small arrow on the right of the button and select "Print unshortened list". This list will still contain the shortened variants of the matriculation numbers but each also shows the unshortened number aswell.'),Object(o.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(o.b)("div",Object(r.a)({parentName:"div"},{className:"admonition-heading"}),Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",Object(r.a)({parentName:"h5"},{className:"admonition-icon"}),Object(o.b)("svg",Object(r.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(o.b)("path",Object(r.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"Students without matriculation number")),Object(o.b)("div",Object(r.a)({parentName:"div"},{className:"admonition-content"}),Object(o.b)("p",{parentName:"div"},"If a student does ",Object(o.b)("strong",{parentName:"p"},"not")," have a matriculation number saved in the system he/she will ",Object(o.b)("strong",{parentName:"p"},"not")," appear on any of the two lists. However, due to the shortening algorithm it could appear as he/she is on the list."))))}O.isMDXComponent=!0},95:function(e,t,n){"use strict";function r(e){var t,n,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=r(e[t]))&&(a&&(a+=" "),a+=n);else for(t in e)e[t]&&(a&&(a+=" "),a+=t);return a}t.a=function(){for(var e,t,n=0,a="";n<arguments.length;)(e=arguments[n++])&&(t=r(e))&&(a&&(a+=" "),a+=t);return a}},96:function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return m}));var r=n(0),a=n.n(r);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=a.a.createContext({}),u=function(e){var t=a.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},d=function(e){var t=u(e.components);return a.a.createElement(s.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},p=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=u(n),p=r,m=d["".concat(o,".").concat(p)]||d[p]||b[p]||i;return n?a.a.createElement(m,c(c({ref:t},s),{},{components:n})):a.a.createElement(m,c({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=p;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:r,o[1]=c;for(var s=2;s<i;s++)o[s]=n[s];return a.a.createElement.apply(null,o)}return a.a.createElement.apply(null,n)}p.displayName="MDXCreateElement"},97:function(e,t,n){"use strict";var r=n(95),a=n(0),i=n.n(a),o=n(47),c=n.n(o);t.a=function(e){var t=e.roles,n=Object(a.useMemo)((function(){return t.filter((function(e){return!!e})).map((function(e){return e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()})).sort()}),[t]);return i.a.createElement("div",{className:c.a.roleContainer},i.a.createElement("span",{className:c.a.roleLabel},"Roles:"),n.map((function(e){return i.a.createElement("span",{key:e,className:Object(r.a)("badge badge--primary",c.a.role)},e)})))}},98:function(e,t,n){"use strict";var r=n(95),a=n(0),i=n.n(a),o=n(48),c=n.n(o);t.a=function(e){var t=e.icon,n=e.small;return i.a.createElement("span",{className:Object(r.a)(c.a.wrapper,n&&c.a["wrapper-small"])},i.a.createElement(t,null))}},99:function(e,t,n){"use strict";var r=n(0);function a(){return(a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=r.createElement("path",{d:"M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"});t.a=function(e){var t=e.title,n=e.titleId,c=i(e,["title","titleId"]);return r.createElement("svg",a({xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",width:24,height:24,viewBox:"0 0 24 24","aria-labelledby":n},c),t?r.createElement("title",{id:n},t):null,o)}}}]);