import {useCallback,useEffect,useRef,useState} from 'react'
import type {FormEvent} from 'react'
import {api} from '../lib/api'
import type {Action,Plan,Review,Summary,Task} from '../lib/types'
import {minutes} from '../lib/types'
import {Notice} from '../components/Notice'
import {BackButton} from '../components/BackButton'

export function ReviewPage({plan}:{plan:Plan}){
 const [summary,setSummary]=useState<Summary|null>(null)
 const [reviews,setReviews]=useState<Review[]>([])
 const [actions,setActions]=useState<Action[]>([])
 const [evidence,setEvidence]=useState<Task[]>([])
 const [evidenceTitle,setEvidenceTitle]=useState('')
 const [evidenceLoading,setEvidenceLoading]=useState(false)
 const [notice,setNotice]=useState('')
 const dialogRef=useRef<HTMLElement>(null)
 const restoreFocusRef=useRef<HTMLElement|null>(null)
 const load=useCallback(async()=>{
  const id=encodeURIComponent(plan.id)
  const [summaryRow,reviewRows,actionRows]=await Promise.all([
   api<Summary>(`/api/summary?planId=${id}`),
   api<Review[]>('/api/reviews'),
   api<Action[]>(`/api/actions?planId=${id}`)
  ])
  setSummary(summaryRow);setReviews(reviewRows);setActions(actionRows)
 },[plan.id])

 // Load the aggregates and evidence for this URL-scoped review page.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{void load()},[load])
 useEffect(()=>{
  if(!evidenceTitle)return
  const handleKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){setEvidenceTitle('');return}
   if(event.key!=='Tab')return
   const focusable=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')??[]).filter(element=>!element.hasAttribute('disabled'))
   if(!focusable.length)return
   const first=focusable[0],last=focusable[focusable.length-1]
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
  addEventListener('keydown',handleKey)
  return()=>{removeEventListener('keydown',handleKey);restoreFocusRef.current?.focus()}
 },[evidenceTitle])

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  const form=event.currentTarget,f=new FormData(form)
  try{
   await api('/api/reviews',{method:'POST',body:JSON.stringify({planId:plan.id,improvementText:f.get('improvementText')})})
   form.reset();setNotice('다음 계획을 위한 한 줄을 저장했습니다.');await load()
  }catch(error){setNotice((error as Error).message)}
 }

 async function showEvidence(metric:string,label:string){
  restoreFocusRef.current=document.activeElement instanceof HTMLElement?document.activeElement:null
  setEvidenceTitle(label);setEvidence([]);setEvidenceLoading(true)
  try{setEvidence(await api<Task[]>(`/api/evidence/${metric}?planId=${encodeURIComponent(plan.id)}`))}
  catch(error){setNotice((error as Error).message);setEvidenceTitle('')}
  finally{setEvidenceLoading(false)}
 }

 const metrics=summary?[
  {key:'planned',label:'전체 할 일',value:summary.planned_count},
  {key:'completed',label:'완료',value:summary.completed_count},
  {key:'overdue',label:'지연',value:summary.overdue_count}
 ]:[]
 const differenceLabel=!summary?'':summary.difference_minutes===0?'예상과 같음':summary.difference_minutes>0?`예상보다 ${minutes(summary.difference_minutes)} 더 기록`:`예상보다 ${minutes(Math.abs(summary.difference_minutes))} 적게 기록`

 return <>
  <div className="context-nav"><BackButton to={`/plans/${plan.id}`}>계획 상세</BackButton></div>
  <section className="summary review-summary" aria-label="계획 결과 요약">
   {metrics.map(item=><button className={`review-metric ${item.key}`} key={item.key} onClick={()=>showEvidence(item.key,item.label)} aria-label={`${item.label} ${item.value}개 상세보기`}><span><i>{item.label}</i><small>상세보기 <b>→</b></small></span><strong>{item.value}<em>개</em></strong></button>)}
  </section>
  <div className="grid two">
   <section className="panel comparison"><div className="eyebrow">PLAN VS ACTION</div><h2>기록된 시간 비교</h2>{summary?<><div><span>기록 대상 예상</span><b>{minutes(summary.tracked_estimated_minutes)}</b></div><div><span>기록된 실제</span><b>{minutes(summary.actual_minutes)}</b></div><div className="difference"><span>차이</span><b>{differenceLabel}</b></div><small>실행 기록이 있는 {summary.tracked_count}개 할 일 기준 · 전체 예상 {minutes(summary.estimated_minutes)}</small><small>지연 기준일 · 서울 {summary.today_seoul}</small></>:<div className="empty loading-state">시간 기록을 불러오는 중입니다.</div>}</section>
   <section className="panel"><div className="eyebrow">다음 계획</div><h2>다음에는 이렇게</h2><form onSubmit={submit}><label>고칠 점 한 가지<textarea name="improvementText" required placeholder="예상 시간을 현실적으로 잡는다"/></label><button className="primary review-submit">회고 저장</button></form><ul className="review-list">{reviews.filter(review=>review.plan_id===plan.id).map(review=><li key={review.id}>{review.improvement_text}</li>)}</ul></section>
  </div>
  <section className="panel wide"><div className="eyebrow">실행 내역</div><h2>실행 기록</h2><div className="action-list">{actions.map(action=><article key={action.id}><b>{action.task_title}</b><span>{new Date(action.started_at).toLocaleString('ko-KR')} · {minutes(action.actual_minutes)}</span>{action.note&&<p>메모 · {action.note}</p>}</article>)}</div></section>
  {evidenceTitle&&<div className="dialog-backdrop" onMouseDown={()=>setEvidenceTitle('')}><section ref={dialogRef} className="evidence-dialog" role="dialog" aria-modal="true" aria-labelledby="evidence-dialog-title" onMouseDown={event=>event.stopPropagation()}><header><div><span>선택한 계획의 기록</span><h2 id="evidence-dialog-title">{evidenceTitle}</h2></div><button autoFocus onClick={()=>setEvidenceTitle('')} aria-label="근거 목록 닫기">×</button></header><div className="evidence-dialog-list">{evidenceLoading?<div className="empty">기록을 불러오는 중입니다.</div>:<>{evidence.map(task=><article key={task.id}><div><b>{task.title}</b><span>{task.status==='completed'?'완료':'진행 중'} · {task.due_date}</span></div><strong>실제 {minutes(task.actual_minutes)}</strong></article>)}{!evidence.length&&<div className="empty">해당하는 기록이 없습니다.</div>}</>}</div></section></div>}
  <Notice message={notice} onClose={()=>setNotice('')}/>
 </>
}
