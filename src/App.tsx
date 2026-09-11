import {useCallback,useEffect,useMemo,useState} from 'react'
import './management.css'
import './theme.css'
import {api} from './lib/api'
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

export default function App(){
 const route=useRoute()
 const [plans,setPlans]=useState<Plan[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
 const loadPlans=useCallback(async()=>{try{setPlans(await api<Plan[]>('/api/plans'));setError('')}catch(cause){setError((cause as Error).message)}finally{setLoading(false)}},[])
 // Initial route normalization and server state hydration.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{void loadPlans()},[loadPlans])
 const planId='planId'in route?route.planId:''
 const plan=useMemo(()=>plans.find(item=>item.id===planId),[plans,planId])
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
 else page=<section className="panel empty"><h2>페이지를 찾을 수 없습니다.</h2><button className="primary" onClick={()=>navigate('/plans')}>계획 목록으로</button></section>
 return <Layout route={route}>{page}</Layout>
}
