import{s as r}from"./Bsf8tLe8.js";import{Y as a,o as n,c as s,ae as i,af as p}from"./Bx_KFa3E.js";import{s as e}from"./jc0MLXVe.js";import"./DSEfUiDR.js";var u=`
    .p-radiobutton-group {
        display: inline-flex;
    }
`,d={root:"p-radiobutton-group p-component"},m=a.extend({name:"radiobuttongroup",style:u,classes:d}),c={name:"BaseRadioButtonGroup",extends:r,style:m,provide:function(){return{$pcRadioButtonGroup:this,$parentInstance:this}}},l={name:"RadioButtonGroup",extends:c,inheritAttrs:!1,data:function(){return{groupName:this.name}},watch:{name:function(o){this.groupName=o||e("radiobutton-group-")}},mounted:function(){this.groupName=this.groupName||e("radiobutton-group-")}};function f(t,o,g,h,$,v){return n(),s("div",p({class:t.cx("root")},t.ptmi("root")),[i(t.$slots,"default")],16)}l.render=f;export{l as default};
