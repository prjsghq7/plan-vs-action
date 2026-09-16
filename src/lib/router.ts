import {useEffect,useState} from 'react'

export type Route=
 | {name:'login'}
 | {name:'signup'}
 | {name:'verify-email'}
 | {name:'reset-password'}
 | {name:'account'}
 | {name:'dashboard'}
 | {name:'today'}
 | {name:'plans'}
 | {name:'plan-new'}
 | {name:'plan-detail';planId:string}
 | {name:'action';planId:string;taskId?:string}
 | {name:'review';planId:string}
 | {name:'not-found'}

export function parseRoute(pathname:string):Route{
  const path=pathname==='/'?pathname:pathname.replace(/\/+$/,'')
  if(path==='/login')return{name:'login'}
  if(path==='/signup')return{name:'signup'}
 if(path==='/verify-email')return{name:'verify-email'}
 if(path==='/reset-password')return{name:'reset-password'}
 if(path==='/account')return{name:'account'}
  if(path==='/'||path==='/dashboard')return{name:'dashboard'}
  if(path==='/today')return{name:'today'}
  if(path==='/plans')return{name:'plans'}
  if(path==='/plans/new')return{name:'plan-new'}
  let match=path.match(/^\/plans\/([^/]+)$/)
  if(match)return{name:'plan-detail',planId:decodeURIComponent(match[1])}
  match=path.match(/^\/plans\/([^/]+)\/action$/)
  if(match)return{name:'action',planId:decodeURIComponent(match[1])}
  match=path.match(/^\/plans\/([^/]+)\/tasks\/([^/]+)\/action$/)
  if(match)return{name:'action',planId:decodeURIComponent(match[1]),taskId:decodeURIComponent(match[2])}
  match=path.match(/^\/plans\/([^/]+)\/review$/)
  if(match)return{name:'review',planId:decodeURIComponent(match[1])}
  return{name:'not-found'}
}

export function navigate(path:string,replace=false){history[replace?'replaceState':'pushState']({},'',path);window.dispatchEvent(new PopStateEvent('popstate'))}
export function useRoute(){const [route,setRoute]=useState(()=>parseRoute(location.pathname));useEffect(()=>{const update=()=>setRoute(parseRoute(location.pathname));addEventListener('popstate',update);return()=>removeEventListener('popstate',update)},[]);return route}
