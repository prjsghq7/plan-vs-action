import {useCallback,useEffect,useMemo,useState} from 'react'
import './management.css'
import './theme.css'
import {api,SESSION_EXPIRED_EVENT} from './lib/api'
import type {Plan} from './lib/types'
import {navigate,useRoute} from './lib/router'
import {Layout} from './components/Layout'
import {PlansPage} from './pages/PlansPage'
import {PlanNewPage} from './pages/PlanNewPage'
import {PlanDetailPage} from './pages/PlanDetailPage'
import {ActionPage} from './pages/ActionPage'
import {ReviewPage} from './pages/ReviewPage'
import {DashboardPage} from './pages/DashboardPage'
import {TodayPage} from './pages/TodayPage'
import {AuthPage} from './pages/AuthPage'
import {AccountPage} from './pages/AccountPage'

export default function App(){
 const route=useRoute()
 const authMode=route.name==='login'||route.name==='signup'||route.name==='verify-email'||route.name==='reset-password'?route.name:null
 const [plans,setPlans]=useState<Plan[]>([]),[loading,setLoading]=useState(!authMode),[error,setError]=useState(''),[session,setSession]=useState<{name:string;email:string;expiresAt:string}|null>(null),[authNotice,setAuthNotice]=useState('')
 const loadPlans=useCallback(async()=>{try{setPlans(await api<Plan[]>('/api/plans'));setError('')}catch(cause){setError((cause as Error).message)}finally{setLoading(false)}},[])
 useEffect(()=>{const expired=()=>{setSession(null);setPlans([]);setError('');setLoading(false);setAuthNotice('세션이 만료되었습니다. 다시 로그인해 주세요.');if(location.pathname!=='/login')navigate('/login',true)};window.addEventListener(SESSION_EXPIRED_EVENT,expired);return()=>window.removeEventListener(SESSION_EXPIRED_EVENT,expired)},[])
 // Initial route normalization and server state hydration.
 useEffect(()=>{if(authMode)return;void api<{name:string;email:string;expiresAt:string}>('/api/auth/me').then(value=>{setSession(value);return loadPlans()}).catch(()=>{if(location.pathname!=='/login')navigate('/login',true)})},[authMode,loadPlans])
 const planId='planId'in route?route.planId:''
 const plan=useMemo(()=>plans.find(item=>item.id===planId),[plans,planId])
 if(authMode)return <AuthPage mode={authMode} notice={authNotice} onNoticeClose={()=>setAuthNotice('')}/>
 let page
 if(loading)page=<section className="panel empty">데이터를 불러오는 중입니다.</section>
 else if(error)page=<section className="panel empty">{error}</section>
 else if(route.name==='dashboard')page=<DashboardPage plans={plans}/>
 else if(route.name==='today')page=<TodayPage/>
 else if(route.name==='plans')page=<PlansPage plans={plans}/>
 else if(route.name==='plan-new')page=<PlanNewPage onChanged={loadPlans}/>
 else if(route.name==='plan-detail'&&plan)page=<PlanDetailPage key={plan.id} plan={plan} onChanged={loadPlans}/>
 else if(route.name==='action'&&plan)page=<ActionPage key={`${plan.id}:${route.taskId??''}`} plan={plan} taskId={route.taskId} onChanged={loadPlans}/>
 else if(route.name==='review'&&plan)page=<ReviewPage key={plan.id} plan={plan}/>
 else if(route.name==='account'&&session)page=<AccountPage session={session} onSessionChange={setSession}/>
 else page=<section className="panel empty"><h2>페이지를 찾을 수 없습니다.</h2><button className="primary" onClick={()=>navigate('/plans')}>계획 목록으로</button></section>
 return <Layout route={route} session={session}>{page}</Layout>
}
