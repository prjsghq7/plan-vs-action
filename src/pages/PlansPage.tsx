import {useMemo,useState} from 'react'
import type {Plan} from '../lib/types'
import {createdDateLabel,priorityLabel} from '../lib/types'
import {navigate} from '../lib/router'

export function PlansPage({plans}:{plans:Plan[]}){
 const [query,setQuery]=useState(''),[priority,setPriority]=useState(''),[status,setStatus]=useState('')
 const completedCount=plans.filter(plan=>plan.task_count>0&&plan.completed_count===plan.task_count).length
 const activeCount=plans.length-completedCount
 const hasDetailedFilter=Boolean(query||priority)
 const visible=useMemo(()=>plans.filter(plan=>{
  const completed=plan.task_count>0&&plan.completed_count===plan.task_count
  return (!query||plan.title.toLocaleLowerCase('ko-KR').includes(query.toLocaleLowerCase('ko-KR')))&&(!priority||plan.priority===priority)&&(!status||(status==='completed'?completed:!completed))
 }),[plans,query,priority,status])
 return <>
  <div className="page-actions"><div><span className="eyebrow">PLANS</span><h2>계획 목록 {hasDetailedFilter&&<small className="plan-filter-count">{visible.length}개</small>}</h2></div><button className="primary create-button create-entry" onClick={()=>navigate('/plans/new')}>새 계획</button></div>
  <div className="plan-list-toolbar"><input aria-label="계획 검색" placeholder="계획 검색" value={query} onChange={event=>setQuery(event.target.value)}/><select aria-label="우선순위 필터" value={priority} onChange={event=>setPriority(event.target.value)}><option value="">모든 우선순위</option><option value="high">높음</option><option value="medium">보통</option><option value="low">낮음</option></select><select aria-label="진행 상태 필터" value={status} onChange={event=>setStatus(event.target.value)}><option value="">전체 계획 {plans.length}개</option><option value="active">진행 중 계획 {activeCount}개</option><option value="completed">완료된 계획 {completedCount}개</option></select></div>
  <section className="plan-grid">{visible.map(plan=>{const progress=plan.task_count?Math.round(plan.completed_count/plan.task_count*100):0;return <button className="plan-card" key={plan.id} onClick={()=>navigate(`/plans/${plan.id}`)}><span className={`badge ${plan.priority}`}>{priorityLabel[plan.priority]}</span><time className="plan-card-created" dateTime={plan.created_at}>작성 {createdDateLabel(plan.created_at)}</time><h3>{plan.title}</h3><span className="plan-card-stats"><b>할 일 {plan.task_count}개, {plan.completed_count}개 완료</b><small>최종 마감일 <b>{plan.final_due_date??'없음'}</b></small></span><span className="plan-progress" role="progressbar" aria-label={`${plan.title} 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i aria-hidden="true" style={{width:`${100-progress}%`}}/></span><small className="plan-progress-label"><b>{progress}%</b> 진행</small></button>})}{!visible.length&&<div className="panel empty">{plans.length?'조건에 맞는 계획이 없습니다.':'저장된 계획이 없습니다. 첫 계획을 만들어 주세요.'}</div>}</section>
 </>
}
