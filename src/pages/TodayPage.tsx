import {useEffect,useMemo,useState} from 'react'
import {api} from '../lib/api'
import {navigate} from '../lib/router'
import type {Task} from '../lib/types'
import {createdDateLabel,minutes,priorityLabel,today} from '../lib/types'

function TaskCard({task,overdue=false}:{task:Task;overdue?:boolean}){
 const timing=`예상 ${minutes(task.estimated_minutes)}${task.actual_minutes?`, 기록 ${minutes(task.actual_minutes)}`:''}`
 const visibleTags=task.tags.slice(0,2),hiddenTagCount=task.tags.length-visibleTags.length
 return <button className="today-task-card" onClick={()=>navigate(`/plans/${task.plan_id}/tasks/${task.id}/action`)} aria-label={`${task.title} 실행하기`}>
  <span className="today-task-head"><span className={`badge ${task.priority}`}>{priorityLabel[task.priority]}</span><span className="today-task-action">실행하기 <b>→</b></span></span>
  <strong>{task.title}</strong>
  <span className="today-task-meta"><span className="today-task-plan" title={task.plan_title}>{task.plan_title}</span><em className={overdue?'overdue':''}>{overdue?`${task.due_date} 마감`:'오늘 마감'}</em><span className="today-task-timing">{timing}</span></span>
  <span className="today-task-footer"><span className="today-task-created">작성 {createdDateLabel(task.created_at)}</span>{!!task.tags.length&&<span className="today-task-tags" title={task.tags.map(tag=>`#${tag}`).join(' ')}>{visibleTags.map(tag=><i key={tag}>#{tag}</i>)}{hiddenTagCount>0&&<i className="tag-overflow">외 {hiddenTagCount}개</i>}</span>}</span>
 </button>
}

export function TodayPage(){
 const [tasks,setTasks]=useState<Task[]|null>(null),[error,setError]=useState('')
 useEffect(()=>{let active=true;api<Task[]>('/api/tasks?status=active&sort=due').then(rows=>{if(active){setTasks(rows);setError('')}}).catch(cause=>{if(active)setError((cause as Error).message)});return()=>{active=false}},[])
 const overdue=useMemo(()=>tasks?.filter(task=>task.due_date<today)??[],[tasks])
 const dueToday=useMemo(()=>tasks?.filter(task=>task.due_date===today)??[],[tasks])
 const estimated=useMemo(()=>[...overdue,...dueToday].reduce((sum,task)=>sum+task.estimated_minutes,0),[overdue,dueToday])
 const dateLabel=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(`${today}T00:00:00+09:00`))

 return <section className="today-page">
  <header className="today-header">
   <div><span className="eyebrow">TODAY</span><h2>오늘 할 일</h2><p>{dateLabel}</p></div>
   <div className="today-stats" aria-label="오늘 할 일 요약"><span><small>오늘 마감</small><b>{tasks===null?'—':dueToday.length}개</b></span><span><small>지연</small><b>{tasks===null?'—':overdue.length}개</b></span><span><small>예상 시간</small><b>{tasks===null?'—':minutes(estimated)}</b></span></div>
  </header>
  {error&&<section className="panel empty">{error}</section>}
  {tasks===null&&!error&&<section className="panel empty loading-state">오늘의 할 일을 불러오는 중입니다.</section>}
  {tasks!==null&&<div className="today-sections">
   {!!overdue.length&&<section className="today-group overdue-group"><header><div><span className="eyebrow">OVERDUE</span><h3>먼저 처리할 지연 항목</h3></div><b>{overdue.length}개</b></header><div className="today-task-list">{overdue.map(task=><TaskCard task={task} overdue key={task.id}/>)}</div></section>}
   <section className="today-group"><header><div><span className="eyebrow">DUE TODAY</span><h3>오늘 마감할 항목</h3></div><b>{dueToday.length}개</b></header>{dueToday.length?<div className="today-task-list">{dueToday.map(task=><TaskCard task={task} key={task.id}/>)}</div>:<div className="today-empty"><b>오늘 마감할 미완료 항목이 없습니다.</b><span>새 계획을 만들거나 계획 목록에서 다음 할 일을 확인해 보세요.</span><div><button className="secondary" onClick={()=>navigate('/plans')}>계획 목록</button><button className="primary create-button create-entry" onClick={()=>navigate(`/plans/new?dueDate=${encodeURIComponent(today)}`)}>새 계획</button></div></div>}</section>
  </div>}
 </section>
}
