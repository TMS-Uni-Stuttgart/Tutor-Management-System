(window.webpackJsonp=window.webpackJsonp||[]).push([[18],{107:function(e,t,a){"use strict";function n(e){var t,a,i="";if("string"==typeof e||"number"==typeof e)i+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(a=n(e[t]))&&(i&&(i+=" "),i+=a);else for(t in e)e[t]&&(i&&(i+=" "),i+=t);return i}t.a=function(){for(var e,t,a=0,i="";a<arguments.length;)(e=arguments[a++])&&(t=n(e))&&(i&&(i+=" "),i+=t);return i}},108:function(e,t,a){"use strict";a.d(t,"a",(function(){return p})),a.d(t,"b",(function(){return h}));var n=a(0),i=a.n(n);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function c(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var b=i.a.createContext({}),l=function(e){var t=i.a.useContext(b),a=t;return e&&(a="function"==typeof e?e(t):c(c({},t),e)),a},p=function(e){var t=l(e.components);return i.a.createElement(b.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},d=i.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,r=e.originalType,o=e.parentName,b=s(e,["components","mdxType","originalType","parentName"]),p=l(a),d=n,h=p["".concat(o,".").concat(d)]||p[d]||m[d]||r;return a?i.a.createElement(h,c(c({ref:t},b),{},{components:a})):i.a.createElement(h,c({ref:t},b))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=a.length,o=new Array(r);o[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:n,o[1]=c;for(var b=2;b<r;b++)o[b]=a[b];return i.a.createElement.apply(null,o)}return i.a.createElement.apply(null,a)}d.displayName="MDXCreateElement"},109:function(e,t,a){"use strict";var n=a(107),i=a(0),r=a.n(i),o=a(55),c=a.n(o);t.a=function(e){var t=e.roles,a=Object(i.useMemo)((function(){return t.filter((function(e){return!!e})).map((function(e){return e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()})).sort()}),[t]);return r.a.createElement("div",{className:c.a.roleContainer},r.a.createElement("span",{className:c.a.roleLabel},"Roles:"),a.map((function(e){return r.a.createElement("span",{key:e,className:Object(n.a)("badge badge--primary",c.a.role)},e)})))}},110:function(e,t,a){"use strict";var n=a(107),i=a(0),r=a.n(i),o=a(56),c=a.n(o);t.a=function(e){var t=e.icon,a=e.small;return r.a.createElement("span",{className:Object(n.a)(c.a.wrapper,a&&c.a["wrapper-small"])},r.a.createElement(t,null))}},112:function(e,t,a){"use strict";var n=a(0);function i(){return(i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e}).apply(this,arguments)}function r(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var o=n.createElement("path",{d:"M12 16a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2m0-6a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2m0-6a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2z"});t.a=function(e){var t=e.title,a=e.titleId,c=r(e,["title","titleId"]);return n.createElement("svg",i({xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24","aria-labelledby":a},c),t?n.createElement("title",{id:a},t):null,o)}},168:function(e,t,a){"use strict";a.r(t),t.default=a.p+"assets/images/exercise_form-3c37e481d8f3ea47c9e140ee229310a4.png"},88:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return b})),a.d(t,"metadata",(function(){return l})),a.d(t,"toc",(function(){return p})),a.d(t,"default",(function(){return d}));var n=a(3),i=a(7),r=(a(0),a(108)),o=a(109),c=a(110),s=a(112),b={id:"hand_ins",title:"Hand-Ins",sidebar_label:"Hand-Ins"},l={unversionedId:"handbook/hand_ins",id:"handbook/hand_ins",isDocsHomePage:!1,title:"Hand-Ins",description:"Create a Hand-In",source:"@site/docs/handbook/hand_ins.md",slug:"/handbook/hand_ins",permalink:"/Tutor-Management-System/docs/handbook/hand_ins",editUrl:"https://github.com/Dudrie/Tutor-Management-System/edit/main/docs/docs/handbook/hand_ins.md",version:"current",sidebar_label:"Hand-Ins",sidebar:"handbook",previous:{title:"Student Overview (Admin)",permalink:"/Tutor-Management-System/docs/handbook/student_overview"},next:{title:"Scheincriterias",permalink:"/Tutor-Management-System/docs/handbook/criterias"}},p=[{value:"Create a Hand-In",id:"create-a-hand-in",children:[]},{value:"Hand-In Types",id:"hand-in-types",children:[{value:"Exercise Sheet",id:"exercise-sheet",children:[]},{value:"Short Test",id:"short-test",children:[]},{value:"Scheinexam",id:"scheinexam",children:[]}]},{value:"Change a Hand-In",id:"change-a-hand-in",children:[]},{value:"Delete a Hand-In",id:"delete-a-hand-in",children:[]},{value:"Import Short Test Results",id:"import-short-test-results",children:[]}],m={toc:p};function d(e){var t=e.components,b=Object(i.a)(e,["components"]);return Object(r.b)("wrapper",Object(n.a)({},m,b,{components:t,mdxType:"MDXLayout"}),Object(r.b)(o.a,{roles:["admin","employee"],mdxType:"Roles"}),Object(r.b)("h2",{id:"create-a-hand-in"},"Create a Hand-In"),Object(r.b)("p",null,'To add a new hand-in click the "+ New" button in the upper right. Each hand-in has a slightly different form (see below in the ',Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"#hand-in-types"}),"hand-in types"),"). However, all three hand-in forms use the same form for their exercises."),Object(r.b)("p",null,Object(r.b)("img",{alt:"Exercise Form",src:a(168).default})),Object(r.b)("ol",null,Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Add Exercise"),": Add a new exercise to the sheet.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Exercise Name"),": Name of the exercise on the hand-in."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Will be automatically set on each new exercise but can be changed.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Total Points"),": The total points of the exercise."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"This is only needed and editable if the exercise does ",Object(r.b)("strong",{parentName:"p"},"not")," have any subexercises.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Bonus Exercise"),": Mark this exercise as bonus exercise. While students can gain points in bonus exercises the total points of a bonus exercise are ",Object(r.b)("strong",{parentName:"p"},"not")," added to the total points of the sheet.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Remove Exercise"),": Remove the exercise from the sheet."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-caution alert alert--warning"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"There will be ",Object(r.b)("strong",{parentName:"p"},"no")," confirmation prompt.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Add Subexercise"),": Add a new subexercise to this exercise.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Subexercise Name"),": Name of the subexercise.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Subexercise Points"),": The total points of the subexercise.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Bonus Subexercise"),": Mark this subexercise as a bonus. The total points of the subexercise will ",Object(r.b)("strong",{parentName:"p"},"not")," be added to the total points of the exercise if it's a bonus subexercise.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Remove Subexercise"),": Remove the subexercise from the exercise.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Save"),": Save the hand-in."))),Object(r.b)("h2",{id:"hand-in-types"},"Hand-In Types"),Object(r.b)("h3",{id:"exercise-sheet"},"Exercise Sheet"),Object(r.b)("p",null,"An exercise sheet is used for the ",Object(r.b)("em",{parentName:"p"},"Sheet")," criterias and has the following two form inputs:"),Object(r.b)("ol",null,Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Sheet Number"),": The number of the sheet."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"On opening the creation form this number is automatically set but can be changed.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Bonus Sheet"),": Mark the sheet as bonus. While students can pass it (or gain points on it) it is not added to the number of sheets a student has to pass (or to the total number of points available)."))),Object(r.b)("h3",{id:"short-test"},"Short Test"),Object(r.b)("div",{className:"admonition admonition-tip alert alert--success"},Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"})))),"tip")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"If you import the results of a new short test (see ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"#import-short-test-results"}),"Import Short Tests Results")," below) a new short test is automatically created during the import process."))),Object(r.b)("p",null,"A short test is used for the ",Object(r.b)("em",{parentName:"p"},"Short Test")," criteria and has the following two inputs:"),Object(r.b)("ol",null,Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Short Test Number"),": The number of the short test."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"On opening the creation form this number is automatically set but can be changed.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Percentag to pass"),": The percentage of the points needed to pass the test."))),Object(r.b)("h4",{id:"additional-menu-option"},"Additional menu option"),Object(r.b)("p",null,"If you click on the menu button ",Object(r.b)(c.a,{icon:s.a,mdxType:"IconInText"}),' you can select the additional option "re-import results". This lets you re-import already imported results (ie if the results where inaccurate at the first time) without re-creating the short test.'),Object(r.b)("h3",{id:"scheinexam"},"Scheinexam"),Object(r.b)("p",null,"A scheinexam is used for the ",Object(r.b)("em",{parentName:"p"},"scheinexam")," criteria and has the following three inputs:"),Object(r.b)("ol",null,Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Scheinexam Number"),": The number of the scheinexam."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"On opening the creation form this number is automatically set but can be changed.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Percentag to pass"),": The percentage of the points needed to pass the scheinexam.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Date"),": The date of the scheinexam. This is only used to display additional information on the PDF containing the results."))),Object(r.b)("h4",{id:"additional-menu-option-1"},"Additional menu option"),Object(r.b)("p",null,"If you click on the menu button ",Object(r.b)(c.a,{icon:s.a,mdxType:"IconInText"}),' you can select the additional option "results". This will create a PDF containing the results of the students for the scheinexam. By default the PDF contains a table with the masked matriculation numbers of the students and their result ("passed" / "not passed").'),Object(r.b)("h2",{id:"change-a-hand-in"},"Change a Hand-In"),Object(r.b)("p",null,"To edit a hand-in click the menu button ",Object(r.b)(c.a,{icon:s.a,mdxType:"IconInText"}),' on it\'s bar and choose "Edit". The form that opens up is the same one as for the process of creating a hand-in (',Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"#create-a-hand-in"}),"see above"),")."),Object(r.b)("h2",{id:"delete-a-hand-in"},"Delete a Hand-In"),Object(r.b)("p",null,"To delete a hand-in click the menu button ",Object(r.b)(c.a,{icon:s.a,mdxType:"IconInText"}),' on it\'s bar and choose "Delete". A confirmation dialog opens up if you really want to delete the hand-in.'),Object(r.b)("div",{className:"admonition admonition-warning alert alert--danger"},Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"})))),"No restore possible")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Deleting a hand-in is ",Object(r.b)("strong",{parentName:"p"},"permanent"),"! Deleted hand-ins can ",Object(r.b)("strong",{parentName:"p"},"NOT")," be restored and gradings related to it are ",Object(r.b)("strong",{parentName:"p"},"lost"),"!"))),Object(r.b)("h2",{id:"import-short-test-results"},"Import Short Test Results"),Object(r.b)("p",null,'To import short test results from the Ilias system you can use the import wizard by clicking on the "Import new results" button in the upper right on the short test page. Follow the step-by-step wizard which opens up.'),Object(r.b)("ol",null,Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Export results from Ilias"),": Follow the on-screen instruction to export the correct CSV file from the Ilias system"),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Make sure to export the correct CSV file. There is only one file that contains the results and the Ilias names.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Import CSV content"),': Import the CSV content by either copy & paste the content in the input field or by uploading the file. You can upload the file by clicking the "Upload CSV-file" button and the content will be pasted into the input field after uploading. If the separator is not correctly detected on the next page you can change the seperator on ',Object(r.b)("em",{parentName:"p"},"this"),' page using the "Separator" input in the upper right.'),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-tip alert alert--success"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"})))),"Drag & Drop")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"You can also drag & drop the file on the button")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Map Columns"),": The TMS tries to find the three needed columns automatically. It needs the Ilias name and the test results of the students together with the total results. If the columns are not properly detected you can change them through the dropdown menus on this page.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Map Ilias names"),": If the CSV file contains any Ilias names which could not be find in the TMS system you can manually map those names to students (these mappings will only be used for this import process). The page also shows a list of all students in the TMS system which could not be found in the imported CSV (either because they do not have an Ilias name saved in the TMS or their Ilias name was not present in the CSV file).")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Adjust Short Test"),": If necessary you can adjust the short test that would be generated during the import process. By default the number gets automatically increased and it only contains one exercise which holds the total points of the test."))))}d.isMDXComponent=!0}}]);