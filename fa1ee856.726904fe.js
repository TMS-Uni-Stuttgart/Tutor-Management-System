(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{160:function(e,t,a){"use strict";a.r(t),t.default=a.p+"assets/files/docker-compose-6124264801b9aaa2c7de8a27250f12b1.yml"},83:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return i})),a.d(t,"metadata",(function(){return c})),a.d(t,"rightToc",(function(){return l})),a.d(t,"default",(function(){return s}));var n=a(2),r=a(6),o=(a(0),a(94)),i={id:"setup-env",title:"Setup Development Environment",sidebar_label:"Setup Environment"},c={unversionedId:"dev/setup-env",id:"dev/setup-env",isDocsHomePage:!1,title:"Setup Development Environment",description:"Fork the repository",source:"@site/docs\\dev\\setup-env.md",slug:"/dev/setup-env",permalink:"/Tutor-Management-System/docs/dev/setup-env",editUrl:"https://github.com/Dudrie/Tutor-Management-System/edit/add-documentation/docs/docs/dev/setup-env.md",version:"current",sidebar_label:"Setup Environment",sidebar:"dev",next:{title:"Fork Repository",permalink:"/Tutor-Management-System/docs/dev/fork"}},l=[{value:"Fork the repository",id:"fork-the-repository",children:[]},{value:"Requirements",id:"requirements",children:[]},{value:"Set up your environment",id:"set-up-your-environment",children:[]},{value:"Running development versions",id:"running-development-versions",children:[{value:"Visual Studio Code",id:"visual-studio-code",children:[]},{value:"Command line",id:"command-line",children:[]}]},{value:"Editor",id:"editor",children:[]},{value:"Docker Image",id:"docker-image",children:[{value:"Script parameters",id:"script-parameters",children:[]},{value:"Yarn commands",id:"yarn-commands",children:[]}]}],d={rightToc:l};function s(e){var t=e.components,i=Object(r.a)(e,["components"]);return Object(o.a)("wrapper",Object(n.a)({},d,i,{components:t,mdxType:"MDXLayout"}),Object(o.a)("h2",{id:"fork-the-repository"},"Fork the repository"),Object(o.a)("p",null,"First, you need to create a fork of the repository.\nThis can be done by clicking on the ",Object(o.a)("inlineCode",{parentName:"p"},"Fork"),"-Button on the upper right of the repository.\nMore information on forking can be found in the ",Object(o.a)("a",Object(n.a)({parentName:"p"},{href:"https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo"}),"official GitHub guides"),"."),Object(o.a)("p",null,"In addition you need to change a few things regarding the used actions inside the repository. Please follow the guide in the ",Object(o.a)("a",Object(n.a)({parentName:"p"},{href:"./fork"}),"Fork section")," of this documentation."),Object(o.a)("h2",{id:"requirements"},"Requirements"),Object(o.a)("p",null,"To get started you need a few development tools. The following are required to run and test your changes locally:"),Object(o.a)("ol",null,Object(o.a)("li",{parentName:"ol"},Object(o.a)("a",Object(n.a)({parentName:"li"},{href:"https://nodejs.org"}),"NodeJS 12.x.x"),Object(o.a)("strong",{parentName:"li"},"Note:")," NodeJS 10.x.x might work aswell but 12.x.x is the officially supported version."),Object(o.a)("li",{parentName:"ol"},"Package manager ",Object(o.a)("a",Object(n.a)({parentName:"li"},{href:"https://yarnpkg.com"}),"yarn"))),Object(o.a)("p",null,"While ",Object(o.a)("a",Object(n.a)({parentName:"p"},{href:"https://docs.docker.com/install/"}),"Docker")," is not needed it helps you to set up your environment more easily. It's mostly used to spin up a Mongo database on your system in closely to no time. If you don't use Docker you need to provide an alternative MongoDB database (",Object(o.a)("em",{parentName:"p"},"Note: Technically any ",Object(o.a)("inlineCode",{parentName:"em"},"mongoose")," compatible database should work aswell."),") and to change the configuration in ",Object(o.a)("inlineCode",{parentName:"p"},"server/config/development.yml"),"."),Object(o.a)("div",{className:"admonition admonition-warning alert alert--danger"},Object(o.a)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(o.a)("h5",{parentName:"div"},Object(o.a)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(o.a)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(o.a)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"})))),"warning")),Object(o.a)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(o.a)("p",{parentName:"div"},"Make sure that you do ",Object(o.a)("strong",{parentName:"p"},"NOT")," commit & push any sensitive information (ie authentication data) to the repository!"))),Object(o.a)("h2",{id:"set-up-your-environment"},"Set up your environment"),Object(o.a)("p",null,"After pulling your fork and creating a new branch for your issue you have to setup the development environment first."),Object(o.a)("ol",null,Object(o.a)("li",{parentName:"ol"},Object(o.a)("p",{parentName:"li"},Object(o.a)("strong",{parentName:"p"},"Navigate")," into the repository folder install all needed npm packages by running the following command (",Object(o.a)("em",{parentName:"p"},"Please note that this might take some time for the first time installing."),"):"),Object(o.a)("pre",{parentName:"li"},Object(o.a)("code",Object(n.a)({parentName:"pre"},{className:"language-sh"}),"yarn\n"))),Object(o.a)("li",{parentName:"ol"},Object(o.a)("p",{parentName:"li"},Object(o.a)("strong",{parentName:"p"},"Download")," the ",Object(o.a)("a",{target:"_blank",href:a(160).default},"docker-compose.yml")," for the development. It contains two services: ",Object(o.a)("inlineCode",{parentName:"p"},"mongo")," and ",Object(o.a)("inlineCode",{parentName:"p"},"mongo-express"),".")),Object(o.a)("li",{parentName:"ol"},Object(o.a)("p",{parentName:"li"},Object(o.a)("strong",{parentName:"p"},"Run")," either of these two commands depending on your needs:"),Object(o.a)("ol",{parentName:"li"},Object(o.a)("li",{parentName:"ol"},Object(o.a)("p",{parentName:"li"},"Just set up a mongo database:"),Object(o.a)("pre",{parentName:"li"},Object(o.a)("code",Object(n.a)({parentName:"pre"},{className:"language-sh"}),"docker-compose up -d mongo\n"))),Object(o.a)("li",{parentName:"ol"},Object(o.a)("p",{parentName:"li"},"If you want to also get an administrative board for your local database:"),Object(o.a)("pre",{parentName:"li"},Object(o.a)("code",Object(n.a)({parentName:"pre"},{className:"language-sh"}),"docker-compose up -d mongo mongo-express\n")),Object(o.a)("p",{parentName:"li"},"This starts the MongoDB aswell as a webinterface which connects to it. To access this interface visit ",Object(o.a)("a",Object(n.a)({parentName:"p"},{href:"localhost:8081"}),"localhost:8081"),"."))))),Object(o.a)("p",null,Object(o.a)("strong",{parentName:"p"},"Note:")," If you want to bring your own MongoDB you can do so. However, you have to make sure to change the ",Object(o.a)("inlineCode",{parentName:"p"},"server/config/development.yml")," to include the configuration of your MongoDB."),Object(o.a)("div",{className:"admonition admonition-warning alert alert--danger"},Object(o.a)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(o.a)("h5",{parentName:"div"},Object(o.a)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(o.a)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(o.a)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"})))),"warning")),Object(o.a)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(o.a)("p",{parentName:"div"},"Take care to ",Object(o.a)("strong",{parentName:"p"},"NOT")," commit & push files which include credentials of yours!"))),Object(o.a)("h2",{id:"running-development-versions"},"Running development versions"),Object(o.a)("h3",{id:"visual-studio-code"},"Visual Studio Code"),Object(o.a)("p",null,"If you use Visual Studio Code (short 'Code') starting the development servers is easy. You can pick one of the preconfigured launch options listed below. Both servers (frontend & backend) have hot-reloading preconfigured."),Object(o.a)("ul",null,Object(o.a)("li",{parentName:"ul"},Object(o.a)("p",{parentName:"li"},Object(o.a)("inlineCode",{parentName:"p"},"Launch NodeJS server"),": This starts the development version of the backend. During start up the Code debugger will be automatically attached to the running server.")),Object(o.a)("li",{parentName:"ul"},Object(o.a)("p",{parentName:"li"},Object(o.a)("inlineCode",{parentName:"p"},"Launch NodeJS server & client"),": This starts both development servers (frontend & backend - in this order). The Code debugger will be attached to the backend.")),Object(o.a)("li",{parentName:"ul"},Object(o.a)("p",{parentName:"li"},Object(o.a)("inlineCode",{parentName:"p"},"Launch Chrome"),": ",Object(o.a)("em",{parentName:"p"},"Needs a running frontend server!")," Will open a seperate Chrome instance and attach a Code debugger to the running frontend server."),Object(o.a)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-important alert alert--info"}),Object(o.a)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(o.a)("h5",{parentName:"div"},Object(o.a)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(o.a)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(o.a)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"Required extension")),Object(o.a)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(o.a)("p",{parentName:"div"},"The ",Object(o.a)("a",Object(n.a)({parentName:"p"},{href:"https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome"}),"Debugger for Chrome")," extension is required."))))),Object(o.a)("p",null,'Please note: Sometimes starting the server initially takes longer than 10s resulting in a "timeout error" appearing in Code. However, you can configure the debugger in Code to auto attach to a running node process and it will connect after the server started.'),Object(o.a)("h3",{id:"command-line"},"Command line"),Object(o.a)("p",null,"Both servers can be run manually from the command line using the ",Object(o.a)("inlineCode",{parentName:"p"},"yarn start")," command in the respective folder (",Object(o.a)("inlineCode",{parentName:"p"},"client/")," or ",Object(o.a)("inlineCode",{parentName:"p"},"server/"),") or using the command ",Object(o.a)("inlineCode",{parentName:"p"},"yarn start:server")," and ",Object(o.a)("inlineCode",{parentName:"p"},"yarn start:client")," in the root folder."),Object(o.a)("h2",{id:"editor"},"Editor"),Object(o.a)("p",null,"The choice which editor to use is up to you. However the editor must have TypeScript support to be able to properly assist you during development."),Object(o.a)("p",null,"Below you find two of all possible choices:"),Object(o.a)("ol",null,Object(o.a)("li",{parentName:"ol"},Object(o.a)("p",{parentName:"li"},Object(o.a)("a",Object(n.a)({parentName:"p"},{href:"https://code.visualstudio.com/"}),"Visual Studio Code"),":\n(",Object(o.a)("strong",{parentName:"p"},"Recommended"),") The editor from Microsoft is the recommended editor due to the fact that this repository contains the configuration files for this editor. These configurations include for example the launch configurations for the development servers.")),Object(o.a)("li",{parentName:"ol"},Object(o.a)("p",{parentName:"li"},Object(o.a)("a",Object(n.a)({parentName:"p"},{href:"https://atom.io/"}),"Atom"),":\nThe editor from GitHub is another editor which fully supports TypeScript. You can choose this editor, however, there aren't any configurations files for the atom editor at this moment available in this repository (you can include some in your PR if you want)."))),Object(o.a)("h2",{id:"docker-image"},"Docker Image"),Object(o.a)("p",null,"To build a Docker image one can execute the ",Object(o.a)("inlineCode",{parentName:"p"},"./build-docker-image.ts")," file. This can also be achieved by executing on of the following yarn commands: ",Object(o.a)("inlineCode",{parentName:"p"},"docker:build")," and ",Object(o.a)("inlineCode",{parentName:"p"},"docker:build:pre"),". For more information see the section below."),Object(o.a)("h3",{id:"script-parameters"},"Script parameters"),Object(o.a)("p",null,"The ",Object(o.a)("inlineCode",{parentName:"p"},"build-docker-image.ts")," script takes in the following parameters but all are ",Object(o.a)("em",{parentName:"p"},"optional"),". If the parameter itself needs a value the value has to be put after a ",Object(o.a)("inlineCode",{parentName:"p"},"=")," (ie ",Object(o.a)("inlineCode",{parentName:"p"},"--version=2.0.0"),'). The image will be tagged with "dudrie/tutor-management-system" as a name followed by the version from the root ',Object(o.a)("inlineCode",{parentName:"p"},"package.json")," by default. Afterwards the image will get bundled into a ",Object(o.a)("inlineCode",{parentName:"p"},".tar")," file by default."),Object(o.a)("table",null,Object(o.a)("thead",{parentName:"table"},Object(o.a)("tr",{parentName:"thead"},Object(o.a)("th",Object(n.a)({parentName:"tr"},{align:null}),"Parameter"),Object(o.a)("th",Object(n.a)({parentName:"tr"},{align:null}),"Short"),Object(o.a)("th",Object(n.a)({parentName:"tr"},{align:null}),"Description"))),Object(o.a)("tbody",{parentName:"table"},Object(o.a)("tr",{parentName:"tbody"},Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(o.a)("inlineCode",{parentName:"td"},"--no-version-in-tar-name")),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),"-"),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),"The generated ",Object(o.a)("inlineCode",{parentName:"td"},".tar")," file will ",Object(o.a)("strong",{parentName:"td"},"not")," contain the version of the image tag.")),Object(o.a)("tr",{parentName:"tbody"},Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(o.a)("inlineCode",{parentName:"td"},"--pre")),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),"-"),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),"If provided the image tag will get a ",Object(o.a)("inlineCode",{parentName:"td"},"-pre"),' suffix after the version ("dudrie/tutor-management-system:2.0.1-pre")')),Object(o.a)("tr",{parentName:"tbody"},Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(o.a)("inlineCode",{parentName:"td"},"--skip-bundle")),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),"-"),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),"The image will not get bundled into ",Object(o.a)("inlineCode",{parentName:"td"},".tar")," file.")),Object(o.a)("tr",{parentName:"tbody"},Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(o.a)("inlineCode",{parentName:"td"},"--version=")),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(o.a)("inlineCode",{parentName:"td"},"-v=")),Object(o.a)("td",Object(n.a)({parentName:"tr"},{align:null}),"Overrides the version used for the image tag. Must be followed by the semantic version which should be used (ie ",Object(o.a)("inlineCode",{parentName:"td"},"-v=2.0.1"),")")))),Object(o.a)("h3",{id:"yarn-commands"},"Yarn commands"),Object(o.a)("h4",{id:"dockerbuild"},Object(o.a)("inlineCode",{parentName:"h4"},"docker:build")),Object(o.a)("p",null,"This will run two commands in succession: First ",Object(o.a)("inlineCode",{parentName:"p"},"yarn version")," which lets one update the version of the TMS. Afterwards the ",Object(o.a)("inlineCode",{parentName:"p"},"build-docker-image.ts")," script gets executed without any additional parameters. One can specify all of the parameters above for this yarn command aswell."),Object(o.a)("h4",{id:"dockerbuildpre"},Object(o.a)("inlineCode",{parentName:"h4"},"docker:build:pre")),Object(o.a)("p",null,"This will run two commands in succession: First ",Object(o.a)("inlineCode",{parentName:"p"},"yarn version")," which lets one update the version of the TMS. Afterwards the ",Object(o.a)("inlineCode",{parentName:"p"},"build-docker-image.ts")," script gets executed with the ",Object(o.a)("inlineCode",{parentName:"p"},"--pre")," and ",Object(o.a)("inlineCode",{parentName:"p"},"--skip-bundle")," parameters provided (see above). Additional parameters can be provided aswell."))}s.isMDXComponent=!0},94:function(e,t,a){"use strict";a.d(t,"a",(function(){return b}));var n=a(0),r=a.n(n);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function c(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var d=r.a.createContext({}),s=function(e){var t=r.a.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):c(c({},t),e)),a},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),m=s(a),b=n,u=m["".concat(i,".").concat(b)]||m[b]||p[b]||o;return a?r.a.createElement(u,c(c({ref:t},d),{},{components:a})):r.a.createElement(u,c({ref:t},d))}));function b(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,i=new Array(o);i[0]=m;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var d=2;d<o;d++)i[d]=a[d];return r.a.createElement.apply(null,i)}return r.a.createElement.apply(null,a)}m.displayName="MDXCreateElement"}}]);