import{c as E,M as F,i as G,u as A,P as H,a as D,b as K,L as U}from"./proxy-Ch8adKn6.js";import{r as n,j as b}from"./index-6FVLW7KZ.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=E("GitBranch",[["line",{x1:"6",x2:"6",y1:"3",y2:"15",key:"17qcm7"}],["circle",{cx:"18",cy:"6",r:"3",key:"1h7g24"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["path",{d:"M18 9a9 9 0 0 1-9 9",key:"n2h4wq"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=E("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=E("Layers",[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=E("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=E("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=E("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);function S(e,r){if(typeof e=="function")return e(r);e!=null&&(e.current=r)}function V(...e){return r=>{let t=!1;const o=e.map(l=>{const c=S(l,r);return!t&&typeof c=="function"&&(t=!0),c});if(t)return()=>{for(let l=0;l<o.length;l++){const c=o[l];typeof c=="function"?c():S(e[l],null)}}}}function W(...e){return n.useCallback(V(...e),e)}class T extends n.Component{getSnapshotBeforeUpdate(r){const t=this.props.childRef.current;if(G(t)&&r.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const o=t.offsetParent,l=G(o)&&o.offsetWidth||0,c=G(o)&&o.offsetHeight||0,f=getComputedStyle(t),s=this.props.sizeRef.current;s.height=parseFloat(f.height),s.width=parseFloat(f.width),s.top=t.offsetTop,s.left=t.offsetLeft,s.right=l-s.width-s.left,s.bottom=c-s.height-s.top}return null}componentDidUpdate(){}render(){return this.props.children}}function X({children:e,isPresent:r,anchorX:t,anchorY:o,root:l,pop:c}){var a;const f=n.useId(),s=n.useRef(null),M=n.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:w}=n.useContext(F),u=((a=e.props)==null?void 0:a.ref)??(e==null?void 0:e.ref),g=W(s,u);return n.useInsertionEffect(()=>{const{width:p,height:h,top:x,left:C,right:L,bottom:j}=M.current;if(r||c===!1||!s.current||!p||!h)return;const z=t==="left"?`left: ${C}`:`right: ${L}`,m=o==="bottom"?`bottom: ${j}`:`top: ${x}`;s.current.dataset.motionPopId=f;const y=document.createElement("style");w&&(y.nonce=w);const k=l??document.head;return k.appendChild(y),y.sheet&&y.sheet.insertRule(`
          [data-motion-pop-id="${f}"] {
            position: absolute !important;
            width: ${p}px !important;
            height: ${h}px !important;
            ${z}px !important;
            ${m}px !important;
          }
        `),()=>{var R;(R=s.current)==null||R.removeAttribute("data-motion-pop-id"),k.contains(y)&&k.removeChild(y)}},[r]),b.jsx(T,{isPresent:r,childRef:s,sizeRef:M,pop:c,children:c===!1?e:n.cloneElement(e,{ref:g})})}const Y=({children:e,initial:r,isPresent:t,onExitComplete:o,custom:l,presenceAffectsLayout:c,mode:f,anchorX:s,anchorY:M,root:w})=>{const u=A(_),g=n.useId();let a=!0,p=n.useMemo(()=>(a=!1,{id:g,initial:r,isPresent:t,custom:l,onExitComplete:h=>{u.set(h,!0);for(const x of u.values())if(!x)return;o&&o()},register:h=>(u.set(h,!1),()=>u.delete(h))}),[t,u,o]);return c&&a&&(p={...p}),n.useMemo(()=>{u.forEach((h,x)=>u.set(x,!1))},[t]),n.useEffect(()=>{!t&&!u.size&&o&&o()},[t]),e=b.jsx(X,{pop:f==="popLayout",isPresent:t,anchorX:s,anchorY:M,root:w,children:e}),b.jsx(H.Provider,{value:p,children:e})};function _(){return new Map}const v=e=>e.key||"";function q(e){const r=[];return n.Children.forEach(e,t=>{n.isValidElement(t)&&r.push(t)}),r}const se=({children:e,custom:r,initial:t=!0,onExitComplete:o,presenceAffectsLayout:l=!0,mode:c="sync",propagate:f=!1,anchorX:s="left",anchorY:M="top",root:w})=>{const[u,g]=D(f),a=n.useMemo(()=>q(e),[e]),p=f&&!u?[]:a.map(v),h=n.useRef(!0),x=n.useRef(a),C=A(()=>new Map),L=n.useRef(new Set),[j,z]=n.useState(a),[m,y]=n.useState(a);K(()=>{h.current=!1,x.current=a;for(let d=0;d<m.length;d++){const i=v(m[d]);p.includes(i)?(C.delete(i),L.current.delete(i)):C.get(i)!==!0&&C.set(i,!1)}},[m,p.length,p.join("-")]);const k=[];if(a!==j){let d=[...a];for(let i=0;i<m.length;i++){const P=m[i],$=v(P);p.includes($)||(d.splice(i,0,P),k.push(P))}return c==="wait"&&k.length&&(d=k),y(q(d)),z(a),null}const{forceRender:R}=n.useContext(U);return b.jsx(b.Fragment,{children:m.map(d=>{const i=v(d),P=f&&!u?!1:a===m||p.includes(i),$=()=>{if(L.current.has(i))return;if(C.has(i))L.current.add(i),C.set(i,!0);else return;let I=!0;C.forEach(B=>{B||(I=!1)}),I&&(R==null||R(),y(x.current),f&&(g==null||g()),o&&o())};return b.jsx(Y,{isPresent:P,initial:!h.current||t?void 0:!1,custom:r,presenceAffectsLayout:l,mode:c,root:w,onExitComplete:P?void 0:$,anchorX:s,anchorY:M,children:d},i)})})};export{se as A,Q as G,ee as L,te as M,ne as P,O as a,Z as b};
