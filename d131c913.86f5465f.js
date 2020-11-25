(window.webpackJsonp=window.webpackJsonp||[]).push([[28],{107:function(e,t,a){"use strict";var n=a(0),r=a(108);t.a=function(){var e=Object(n.useContext)(r.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},108:function(e,t,a){"use strict";var n=a(0),r=Object(n.createContext)(void 0);t.a=r},90:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return j})),a.d(t,"metadata",(function(){return h})),a.d(t,"rightToc",(function(){return g})),a.d(t,"default",(function(){return f}));var n=a(2),r=a(6),i=a(0),b=a.n(i),l=a(96),o=a(107),c=a(95),s=a(81),d=a.n(s),m=37,p=39;var u=function(e){var t=e.block,a=e.children,n=e.defaultValue,r=e.values,l=e.groupId,s=e.className,u=Object(o.a)(),O=u.tabGroupChoices,j=u.setTabGroupChoices,h=Object(i.useState)(n),g=h[0],N=h[1],f=Object(i.useState)(!1),y=f[0],v=f[1];if(null!=l){var C=O[l];null!=C&&C!==g&&r.some((function(e){return e.value===C}))&&N(C)}var w=function(e){N(e),null!=l&&j(l,e)},T=[],x=function(e){e.metaKey||e.altKey||e.ctrlKey||v(!0)},D=function(){v(!1)};return Object(i.useEffect)((function(){return window.addEventListener("keydown",x),window.addEventListener("mousedown",D),function(){window.removeEventListener("keydown",x),window.removeEventListener("mousedown",D)}}),[]),b.a.createElement("div",null,b.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(c.a)("tabs",{"tabs--block":t},s)},r.map((function(e){var t=e.value,a=e.label;return b.a.createElement("li",{role:"tab",tabIndex:0,"aria-selected":g===t,className:Object(c.a)("tabs__item",d.a.tabItem,{"tabs__item--active":g===t}),style:y?{}:{outline:"none"},key:t,ref:function(e){return T.push(e)},onKeyDown:function(e){!function(e,t,a){switch(a.keyCode){case p:!function(e,t){var a=e.indexOf(t)+1;e[a]?e[a].focus():e[0].focus()}(e,t);break;case m:!function(e,t){var a=e.indexOf(t)-1;e[a]?e[a].focus():e[e.length-1].focus()}(e,t)}}(T,e.target,e),x(e)},onFocus:function(){return w(t)},onClick:function(){w(t),v(!1)},onPointerDown:function(){return v(!1)}},a)}))),b.a.createElement("div",{role:"tabpanel",className:"margin-vert--md"},i.Children.toArray(a).filter((function(e){return e.props.value===g}))[0]))};var O=function(e){return b.a.createElement("div",null,e.children)},j={id:"configuration",title:"Configuration",sidebar_label:"Configuration"},h={unversionedId:"setup/configuration",id:"setup/configuration",isDocsHomePage:!1,title:"Configuration",description:"Structure of Directory",source:"@site/docs/setup/configuration.md",slug:"/setup/configuration",permalink:"/Tutor-Management-System/docs/setup/configuration",editUrl:"https://github.com/Dudrie/Tutor-Management-System/edit/add-documentation/docs/docs/setup/configuration.md",version:"current",sidebar_label:"Configuration",sidebar:"setup",previous:{title:"Installation",permalink:"/Tutor-Management-System/docs/setup/installation"},next:{title:"Update",permalink:"/Tutor-Management-System/docs/setup/update"}},g=[{value:"Structure of Directory",id:"structure-of-directory",children:[]},{value:"Options",id:"options",children:[{value:"<code>ApplicationConfiguration</code>",id:"applicationconfiguration",children:[]},{value:"<code>DatabaseConfiguration</code>",id:"databaseconfiguration",children:[]}]},{value:"Environment Variables",id:"environment-variables",children:[]},{value:"Pug Templates",id:"pug-templates",children:[{value:"Attendance Template",id:"attendance-template",children:[]},{value:"Credentials Template",id:"credentials-template",children:[]},{value:"Mail Template",id:"mail-template",children:[]},{value:"Scheinexam Results Template",id:"scheinexam-results-template",children:[]},{value:"Scheinstatus Results Template",id:"scheinstatus-results-template",children:[]}]}],N={rightToc:g};function f(e){var t=e.components,a=Object(r.a)(e,["components"]);return Object(l.b)("wrapper",Object(n.a)({},N,a,{components:t,mdxType:"MDXLayout"}),Object(l.b)("h2",{id:"structure-of-directory"},"Structure of Directory"),Object(l.b)("p",null,"Within the ",Object(l.b)("inlineCode",{parentName:"p"},"tms/config/")," directory containing the configuration files the following items have to be present:"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"production.yml"),": YAML file containing the general configuration for the server."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"templates/"),": Directory containing the ",Object(l.b)("a",Object(n.a)({parentName:"li"},{href:"https://pugjs.org/"}),"Pug")," template files (see below).")),Object(l.b)("p",null,"Those files are provided through a docker volume. See the ",Object(l.b)("a",Object(n.a)({parentName:"p"},{href:"installation"}),"installation guide")," for more information."),Object(l.b)("p",null,"Every ",Object(l.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/Dudrie/Tutor-Management-System/releases"}),"release")," contains either a link to the current sample configuration or a sample configuration itself. If it contains the later the server configuration might need an update according to the ",Object(l.b)("em",{parentName:"p"},"Configuration")," section of the release."),Object(l.b)("h2",{id:"options"},"Options"),Object(l.b)("p",null,"The configuration object is of type ",Object(l.b)("inlineCode",{parentName:"p"},"ApplicationConfiguration"),"."),Object(l.b)("h3",{id:"applicationconfiguration"},Object(l.b)("inlineCode",{parentName:"h3"},"ApplicationConfiguration")),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Option"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Required / Default"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"database")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("strong",{parentName:"td"},"Required")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"DatabaseConfiguration")," - Configuration of the database. See below for more information.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"sessionTimeout")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("em",{parentName:"td"},"Default: 120")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"Number")," - The time of inactivity in ",Object(l.b)("strong",{parentName:"td"},"minutes")," after which the session of the user times out and he/she must log in again.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"prefix")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("em",{parentName:"td"},"(optional, no default)")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Prefix of the root path the application is hosted on. If the application is hosted on the root path this setting must be omitted. Otherwise it has to be set to the prefix (ie. for the path ",Object(l.b)("inlineCode",{parentName:"td"},"https://example.org/foo")," this setting has to be set to ",Object(l.b)("inlineCode",{parentName:"td"},"foo"),")")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"handbookUrl")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("em",{parentName:"td"},"(optional, no default)")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - URL to the handbook of the TMS. You should only have to change this if you want to provide your own version of the handbook.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"defaultSettings")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("em",{parentName:"td"},'(optional, defaults see "Settings" page)')),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),"Settings to initialize parts of the server with. Those settings can also be configured through the client later on. See ",Object(l.b)("a",Object(n.a)({parentName:"td"},{href:"../handbook/settings"}),"Settings")," for more information.")))),Object(l.b)("h3",{id:"databaseconfiguration"},Object(l.b)("inlineCode",{parentName:"h3"},"DatabaseConfiguration")),Object(l.b)("p",null,"The following table contains the options available for the database configuration, a short description and their default value (if they are optional)."),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Option"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Required / Default"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"databaseURL")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("strong",{parentName:"td"},"Required")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - The URL which resolves to the database and the desired collection. Must be a MongoDB URL. ",Object(l.b)("em",{parentName:"td"},"Please note: Databases other than MongoDB might work if they are compatible to mongoose. However they are not tested and officially supported."))),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"maxRetries")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("em",{parentName:"td"},"Default: 2")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"Number")," - Configures how often the server tries to establish a connection to the database while ",Object(l.b)("strong",{parentName:"td"},"starting")," the server. If there is no connection after the maximum amount of retries the server is stopped with an error code. ",Object(l.b)("em",{parentName:"td"},"Please note: Any try to connect can take up to 30s."))),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"config")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("em",{parentName:"td"},"Default: ",Object(l.b)("inlineCode",{parentName:"em"},"{useNewUrlParser: true, useUnifiedTopology: true}"))),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"ConnectionOptions")," - The ",Object(l.b)("inlineCode",{parentName:"td"},"auth")," property will not be respected. To set authentication details one must use the corresponding ",Object(l.b)("a",Object(n.a)({parentName:"td"},{href:"#environment-variables"}),"environment variables")," Further configuration options provided to the MongoDB connection. For more information see the ",Object(l.b)("a",Object(n.a)({parentName:"td"},{href:"https://mongoosejs.com/docs/connections.html"}),"mongoose documentation"),".")))),Object(l.b)("h2",{id:"environment-variables"},"Environment Variables"),Object(l.b)("p",null,"All of the following environment variables are ",Object(l.b)("strong",{parentName:"p"},"required")," unless stated otherwise."),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Variable"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"TMS_MONGODB_USER")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Username to log into the mongoDB.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"TMS_MONGODB_PW")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Password to log into the mongoDB.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"TMS_SECRET")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Secret to encrypt sensitive fields in the documents in the DB (ie names of users, ...). This secret should be created like a ",Object(l.b)("em",{parentName:"td"},"secure password")," (no easy to guess words, ...).")))),Object(l.b)("h2",{id:"pug-templates"},"Pug Templates"),Object(l.b)("p",null,"The Tutor-Management-System can generate various PDFs. These can be configured using the following templates. The templates must be inside an ",Object(l.b)("inlineCode",{parentName:"p"},"templates/")," folder inside the ",Object(l.b)("inlineCode",{parentName:"p"},"config/")," folder. All templates use the ",Object(l.b)("a",Object(n.a)({parentName:"p"},{href:"https://pugjs.org/api/getting-started.html"}),"pug template engine")," and variables which will get substituted by the corresponding value on PDF generation. Every template section contains a description on it's usage, the variables used inside and an example. Please note that the templates do NOT need a ",Object(l.b)("inlineCode",{parentName:"p"},"html"),", ",Object(l.b)("inlineCode",{parentName:"p"},"body")," or ",Object(l.b)("inlineCode",{parentName:"p"},"head")," because they will be inserted into a body during PDF generation."),Object(l.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(l.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(l.b)("h5",{parentName:"div"},Object(l.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(l.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(l.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(l.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(l.b)("p",{parentName:"div"},"Please note that ",Object(l.b)("strong",{parentName:"p"},"all template files")," must be present at the start of the server."))),Object(l.b)("h3",{id:"attendance-template"},"Attendance Template"),Object(l.b)("p",null,Object(l.b)("strong",{parentName:"p"},"Filename: ",Object(l.b)("inlineCode",{parentName:"strong"},"attendance.pug"))),Object(l.b)("p",null,"This template gets used on the creation of a PDF containing a list of students of a tutorial. On this list students can leave their signature if they are present."),Object(l.b)(u,{defaultValue:"desc",values:[{label:"Description",value:"desc"},{label:"Example",value:"example"}],mdxType:"Tabs"},Object(l.b)(O,{value:"desc",mdxType:"TabItem"},Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Variable"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"tutorialSlot")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - The slot of the tutorial which belongs to the sheet.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"date")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"DateTime")," - Date to which the attendance list belongs. Takes in the format after a comma. For more information on the available functions see the ",Object(l.b)("a",Object(n.a)({parentName:"td"},{href:"https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html"}),"luxon documentation"))),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"tutorName")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Name of the tutor in the format ",Object(l.b)("inlineCode",{parentName:"td"},"<lastname>, <firstname>"),".")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"students")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"{ name: string }[]")," - Array containing objects of which each holds the name of one student."))))),Object(l.b)(O,{value:"example",mdxType:"TabItem"},Object(l.b)("pre",null,Object(l.b)("code",Object(n.a)({parentName:"pre"},{className:"language-pug"}),"h3(style='text-align: center') Anwesenheitsliste\n\ndiv(style='display: flex; width: 100%;')\n  span Tutorium #{tutorialSlot}\n  span(style='margin-left: auto; float: right;') Datum: #{date.toFormat('dd.MM.yyyy')}\n\ndiv(style='margin-bottom: 16px;')\n  span Tutor: #{tutorName}\n\ntable\n  thead\n    tr\n      th Name\n      th Unterschrift\n\n  tbody\n    each student in students\n      tr\n        td #{student.name}\n        td\n")))),Object(l.b)("h3",{id:"credentials-template"},"Credentials Template"),Object(l.b)("p",null,Object(l.b)("strong",{parentName:"p"},"Filename: ",Object(l.b)("inlineCode",{parentName:"strong"},"credentials.pug"))),Object(l.b)(u,{defaultValue:"desc",values:[{label:"Description",value:"desc"},{label:"Example",value:"example"}],mdxType:"Tabs"},Object(l.b)(O,{value:"desc",mdxType:"TabItem"},Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Variable"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"credentials")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"{ name: string; username: string; password: string }[]")," - Array containing objects which hold information about the user."))))),Object(l.b)(O,{value:"example",mdxType:"TabItem"},Object(l.b)("pre",null,Object(l.b)("code",Object(n.a)({parentName:"pre"},{className:"language-pug"}),"h3(style='text-align: center') Zugangsdaten\n\ntable\n  style(scoped).\n    td {\n      padding: 0.5em 1em;\n      font-family: 'Courier New', Courier, monospace;\n      line-height: 200%;\n    }\n\n  thead\n    tr\n      th Name\n      th Nutzername\n      th Password\n\n  tbody\n    each user in users\n      tr\n        td #{user.name}\n        td #{user.username}\n        if !!user.password\n          td #{user.password}\n        else\n          td Kein tmp. Passwort\n")))),Object(l.b)("h3",{id:"mail-template"},"Mail Template"),Object(l.b)("p",null,Object(l.b)("strong",{parentName:"p"},"Filename: ",Object(l.b)("inlineCode",{parentName:"strong"},"mail.pug"))),Object(l.b)(u,{defaultValue:"desc",values:[{label:"Description",value:"desc"},{label:"Example",value:"example"}],mdxType:"Tabs"},Object(l.b)(O,{value:"desc",mdxType:"TabItem"},Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Variable"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"name")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Name of the user which gets the email.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"username")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Username of the user which gets the email.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"password")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"String")," - Password of the user which gets the email."))))),Object(l.b)(O,{value:"example",mdxType:"TabItem"},Object(l.b)("pre",null,Object(l.b)("code",Object(n.a)({parentName:"pre"},{className:"language-pug"}),"| Hallo #{name},\n|\n| hier sind deine Zugangsdaten zum Tutor-Management-System:\n|\n| Nutzername: #{username}\n| Passwort: #{password}\n|\n| Mit freundlichen Gr\xfc\xdfen\n| TMS Admin\n")))),Object(l.b)("h3",{id:"scheinexam-results-template"},"Scheinexam Results Template"),Object(l.b)("p",null,Object(l.b)("strong",{parentName:"p"},"Filename: ",Object(l.b)("inlineCode",{parentName:"strong"},"scheinexam.pug"))),Object(l.b)(u,{defaultValue:"desc",values:[{label:"Description",value:"desc"},{label:"Example",value:"example"}],mdxType:"Tabs"},Object(l.b)(O,{value:"desc",mdxType:"TabItem"},Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Variable"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"scheinExamNo")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"Number")," - Number of the Scheinexam of this PDF.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"statuses")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"{ matriculationNo: string; state: PassedState }[]")," - Array containing the statuses of each student (with matriculation number) for the exam of the generated PDF. ",Object(l.b)("inlineCode",{parentName:"td"},"PassedState"),' can be one of the following values: "passed", "notPassed", "notAttended"'))))),Object(l.b)(O,{value:"example",mdxType:"TabItem"},Object(l.b)("pre",null,Object(l.b)("code",Object(n.a)({parentName:"pre"},{className:"language-pug"}),"h3(style='text-align: center') Scheinklausur Nr. #{scheinExamNo}\n\ntable\n  style(scoped).\n    td {\n      padding: 0.5em 1em;\n      font-family: 'Courier New', Courier, monospace;\n      line-height: 200%;\n    }\n\n  thead\n    tr\n      th Matrikelnummer\n      th Bestanden / Nicht bestanden\n\n  tbody\n    each status in statuses\n      tr\n        td #{status.matriculationNo}\n        if status.state === \"passed\"\n          td Bestanden\n        else if status.state === \"notPassed\"\n          td Nicht bestanden\n        else\n          td Abwesend\n")))),Object(l.b)("h3",{id:"scheinstatus-results-template"},"Scheinstatus Results Template"),Object(l.b)("p",null,Object(l.b)("strong",{parentName:"p"},"Filename: ",Object(l.b)("inlineCode",{parentName:"strong"},"scheinstatus.pug"))),Object(l.b)(u,{defaultValue:"desc",values:[{label:"Description",value:"desc"},{label:"Example",value:"example"}],mdxType:"Tabs"},Object(l.b)(O,{value:"desc",mdxType:"TabItem"},Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Variable"),Object(l.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"statuses")),Object(l.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(l.b)("inlineCode",{parentName:"td"},"{ matriculationNo: string; state: PassedState }[]"),' - Array containing the Schein statuses of each student (with matriculation number). PassedState can be one of the following values: "passed", "notPassed"'))))),Object(l.b)(O,{value:"example",mdxType:"TabItem"},Object(l.b)("pre",null,Object(l.b)("code",Object(n.a)({parentName:"pre"},{className:"language-pug"}),"h3(style='text-align: center') Scheinliste\n\ntable\n  style(scoped).\n    td {\n      padding: 0.5em 1em;\n      font-family: 'Courier New', Courier, monospace;\n      line-height: 200%;\n    }\n\n  thead\n    tr\n      th Matrikelnummer\n      th Bestanden / Nicht bestanden\n\n  tbody\n    each status in statuses\n      tr\n        td #{status.matriculationNo}\n        if status.state === \"passed\"\n          td Bestanden\n        else\n          td Nicht bestanden\n")))))}f.isMDXComponent=!0},95:function(e,t,a){"use strict";function n(e){var t,a,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(a=n(e[t]))&&(r&&(r+=" "),r+=a);else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}t.a=function(){for(var e,t,a=0,r="";a<arguments.length;)(e=arguments[a++])&&(t=n(e))&&(r&&(r+=" "),r+=t);return r}},96:function(e,t,a){"use strict";a.d(t,"a",(function(){return d})),a.d(t,"b",(function(){return u}));var n=a(0),r=a.n(n);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function b(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?b(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):b(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var c=r.a.createContext({}),s=function(e){var t=r.a.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=s(e.components);return r.a.createElement(c.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},p=r.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,b=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=s(a),p=n,u=d["".concat(b,".").concat(p)]||d[p]||m[p]||i;return a?r.a.createElement(u,l(l({ref:t},c),{},{components:a})):r.a.createElement(u,l({ref:t},c))}));function u(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,b=new Array(i);b[0]=p;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l.mdxType="string"==typeof e?e:n,b[1]=l;for(var c=2;c<i;c++)b[c]=a[c];return r.a.createElement.apply(null,b)}return r.a.createElement.apply(null,a)}p.displayName="MDXCreateElement"}}]);