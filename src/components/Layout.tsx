import {useEffect,useRef,useState,type ReactNode} from 'react'
import type {Route} from '../lib/router'
import {navigate} from '../lib/router'
import {api,SESSION_EXPIRED_EVENT} from '../lib/api'

type Props={route:Route;children:ReactNode;session:{name:string;email:string;expiresAt:string}|null}
type IconName='home'|'dashboard'|'today'|'plans'|'add'|'download'|'logout'|'settings'|'refresh'

const STORAGE_KEY='plan-vs-action:sidebar-collapsed'

function NavIcon({name}:{name:IconName}){
 const paths={
  home:<><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></>,
  dashboard:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  today:<><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  plans:<><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>,
  add:<><path d="M12 5v14M5 12h14"/></>,
  download:<><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 21h14"/></>,
  logout:<><path d="M10 5H5v14h5"/><path d="m14 8 4 4-4 4M18 12H9"/></>,
  settings:<><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/></>,
  refresh:<><path d="M21 12a9 9 0 1 1-3.18-6.86L21 8"/><path d="M21 3v5h-5"/></>
 } satisfies Record<IconName,ReactNode>
 return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export function Layout({route,children,session}:Props){
 const [collapsed,setCollapsed]=useState(()=>localStorage.getItem(STORAGE_KEY)==='true')
 const [mobileOpen,setMobileOpen]=useState(false)
 const scrollRef=useRef<HTMLDivElement>(null)
 const mainRef=useRef<HTMLElement>(null)
 const section=route.name==='dashboard'?'dashboard':route.name==='today'?'today':route.name==='account'?'account':route.name==='not-found'?'':'plans'

 useEffect(()=>{
  scrollRef.current?.scrollTo({top:0})
  mainRef.current?.focus({preventScroll:true})
 },[route])

 const move=(path:string)=>{navigate(path);setMobileOpen(false)}
 const toggle=()=>setCollapsed(value=>{const next=!value;localStorage.setItem(STORAGE_KEY,String(next));return next})
 const logout=async()=>{await api('/api/auth/logout',{method:'POST'});navigate('/login',true)}
 const [remaining,setRemaining]=useState(''),[refreshExpiresAt,setRefreshExpiresAt]=useState(''),[refreshing,setRefreshing]=useState(false)
 const expiresAt=refreshExpiresAt||session?.expiresAt||''
 useEffect(()=>{let expiredNotified=false;const tick=()=>{const expiry=new Date(expiresAt).getTime();if(!Number.isFinite(expiry)){setRemaining('계산 중…');return}const seconds=Math.ceil((expiry-Date.now())/1000);if(seconds<=0){setRemaining('만료됨');if(!expiredNotified){expiredNotified=true;window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))}return}const minutes=Math.floor(seconds/60);setRemaining(`${minutes}분 ${String(seconds%60).padStart(2,'0')}초`)};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[expiresAt])
 const refreshSession=async()=>{setRefreshing(true);try{const result=await api<{expiresAt:string}>('/api/auth/session/refresh',{method:'POST'});setRefreshExpiresAt(result.expiresAt)}finally{setRefreshing(false)}}

 return <div className={`app-shell${collapsed?' sidebar-collapsed':''}${mobileOpen?' mobile-nav-open':''}`}>
  <aside className="sidebar" aria-label="주 메뉴">
   <div className="sidebar-brand-row">
    <button className="brand brand-button sidebar-brand" onClick={()=>move('/')} aria-label="Plan vs Action 대시보드로 이동">
     <b className="brand-mark"><NavIcon name="home"/></b><span>Plan</span><i>vs</i><strong>Action</strong>
    </button>
    <button className="sidebar-toggle" onClick={toggle} aria-label={collapsed?'사이드바 펼치기':'사이드바 접기'} title={collapsed?'사이드바 펼치기':'사이드바 접기'}>
     <svg viewBox="0 0 20 20" aria-hidden="true"><path d={collapsed?'m7 4 6 6-6 6':'m13 4-6 6 6 6'}/></svg>
    </button>
   </div>

   {session&&<section className="sidebar-account" aria-label="로그인 계정 정보">
    <div className="sidebar-account-head"><span className="sidebar-avatar" aria-hidden="true">{session.name.slice(0,1)}</span><div><b>{session.name}</b><span title={session.email}>{session.email}</span></div></div>
    <div className="sidebar-session"><small><i aria-hidden="true"/>세션 종료까지 <strong>{remaining}</strong></small><button type="button" className="session-refresh" onClick={()=>void refreshSession()} disabled={refreshing} title="세션을 30분 연장" aria-label="세션을 30분 연장"><NavIcon name="refresh"/></button></div>
   </section>}

   <nav className="sidebar-nav">
    <span className="sidebar-section-label">WORKSPACE</span>
    <button className={section==='dashboard'?'active':''} onClick={()=>move('/')} title="대시보드"><NavIcon name="dashboard"/><span className="nav-label">대시보드</span></button>
    <button className={section==='today'?'active':''} onClick={()=>move('/today')} title="오늘 할 일"><NavIcon name="today"/><span className="nav-label">오늘 할 일</span></button>
    <button className={section==='plans'&&route.name!=='plan-new'?'active':''} onClick={()=>move('/plans')} title="계획 목록"><NavIcon name="plans"/><span className="nav-label">계획 목록</span></button>
    <button className={route.name==='plan-new'?'active':''} onClick={()=>move('/plans/new')} title="새 계획"><NavIcon name="add"/><span className="nav-label">새 계획</span></button>
   </nav>

   <div className="sidebar-bottom">
    <button className={`sidebar-export${section==='account'?' active':''}`} onClick={()=>move('/account')} title="계정 설정"><NavIcon name="settings"/><span className="nav-label">계정 설정</span></button>
    <button className="sidebar-export" onClick={()=>void logout()} title="로그아웃"><NavIcon name="logout"/><span className="nav-label">로그아웃</span></button>
   </div>
  </aside>

  <button className="sidebar-scrim" aria-label="메뉴 닫기" onClick={()=>setMobileOpen(false)}/>

  <section className="shell-main">
   <div className="mobile-topbar">
    <button className="mobile-menu" onClick={()=>setMobileOpen(true)} aria-label="메뉴 열기"><span/><span/><span/></button>
    <b className="brand mobile-brand"><span>Plan</span><i>vs</i><strong>Action</strong></b>
   </div>
   <div className="content-scroll" ref={scrollRef}>
    <main className="content-main" ref={mainRef} tabIndex={-1}>
     <section className="public-banner"><b>공개 다이어리</b><span>현재는 링크를 아는 누구나 볼 수 있어요. 공개해도 괜찮은 내용만 기록해 주세요.</span></section>
     {children}
    </main>
   </div>
  </section>
 </div>
}
