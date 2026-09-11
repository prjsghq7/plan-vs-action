import {useMemo,useState} from 'react'
import type {Plan} from '../lib/types'
import {priorityLabel} from '../lib/types'
import {navigate} from '../lib/router'

export function PlansPage({plans}:{plans:Plan[]}){
 const [query,setQuery]=useState(''),[priority,setPriority]=useState('')
 const visible=useMemo(()=>plans.filter(plan=>(!query||plan.title.toLocaleLowerCase('ko-KR').includes(query.toLocaleLowerCase('ko-KR')))&&(!priority||plan.priority===priority)),[plans,query,priority])
 return <>
  <div className="page-actions"><div><span className="eyebrow">PLANS</span><h2>계획 목록 <small>{plans.length}개</small></h2></div><button className="primary create-button" onClick={()=>navigate('/plans/new')}>+ 새 계획</button></div>
  <div className="plan-list-toolbar"><input aria-label="계획 검색" placeholder="계획 검색" value={query} onChange={event=>setQuery(event.target.value)}/><select aria-label="우선순위 필터" value={priority} onChange={event=>setPriority(event.target.value)}><option value="">모든 우선순위</option><option value="high">높음</option><option value="medium">보통</option><option value="low">낮음</option></select></div>
  <section className="plan-grid">{visible.map(plan=>{const progress=plan.task_count?Math.round(plan.completed_count/plan.task_count*100):0;return <button className="plan-card" key={plan.id} onClick={()=>navigate(`/plans/${plan.id}`)}><span className={`badge ${plan.priority}`}>{priorityLabel[plan.priority]}</span><h3>{plan.title}</h3><b>할 일 {plan.task_count}개 · {plan.completed_count}개 완료</b><span className="plan-progress" role="progressbar" aria-label={`${plan.title} 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i aria-hidden="true" style={{width:`${100-progress}%`}}/></span><small className="plan-progress-label"><b>{progress}%</b> 진행</small></button>})}{!visible.length&&<div className="panel empty">{plans.length?'조건에 맞는 계획이 없습니다.':'저장된 계획이 없습니다. 첫 계획을 만들어 주세요.'}</div>}</section>
 </>
}
