(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{62:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return i})),a.d(t,"metadata",(function(){return c})),a.d(t,"rightToc",(function(){return b})),a.d(t,"default",(function(){return s}));var n=a(2),o=a(6),r=(a(0),a(74)),i={id:"installation",title:"Installation",sidebar_label:"Installation"},c={unversionedId:"setup/installation",id:"setup/installation",isDocsHomePage:!1,title:"Installation",description:"Requirements",source:"@site/docs\\setup\\installation.md",slug:"/setup/installation",permalink:"/Tutor-Management-System/docs/setup/installation",version:"current",sidebar_label:"Installation",sidebar:"someSidebar",next:{title:"Configuration",permalink:"/Tutor-Management-System/docs/setup/configuration"}},b=[{value:"Requirements",id:"requirements",children:[]},{value:"Installation",id:"installation",children:[{value:"Information about <code>sudo</code>",id:"information-about-sudo",children:[]},{value:"Step-by-Step",id:"step-by-step",children:[]},{value:"Use <code>docker</code>",id:"use-docker",children:[]}]},{value:"TLS / HTTPS",id:"tls--https",children:[]}],p={rightToc:b};function s(e){var t=e.components,i=Object(o.a)(e,["components"]);return Object(r.b)("wrapper",Object(n.a)({},p,i,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h2",{id:"requirements"},"Requirements"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("a",Object(n.a)({parentName:"li"},{href:"https://docs.docker.com/install/"}),"Docker"),": The provided container image is a docker image for Linux containers therefore you need Docker to be able to run it."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("a",Object(n.a)({parentName:"li"},{href:"https://docs.docker.com/compose/install/"}),"Docker-Compose"),": While technically not required it helps you to get up the container(s) more easily.")),Object(r.b)("h2",{id:"installation"},"Installation"),Object(r.b)("h3",{id:"information-about-sudo"},"Information about ",Object(r.b)("inlineCode",{parentName:"h3"},"sudo")),Object(r.b)("p",null,"If you need to run docker (and docker-compose) with sudo right you have to prefix all following ",Object(r.b)("inlineCode",{parentName:"p"},"docker-compose")," and ",Object(r.b)("inlineCode",{parentName:"p"},"docker")," commands with ",Object(r.b)("inlineCode",{parentName:"p"},"sudo"),".\nFurthermore keep in mind to add the ",Object(r.b)("inlineCode",{parentName:"p"},"-E")," flag to the ",Object(r.b)("inlineCode",{parentName:"p"},"sudo")," command if the docker or docker-compose rely on environment variables so those get passed down, for example:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-shell"}),"sudo -E docker-compose up\n")),Object(r.b)("h3",{id:"step-by-step"},"Step-by-Step"),Object(r.b)("p",null,"This Step-by-Step guide uses docker-compose to set up the containers. You can find a sample ",Object(r.b)("a",{target:"_blank",href:a(93).default},"docker-compose.yml file here"),". All steps marked with ",Object(r.b)("em",{parentName:"p"},"(optional)")," can safely be skipped."),Object(r.b)("p",null,"If you want to use ",Object(r.b)("inlineCode",{parentName:"p"},"docker")," commands instead of docker-compose you can find a list of those ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"#commands"}),"below")," aswell."),Object(r.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"If you are on a machine that requires manually starting the docker engine do so now."))),Object(r.b)("ol",null,Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Download"),' all configuration files as stated in the "Configuration" section of the ',Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/Dudrie/Tutor-Management-System/releases/latest"}),"latest release")," (or the release you want to use).")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Unzip")," the downloaded configuration files into a folder of your choice. The Step-by-Step guide assumes it is called ",Object(r.b)("inlineCode",{parentName:"p"},"config/"),"."),Object(r.b)("p",{parentName:"li"},"Those files contain a configuration file and some template files. For more information read the ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"./configuration/"}),"Configuration")," page on this documentation."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-tip alert alert--success"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"})))),"tip")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"All important adjustments you have to make are described here as well.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Download")," the ",Object(r.b)("a",{target:"_blank",href:a(93).default},"docker-compose.yml")," from this documentation.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Adjust")," the ",Object(r.b)("inlineCode",{parentName:"p"},"docker-compose.yml")," file:"),Object(r.b)("ol",{parentName:"li"},Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Replace")," ",Object(r.b)("inlineCode",{parentName:"p"},"<version>")," in the ",Object(r.b)("inlineCode",{parentName:"p"},"tms-server")," service with the version you want to use. You can also use ",Object(r.b)("inlineCode",{parentName:"p"},"latest")," as a tag but this makes updating the version harder in future."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"Available versions")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"You can find a list of the available versions ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/users/Dudrie/packages/container/tutor-management-system/versions"}),"here"),".")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Replace")," ",Object(r.b)("inlineCode",{parentName:"p"},"<path-to-CONFIG>")," with the ",Object(r.b)("em",{parentName:"p"},"relative")," path to the ",Object(r.b)("inlineCode",{parentName:"p"},"config/")," folder (relative to the ",Object(r.b)("inlineCode",{parentName:"p"},"docker-compose.yml"),"). Leave the destination side ",Object(r.b)("em",{parentName:"p"},"untouched"),"!")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Replace")," ",Object(r.b)("inlineCode",{parentName:"p"},"<path-to-DB-FOLDER>")," with the ",Object(r.b)("em",{parentName:"p"},"relative")," path (relative to the ",Object(r.b)("inlineCode",{parentName:"p"},"docker-compose.yml"),") to the folder you want to store your database data in."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-caution alert alert--warning"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Make sure the path you enter is ",Object(r.b)("strong",{parentName:"p"},"writeable"),"! If it is not (or you omit volume from the mongo container) the database data will ",Object(r.b)("strong",{parentName:"p"},"NOT")," be persistent on the host and therefore can be lost if the container gets recreated!")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Add")," the nginx service as described in the ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"./nginx/"}),"Setup with nginx section")," of this documentation. Nginx (or a similar proxy) is the recommand way to setup HTTPS for the Tutor-Management-System."),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Please note that the tms-server container does ",Object(r.b)("strong",{parentName:"p"},"not")," need to expose the port to the public. The nginx container and the tms-server container just need to be in the same docker network (see below)."))),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-important alert alert--info"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"Use existing nginx")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"If you already have a running nginx or want to use a different proxy you can skip this step. However, it is highly recommended that you properly setup TSL/HTTPS for the TMS in either way.")))))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("em",{parentName:"p"},"(optional)")," ",Object(r.b)("strong",{parentName:"p"},"Adjust")," the ",Object(r.b)("inlineCode",{parentName:"p"},"production.yml")," configuration file. You can find more information about the individual entries on the ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"./configuration#applicationconfiguration"}),"Configuration page"),".")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("em",{parentName:"p"},"(optional)")," ",Object(r.b)("strong",{parentName:"p"},"Adjust")," the pug templates. You can find more information about the templates and their placeholders on the ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"./configuration#pug-templates"}),"Configuration page"),".")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Start")," all services. This will create all containers of the services on the first start."),Object(r.b)("ol",{parentName:"li"},Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Open")," a terminal and navigate to the folder containing the ",Object(r.b)("inlineCode",{parentName:"p"},"docker-compose.yml"),".")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Export")," the following environment variables in the terminal:"),Object(r.b)("table",{parentName:"li"},Object(r.b)("thead",{parentName:"table"},Object(r.b)("tr",{parentName:"thead"},Object(r.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Env-Variable"),Object(r.b)("th",Object(n.a)({parentName:"tr"},{align:null}),"Purpose"))),Object(r.b)("tbody",{parentName:"table"},Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(r.b)("inlineCode",{parentName:"td"},"MONGO_USER")),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:null}),"Username used to authenticate on the MongoDB.")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(r.b)("inlineCode",{parentName:"td"},"MONGO_PASSWORD")),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:null}),"Password used to authenticate on the MongoDB.")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:null}),Object(r.b)("inlineCode",{parentName:"td"},"TMS_SECRET")),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:null}),"Secret to use to encrypt and decrypt sensitive database entries. ",Object(r.b)("strong",{parentName:"td"},"Keep it safe!"))))),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-caution alert alert--warning"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"They must be ",Object(r.b)("strong",{parentName:"p"},"exported")," or else the docker-compose child process will not have access to them.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Run")," the following command to create and start all the containers:"),Object(r.b)("pre",{parentName:"li"},Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-shell"}),"sudo -E docker-compose up\n")),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-note alert alert--secondary"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Remember to put in the ",Object(r.b)("inlineCode",{parentName:"p"},"-E")," parameter so your environment variables get passed down to the process running docker-compose.")))),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Check")," that the presented logs do ",Object(r.b)("strong",{parentName:"p"},"NOT")," contain any errors and that all services start successfully.")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("em",{parentName:"p"},"(optional)")," ",Object(r.b)("strong",{parentName:"p"},"Stop")," all containers by quitting the process (",Object(r.b)("inlineCode",{parentName:"p"},"Ctrl + C"),").")),Object(r.b)("li",{parentName:"ol"},Object(r.b)("p",{parentName:"li"},Object(r.b)("em",{parentName:"p"},"(optional)")," ",Object(r.b)("strong",{parentName:"p"},"Restart")," all containers with the following command (please note the additional ",Object(r.b)("inlineCode",{parentName:"p"},"-d"),"). This time the terminal will not hook into the container logs."),Object(r.b)("pre",{parentName:"li"},Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-shell"}),"sudo -E docker-compose up -d\n")))))),Object(r.b)("h3",{id:"use-docker"},"Use ",Object(r.b)("inlineCode",{parentName:"h3"},"docker")),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Create")," a network for the MongoDB and the TMS containers:"),Object(r.b)("pre",{parentName:"li"},Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-shell"}),"docker network create tms_db\n"))),Object(r.b)("li",{parentName:"ul"},Object(r.b)("p",{parentName:"li"},Object(r.b)("em",{parentName:"p"},"(optional)")," ",Object(r.b)("strong",{parentName:"p"},"Create")," a network for the nginx and the TMS containers (if not already done in the Setup with nginx part):"),Object(r.b)("pre",{parentName:"li"},Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-shell"}),"docker network create proxy_network\n"))),Object(r.b)("li",{parentName:"ul"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Create")," the MongoDB container and starting it:"),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-caution alert alert--warning"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Remember to replace ",Object(r.b)("inlineCode",{parentName:"p"},"<path-to-DB-FOLDER>")," with the ",Object(r.b)("strong",{parentName:"p"},"absolute")," path to the folder in which you want the database data to be stored in."))),Object(r.b)("pre",{parentName:"li"},Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-shell"}),"docker run --name mongo --restart always --net tms_db -e MONGO_INITDB_ROOT_USERNAME=$MONGO_USER -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD -v <path-to-DB-FOLDER>:/data/db -d mongo\n")))),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("p",{parentName:"li"},Object(r.b)("strong",{parentName:"p"},"Create")," the TMS container and starting it:"),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-caution alert alert--warning"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"Remember to replace ",Object(r.b)("inlineCode",{parentName:"p"},"<path-to-CONFIG>")," with the ",Object(r.b)("strong",{parentName:"p"},"absolute")," path to the folder containing the config files for the TMS."))),Object(r.b)("div",Object(n.a)({parentName:"li"},{className:"admonition admonition-tip alert alert--success"}),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(r.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(r.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"})))),"tip")),Object(r.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(r.b)("p",{parentName:"div"},"If you do not want to use the ",Object(r.b)("inlineCode",{parentName:"p"},"proxy_network")," you can remove the ",Object(r.b)("inlineCode",{parentName:"p"},"--net proxy_network")," part. But keep in mind that the nginx container and the TMS container will not be in the same network afterwards."))),Object(r.b)("pre",{parentName:"li"},Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-shell"}),"docker run --name tms-server --restart on-failure:1 --net tms_db --net proxy_network -e TMS_MONGODB_USER=$MONGO_USER -e TMS_MONGODB_PW=$MONGO_PASSWORD -e TMS_SECRET=$TMS_SECRET -v <path-to-CONFING>:/tms/server/config ghcr.io/dudrie/tutor-management-system\n")))),Object(r.b)("h2",{id:"tls--https"},"TLS / HTTPS"),Object(r.b)("p",null,"The TMS server itself does NOT support TLS / HTTPS. The reason why TLS did not (and still does not) have a high priority is simple: Most servers already use a proxy (like ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"https://www.nginx.com/"}),"nginx"),") which handle SSL for all services running on the server. Furthermore, using a proxy is the recommended way of using an express server according to the ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"http://expressjs.com/en/advanced/best-practice-security.html#use-tls"}),"express documentation"),"."),Object(r.b)("p",null,"If your server does not already use a proxy you should consider adding one. For more information on how to setup TMS with nginx see the ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"./nginx/"}),"Setup with Nginx guide"),"."),Object(r.b)("p",null,"However if you cannot (or do not want to) use a proxy on your server you can add the TLS support for the NestJS in a forked version of the repository following the ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"https://docs.nestjs.com/faq/multiple-servers#https"}),"NestJS HTTPS guide"),"."))}s.isMDXComponent=!0},74:function(e,t,a){"use strict";a.d(t,"a",(function(){return l})),a.d(t,"b",(function(){return O}));var n=a(0),o=a.n(n);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function c(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function b(e,t){if(null==e)return{};var a,n,o=function(e,t){if(null==e)return{};var a,n,o={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(o[a]=e[a]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(o[a]=e[a])}return o}var p=o.a.createContext({}),s=function(e){var t=o.a.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):c(c({},t),e)),a},l=function(e){var t=s(e.components);return o.a.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,r=e.originalType,i=e.parentName,p=b(e,["components","mdxType","originalType","parentName"]),l=s(a),d=n,O=l["".concat(i,".").concat(d)]||l[d]||m[d]||r;return a?o.a.createElement(O,c(c({ref:t},p),{},{components:a})):o.a.createElement(O,c({ref:t},p))}));function O(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=a.length,i=new Array(r);i[0]=d;var c={};for(var b in t)hasOwnProperty.call(t,b)&&(c[b]=t[b]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var p=2;p<r;p++)i[p]=a[p];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,a)}d.displayName="MDXCreateElement"},93:function(e,t,a){"use strict";a.r(t),t.default=a.p+"assets/files/docker-compose-de698e864cf9f70716b67e5e0b0f3b5c.yml"}}]);