import {useCallback,useEffect,useMemo,useState} from 'react'
import {api} from '../lib/api'
import type {Plan,Task} from '../lib/types'
import {minutes,today} from '../lib/types'
import {navigate} from '../lib/router'

const weekdays=['일','월','화','수','목','금','토']
const pad=(value:number)=>String(value).padStart(2,'0')
const dateKey=(year:number,month:number,day:number)=>{const date=new Date(year,month,day);return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`}

export function DashboardPage({plans}:{plans:Plan[]}){
 const initial=new Date(`${today}T00:00:00`)
 const [cursor,setCursor]=useState(()=>new Date(initial.getFullYear(),initial.getMonth(),1)),[selectedDate,setSelectedDate]=useState(today),[tasks,setTasks]=useState<Task[]|null>(null),[error,setError]=useState(''),[monthPickerOpen,setMonthPickerOpen]=useState(false)
 const load=useCallback(async()=>{try{setTasks(await api<Task[]>('/api/tasks?sort=due'));setError('')}catch(cause){setError((cause as Error).message)}},[])
 // Load all public tasks for the calendar.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{void load()},[load])
 const taskRows=useMemo(()=>tasks??[],[tasks])
 const byDate=useMemo(()=>{const grouped=new Map<string,Task[]>();for(const task of taskRows)grouped.set(task.due_date,[...(grouped.get(task.due_date)??[]),task]);return grouped},[taskRows])
 const calendar=useMemo(()=>{const year=cursor.getFullYear(),month=cursor.getMonth(),firstDay=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate(),previousDays=new Date(year,month,0).getDate();return Array.from({length:42},(_,index)=>{const raw=index-firstDay+1;if(raw<1){const day=previousDays+raw;return{key:dateKey(year,month-1,day),day,current:false}}if(raw>days){const day=raw-days;return{key:dateKey(year,month+1,day),day,current:false}}return{key:dateKey(year,month,raw),day:raw,current:true}})},[cursor])
 const selectedTasks=byDate.get(selectedDate)??[]
 const completed=taskRows.filter(task=>task.status==='completed').length
 const overdue=taskRows.filter(task=>task.status==='active'&&task.due_date<today).length
 function moveMonth(amount:number){setCursor(value=>new Date(value.getFullYear(),value.getMonth()+amount,1))}
 function chooseMonth(month:number){setCursor(value=>new Date(value.getFullYear(),month,1));setMonthPickerOpen(false)}
 return <>
  <section className="dashboard-summary"><div><span>전체 계획</span><b>{plans.length}</b></div><div><span>전체 할 일</span><b>{tasks===null?'—':taskRows.length}</b></div><div><span>완료</span><b>{tasks===null?'—':completed}</b></div><div><span>지연</span><b>{tasks===null?'—':overdue}</b></div></section>
  {error&&<section className="panel empty">{error}</section>}
  <div className="dashboard-layout"><section className="panel calendar-panel"><div className="calendar-head"><button className="calendar-nav" onClick={()=>moveMonth(-1)} aria-label="이전 달"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4-6 6 6 6"/></svg></button><div className="calendar-title"><div className="eyebrow">월간 일정</div><button className="month-trigger" onClick={()=>setMonthPickerOpen(value=>!value)} aria-expanded={monthPickerOpen}><span>{cursor.getFullYear()}년 {cursor.getMonth()+1}월</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></button></div><button className="calendar-nav" onClick={()=>moveMonth(1)} aria-label="다음 달"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 4 6 6-6 6"/></svg></button>{monthPickerOpen&&<div className="month-picker"><div className="month-picker-year"><button onClick={()=>setCursor(value=>new Date(value.getFullYear()-1,value.getMonth(),1))} aria-label="이전 연도">−</button><b>{cursor.getFullYear()}년</b><button onClick={()=>setCursor(value=>new Date(value.getFullYear()+1,value.getMonth(),1))} aria-label="다음 연도">＋</button></div><div className="month-picker-grid">{Array.from({length:12},(_,month)=><button className={cursor.getMonth()===month?'active':''} onClick={()=>chooseMonth(month)} key={month}>{month+1}월</button>)}</div><button className="month-picker-today" onClick={()=>{setCursor(new Date(initial.getFullYear(),initial.getMonth(),1));setSelectedDate(today);setMonthPickerOpen(false)}}>오늘이 있는 달로 이동</button></div>}</div><div className="calendar-weekdays">{weekdays.map(day=><b key={day}>{day}</b>)}</div><div className="calendar-grid">{calendar.map(cell=>{const dayTasks=byDate.get(cell.key)??[];return <button className={`${cell.current?'':'outside'} ${cell.key===today?'today':''} ${cell.key===selectedDate?'selected':''}`} onClick={()=>setSelectedDate(cell.key)} key={cell.key}><span className="calendar-day-number">{cell.day}</span><div>{dayTasks.slice(0,3).map(task=><i className={task.status} key={task.id}>{task.title}</i>)}{dayTasks.length>3&&<small>+{dayTasks.length-3}개</small>}</div></button>})}</div></section>
   <aside className="panel day-agenda"><div className="agenda-head"><div className="eyebrow">선택한 날짜</div><h2>{selectedDate}</h2></div><div className="agenda-list">{tasks===null?<div className="empty loading-state">일정을 불러오는 중입니다.</div>:<>{selectedTasks.map(task=><button className="agenda-item" onClick={()=>navigate(`/plans/${task.plan_id}/tasks/${task.id}/action`)} aria-label={`${task.title} 상세보기`} key={task.id}><span className="agenda-item-head"><span className={`agenda-status ${task.status}`}>{task.status==='completed'?'완료':'진행 중'}</span><span className="agenda-detail-label">상세보기</span></span><strong className="agenda-item-title">{task.title}</strong><span className="agenda-item-meta">{task.plan_title} · 예상 {minutes(task.estimated_minutes)}</span></button>)}{!selectedTasks.length&&<div className="empty">이 날짜에 마감할 일이 없습니다.</div>}</>}</div><button className="primary create-button" onClick={()=>navigate(`/plans/new?dueDate=${encodeURIComponent(selectedDate)}`)}>+ 새 계획 만들기</button></aside>
  </div>
 </>
}
