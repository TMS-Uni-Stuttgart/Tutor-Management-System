(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{111:function(e,t,n){"use strict";function a(e){var t,n,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=a(e[t]))&&(r&&(r+=" "),r+=n);else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}t.a=function(){for(var e,t,n=0,r="";n<arguments.length;)(e=arguments[n++])&&(t=a(e))&&(r&&(r+=" "),r+=t);return r}},112:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return u}));var a=n(0),r=n.n(a);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=r.a.createContext({}),b=function(e){var t=r.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=b(e.components);return r.a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),p=b(n),m=a,u=p["".concat(c,".").concat(m)]||p[m]||d[m]||o;return n?r.a.createElement(u,i(i({ref:t},l),{},{components:n})):r.a.createElement(u,i({ref:t},l))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,c=new Array(o);c[0]=m;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:a,c[1]=i;for(var l=2;l<o;l++)c[l]=n[l];return r.a.createElement.apply(null,c)}return r.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},113:function(e,t,n){"use strict";var a=n(111),r=n(0),o=n.n(r),c=n(55),i=n.n(c);t.a=function(e){var t=e.roles,n=Object(r.useMemo)((function(){return t.filter((function(e){return!!e})).map((function(e){return e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()})).sort()}),[t]);return o.a.createElement("div",{className:i.a.roleContainer},o.a.createElement("span",{className:i.a.roleLabel},"Roles:"),n.map((function(e){return o.a.createElement("span",{key:e,className:Object(a.a)("badge badge--primary",i.a.role)},e)})))}},114:function(e,t,n){"use strict";var a=n(111),r=n(0),o=n.n(r),c=n(56),i=n.n(c);t.a=function(e){var t=e.icon,n=e.small;return o.a.createElement("span",{className:Object(a.a)(i.a.wrapper,n&&i.a["wrapper-small"])},o.a.createElement(t,null))}},168:function(e,t,n){"use strict";n.r(t),t.default=n.p+"assets/images/scheinexam_grading_overview-9d0c9bacd4b259c9dd8b619d184289b5.png"},169:function(e,t,n){"use strict";n.r(t),t.default=n.p+"assets/images/scheinexam_grading_form-ffc5f6bb957d57c872281e02ff86cc81.png"},89:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return p}));var a=n(3),r=n(7),o=(n(0),n(112)),c=n(113),i=(n(114),{id:"scheinexam_gradings",title:"Gradings for Scheinexams",sidebar_label:"Scheinexam Gradings"}),s={unversionedId:"handbook/scheinexam_gradings",id:"handbook/scheinexam_gradings",isDocsHomePage:!1,title:"Gradings for Scheinexams",description:"Overview",source:"@site/docs/handbook/scheinexam_grading.md",slug:"/handbook/scheinexam_gradings",permalink:"/Tutor-Management-System/docs/handbook/scheinexam_gradings",editUrl:"https://github.com/Dudrie/Tutor-Management-System/edit/main/docs/docs/handbook/scheinexam_grading.md",version:"current",sidebar_label:"Scheinexam Gradings",sidebar:"handbook",previous:{title:"Gradings for Sheets",permalink:"/Tutor-Management-System/docs/handbook/sheet_gradings"},next:{title:"Presentations",permalink:"/Tutor-Management-System/docs/handbook/presentations"}},l=[{value:"Overview",id:"overview",children:[]},{value:"Enter Points",id:"enter-points",children:[]}],b={toc:l};function p(e){var t=e.components,i=Object(r.a)(e,["components"]);return Object(o.b)("wrapper",Object(a.a)({},b,i,{components:t,mdxType:"MDXLayout"}),Object(o.b)(c.a,{roles:["tutor","corrector"],mdxType:"Roles"}),Object(o.b)("h2",{id:"overview"},"Overview"),Object(o.b)("p",null,'After selecting a scheinexam from the dropdown menu you can see the gradings the students have for the selected exam. To add a grading to or change the grading of a student click the "Enter Points" button on his/her card.'),Object(o.b)("p",null,Object(o.b)("img",{alt:"Scheinexam Grading page",src:n(168).default})),Object(o.b)("ol",null,Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Scheinexam Selection"),": Select the scheinexam you want to view.")),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Student's Grading"),": The current grading of a student."),Object(o.b)("div",{parentName:"li",className:"admonition admonition-note alert alert--secondary"},Object(o.b)("div",{parentName:"div",className:"admonition-heading"},Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",{parentName:"h5",className:"admonition-icon"},Object(o.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(o.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),Object(o.b)("div",{parentName:"div",className:"admonition-content"},Object(o.b)("p",{parentName:"div"},"If a student has no grading all exercises are displayed with 0 points.")))),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Enter Points"),": Enter points for the selected scheinexam and student (see ",Object(o.b)("a",{parentName:"p",href:"#enter-points"},Object(o.b)("em",{parentName:"a"},"below")),")."))),Object(o.b)("h2",{id:"enter-points"},"Enter Points"),Object(o.b)("p",null,Object(o.b)("img",{alt:"Scheinexam Point Entry Form",src:n(169).default})),Object(o.b)("ol",null,Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Student Selection"),": Select the student you want to change the grading of."),Object(o.b)("div",{parentName:"li",className:"admonition admonition-note alert alert--secondary"},Object(o.b)("div",{parentName:"div",className:"admonition-heading"},Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",{parentName:"h5",className:"admonition-icon"},Object(o.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(o.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"Unsaved changes")),Object(o.b)("div",{parentName:"div",className:"admonition-content"},Object(o.b)("p",{parentName:"div"},"If you have unsaved changes you are prompted to save them before switching. If do ",Object(o.b)("strong",{parentName:"p"},"not")," the changes are lost.")))),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Points for exercises"),': Enter the points the student got for each exercise. Please note that exercises are always "bundled" together and that no sub-exercises are shown.')),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Save"),": Save the changes for the currently selected student.")),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Reset"),": Reset your changes for the student to the last saved ones.")),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},Object(o.b)("strong",{parentName:"p"},"Go back"),": Go back to the overview page."))))}p.isMDXComponent=!0}}]);