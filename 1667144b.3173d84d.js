(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{111:function(e,t,a){"use strict";function n(e){var t,a,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(a=n(e[t]))&&(r&&(r+=" "),r+=a);else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}t.a=function(){for(var e,t,a=0,r="";a<arguments.length;)(e=arguments[a++])&&(t=n(e))&&(r&&(r+=" "),r+=t);return r}},112:function(e,t,a){"use strict";a.d(t,"a",(function(){return m})),a.d(t,"b",(function(){return u}));var n=a(0),r=a.n(n);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function c(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?c(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):c(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=r.a.createContext({}),b=function(e){var t=r.a.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},m=function(e){var t=b(e.components);return r.a.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},d=r.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,c=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),m=b(a),d=n,u=m["".concat(c,".").concat(d)]||m[d]||p[d]||i;return a?r.a.createElement(u,o(o({ref:t},l),{},{components:a})):r.a.createElement(u,o({ref:t},l))}));function u(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,c=new Array(i);c[0]=d;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:n,c[1]=o;for(var l=2;l<i;l++)c[l]=a[l];return r.a.createElement.apply(null,c)}return r.a.createElement.apply(null,a)}d.displayName="MDXCreateElement"},114:function(e,t,a){"use strict";var n=a(111),r=a(0),i=a.n(r),c=a(56),o=a.n(c);t.a=function(e){var t=e.icon,a=e.small;return i.a.createElement("span",{className:Object(n.a)(o.a.wrapper,a&&o.a["wrapper-small"])},i.a.createElement(t,null))}},122:function(e,t,a){"use strict";var n,r=a(0);function i(){return(i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e}).apply(this,arguments)}function c(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}t.a=function(e){var t=e.title,a=e.titleId,o=c(e,["title","titleId"]);return r.createElement("svg",i({xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24","aria-labelledby":a},o),t?r.createElement("title",{id:a},t):null,n||(n=r.createElement("path",{d:"M12 0l-.66.03 3.81 3.81L16.5 2.5c3.25 1.57 5.59 4.74 5.95 8.5h1.5C23.44 4.84 18.29 0 12 0m0 4c-1.93 0-3.5 1.57-3.5 3.5S10.07 11 12 11s3.5-1.57 3.5-3.5S13.93 4 12 4M.05 13C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81L7.5 21.5c-3.25-1.56-5.59-4.74-5.95-8.5H.05M12 13c-3.87 0-7 1.57-7 3.5V18h14v-1.5c0-1.93-3.13-3.5-7-3.5z"})))}},69:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return s})),a.d(t,"metadata",(function(){return l})),a.d(t,"toc",(function(){return b})),a.d(t,"default",(function(){return p}));var n=a(3),r=a(7),i=(a(0),a(112)),c=a(114),o=a(122),s={id:"roles",title:"Roles",sidebar_label:"Roles"},l={unversionedId:"handbook/roles",id:"handbook/roles",isDocsHomePage:!1,title:"Roles",description:"Description",source:"@site/docs/handbook/roles.md",slug:"/handbook/roles",permalink:"/Tutor-Management-System/docs/handbook/roles",editUrl:"https://github.com/Dudrie/Tutor-Management-System/edit/main/docs/docs/handbook/roles.md",version:"current",sidebar_label:"Roles",sidebar:"handbook",previous:{title:"Settings",permalink:"/Tutor-Management-System/docs/handbook/settings"}},b=[{value:"Description",id:"description",children:[]},{value:"<code>ADMIN</code>",id:"admin",children:[{value:"Page Access",id:"page-access",children:[]}]},{value:"<code>TUTOR</code>",id:"tutor",children:[{value:"Page Access",id:"page-access-1",children:[]}]},{value:"<code>CORRECTOR</code>",id:"corrector",children:[{value:"Page Access",id:"page-access-2",children:[]}]},{value:"<code>EMPLOYEE</code>",id:"employee",children:[{value:"Page Access",id:"page-access-3",children:[]}]}],m={toc:b};function p(e){var t=e.components,a=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(n.a)({},m,a,{components:t,mdxType:"MDXLayout"}),Object(i.b)("h2",{id:"description"},"Description"),Object(i.b)("p",null,"The Tutor-Management-System comes with several roles a user can take. Each role allows the user specific actions and disallows others. A user can have more than one role. You can find a complete description of all roles and which pages they can access in this document. Please note that all roles have access to the ",Object(i.b)("a",{parentName:"p",href:"./login"},Object(i.b)("em",{parentName:"a"},"Login"))," and ",Object(i.b)("a",{parentName:"p",href:"./dashboard"},Object(i.b)("em",{parentName:"a"},"Dashboard"))," pages and therefore those are not mentioned in the lists of the roles."),Object(i.b)("h2",{id:"admin"},Object(i.b)("inlineCode",{parentName:"h2"},"ADMIN")),Object(i.b)("p",null,"Is allowed to take any action and can manage the settings of the TMS. The admin is also responsible for creating users, tutorials and scheincriterias."),Object(i.b)("div",{className:"admonition admonition-info alert alert--info"},Object(i.b)("div",{parentName:"div",className:"admonition-heading"},Object(i.b)("h5",{parentName:"div"},Object(i.b)("span",{parentName:"h5",className:"admonition-icon"},Object(i.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(i.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"}))),"Admin with tutorials")),Object(i.b)("div",{parentName:"div",className:"admonition-content"},Object(i.b)("p",{parentName:"div"},"An admin itself can not be assigned to a tutorial. If an admin user should be assigned to a tutorial please assign the ",Object(i.b)("inlineCode",{parentName:"p"},"TUTOR")," role to that user aswell."),Object(i.b)("p",{parentName:"div"},"The same is true for admin users which also act as correctors for a tutorial (they need the ",Object(i.b)("inlineCode",{parentName:"p"},"CORRECTOR")," role)."))),Object(i.b)("h3",{id:"page-access"},"Page Access"),Object(i.b)("p",null,"He/she has access to the following pages:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./user_management"},Object(i.b)("em",{parentName:"a"},"User Management"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./tutorial_management"},Object(i.b)("em",{parentName:"a"},"Tutorial Management")),Object(i.b)("div",{parentName:"li",className:"admonition admonition-note alert alert--secondary"},Object(i.b)("div",{parentName:"div",className:"admonition-heading"},Object(i.b)("h5",{parentName:"div"},Object(i.b)("span",{parentName:"h5",className:"admonition-icon"},Object(i.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(i.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),Object(i.b)("div",{parentName:"div",className:"admonition-content"},Object(i.b)("p",{parentName:"div"},"An admin can access pages inside a tutorial (like the ",Object(i.b)("a",{parentName:"p",href:"./sheet_gradings"},Object(i.b)("em",{parentName:"a"},"Sheet Gradings")),') by clicking on "Manage" on a tutorial in the ',Object(i.b)("a",{parentName:"p",href:"./tutorial_management"},Object(i.b)("em",{parentName:"a"},"Tutorial Management")),".")))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./hand_ins"},Object(i.b)("em",{parentName:"a"},"Hand-Ins Management"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./student_overview"},Object(i.b)("em",{parentName:"a"},"Student Overview"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("em",{parentName:"li"},"Attendances")),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./criterias"},Object(i.b)("em",{parentName:"a"},"Scheincriteria Management"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./settings"},Object(i.b)("em",{parentName:"a"},"Settings")))),Object(i.b)("h2",{id:"tutor"},Object(i.b)("inlineCode",{parentName:"h2"},"TUTOR")),Object(i.b)("p",null,"Only ",Object(i.b)("inlineCode",{parentName:"p"},"TUTOR")," users can be assigned to tutorials as tutors. Furthermore, only this type of user can be used as substitutes for tutorials."),Object(i.b)("h3",{id:"page-access-1"},"Page Access"),Object(i.b)("p",null,"Tutors have access to the following pages. Pages marked with ",Object(i.b)(c.a,{icon:o.a,mdxType:"IconInText"})," are also accessible by a substiute tutor."),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./attendances"},Object(i.b)("em",{parentName:"a"},"Attendances"))," ",Object(i.b)(c.a,{icon:o.a,small:!0,mdxType:"IconInText"})),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./presentations"},Object(i.b)("em",{parentName:"a"},"Presentations"))," ",Object(i.b)(c.a,{icon:o.a,small:!0,mdxType:"IconInText"})),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./sheet_gradings"},Object(i.b)("em",{parentName:"a"},"Sheet Gradings"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./scheinexam_gradings"},Object(i.b)("em",{parentName:"a"},"Scheinexams"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./student_management"},Object(i.b)("em",{parentName:"a"},"Student Management"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./team_management"},Object(i.b)("em",{parentName:"a"},"Team Management"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./substitutes"},Object(i.b)("em",{parentName:"a"},"Substitutes")))),Object(i.b)("h2",{id:"corrector"},Object(i.b)("inlineCode",{parentName:"h2"},"CORRECTOR")),Object(i.b)("p",null,"A ",Object(i.b)("inlineCode",{parentName:"p"},"CORRECTOR")," user can be assinged as a corrector of a tutorial (or multiple). The user has access to all pages related to assigning gradings to students."),Object(i.b)("h3",{id:"page-access-2"},"Page Access"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./sheet_gradings"},Object(i.b)("em",{parentName:"a"},"Sheet Gradings"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./scheinexam_gradings"},Object(i.b)("em",{parentName:"a"},"Scheinexams")))),Object(i.b)("h2",{id:"employee"},Object(i.b)("inlineCode",{parentName:"h2"},"EMPLOYEE")),Object(i.b)("p",null,"An ",Object(i.b)("inlineCode",{parentName:"p"},"EMPLOYEE")," user can manage a few internal things. It is used if there are employees who help the organization but should not have administrative priviliges."),Object(i.b)("h3",{id:"page-access-3"},"Page Access"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./tutorial_management"},Object(i.b)("em",{parentName:"a"},"Tutorial Management")),Object(i.b)("div",{parentName:"li",className:"admonition admonition-note alert alert--secondary"},Object(i.b)("div",{parentName:"div",className:"admonition-heading"},Object(i.b)("h5",{parentName:"div"},Object(i.b)("span",{parentName:"h5",className:"admonition-icon"},Object(i.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(i.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),Object(i.b)("div",{parentName:"div",className:"admonition-content"},Object(i.b)("p",{parentName:"div"},"An employee user can ",Object(i.b)("strong",{parentName:"p"},"not")," access the internals of a tutorial (except managing the substitutes).")))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./hand_ins"},Object(i.b)("em",{parentName:"a"},"Hand-Ins Management"))),Object(i.b)("li",{parentName:"ul"},Object(i.b)("em",{parentName:"li"},"Attendances")),Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",{parentName:"li",href:"./criterias"},Object(i.b)("em",{parentName:"a"},"Scheincriteria Management")))))}p.isMDXComponent=!0}}]);