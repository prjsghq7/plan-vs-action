import {useCallback,useEffect,useMemo,useRef,useState} from 'react'
import type {FormEvent} from 'react'
import {api} from '../lib/api'
import type {Action,Plan,Task} from '../lib/types'
import {calendarDateLabel,createdDateLabel,minutes,priorityLabel,today} from '../lib/types'
import {navigate} from '../lib/router'
import {Notice} from '../components/Notice'
import {BackButton} from '../components/BackButton'
import {validateForm} from '../lib/formValidation'

export function ActionPage({plan,taskId,onChanged}:{plan:Plan;taskId?:string;onChanged:()=>Promise<void>}){
 const [tasks,setTasks]=useState<Task[]|null>(null)
 const [actions,setActions]=useState<Action[]>([])
 const [selectedId,setSelectedId]=useState(taskId??'')
 const [q,setQ]=useState('')
 const [status,setStatus]=useState('')
 const [workedOn,setWorkedOn]=useState(today)
 const [notice,setNotice]=useState('')
 const actionFormRef=useRef<HTMLFormElement>(null)
 const directTaskMode=Boolean(taskId)
 const load=useCallback(async()=>{
  const suffix=`planId=${encodeURIComponent(plan.id)}`
  const filters=directTaskMode?'':`&q=${encodeURIComponent(q)}&status=${status}`
  const [taskRows,actionRows]=await Promise.all([api<Task[]>(`/api/tasks?${suffix}${filters}&sort=due`),api<Action[]>(`/api/actions?${suffix}`)])
  setTasks(taskRows)
  setActions(actionRows)
 },[directTaskMode,plan.id,q,status])

 // Load task and action rows for this URL-scoped plan page.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{void load()},[load])
 const taskRows=useMemo(()=>tasks??[],[tasks])
 const selected=useMemo(()=>taskRows.find(task=>task.id===selectedId),[taskRows,selectedId])
 const selectedActions=useMemo(()=>selected?actions.filter(action=>action.task_id===selected.id):[],[actions,selected])
 const remainingMinutes=selected?Math.max(selected.estimated_minutes-selected.actual_minutes,0):0
 const defaultActualMinutes=remainingMinutes>0?String(remainingMinutes):selectedActions.length?'':'0'

 async function toggle(task:Task){
  if(task.status!=='completed'&&!actions.some(action=>action.task_id===task.id)){
   setNotice('완료하려면 작업 기록을 먼저 남겨 주세요.')
   window.setTimeout(()=>{actionFormRef.current?.scrollIntoView({behavior:'smooth',block:'center'});actionFormRef.current?.querySelector<HTMLInputElement>('input[name="workedOn"]')?.focus()},0)
   return
  }
  try{
   await api(`/api/tasks/${task.id}/status`,{method:'POST',body:JSON.stringify({completed:task.status!=='completed',expectedVersion:task.status_version,idempotencyKey:`${task.id}:${task.status_version}:${task.status==='completed'?'active':'completed'}`})})
   await Promise.all([load(),onChanged()])
  }catch(error){setNotice((error as Error).message)}
 }

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  if(!selected)return
  const invalidMessage=validateForm(event.currentTarget)
  if(invalidMessage){setNotice(invalidMessage);return}
  const form=event.currentTarget,f=new FormData(form)
  try{
   await api('/api/actions',{method:'POST',body:JSON.stringify({taskId:selected.id,workedOn,actualMinutes:Number(f.get('actualMinutes')),note:f.get('note')})})
   form.reset();setWorkedOn(today)
   setNotice('이 할 일에 작업 기록을 저장했습니다.')
   await load()
  }catch(error){setNotice((error as Error).message)}
 }

 function selectTask(id:string){setSelectedId(id);navigate(`/plans/${plan.id}/tasks/${id}/action`,true)}

 return <>
  <div className="context-nav"><BackButton to={`/plans/${plan.id}`}>계획 상세</BackButton></div>
  <div className={`execution-layout ${directTaskMode?'direct-action-layout':''}`}>
   {!directTaskMode&&<section className="panel">
    <div className="eyebrow">할 일 선택</div><h2>{plan.title}</h2>
    <div className="filters task-filters"><input placeholder="할 일 검색" value={q} onChange={e=>setQ(e.target.value)}/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">모든 상태</option><option value="active">진행 중</option><option value="completed">완료</option></select></div>
    <div className="execution-tasks">{tasks===null?<div className="empty loading-state">할 일을 불러오는 중입니다.</div>:<>{taskRows.map(task=><button className={selectedId===task.id?'selected':''} onClick={()=>selectTask(task.id)} key={task.id}><span><b>{task.title}</b><small>마감 {task.due_date}, 예상 {minutes(task.estimated_minutes)}, 작성 {createdDateLabel(task.created_at)}</small></span><i className={`task-state ${task.status}`}>{task.status==='completed'?'완료':'진행 중'}</i></button>)}{!taskRows.length&&<div className="empty">이 계획에 실행할 할 일이 없습니다.</div>}</>}</div>
   </section>}
   <section className="panel action-workspace">{selected?<>
    <div className="action-title-row"><div><div className="eyebrow">선택한 할 일</div><h2>{selected.title}</h2></div>{directTaskMode&&taskRows.length>1&&<label className="task-switcher"><span>다른 할 일</span><select aria-label="다른 할 일 선택" value={selected.id} onChange={event=>selectTask(event.target.value)}>{taskRows.map(task=><option value={task.id} key={task.id}>{task.title}</option>)}</select></label>}</div>
    <div className="action-meta-row"><div className="task-context"><span className={`badge ${selected.priority}`}>{priorityLabel[selected.priority]}</span><span>예상 {minutes(selected.estimated_minutes)}</span><span>실제 {minutes(selected.actual_minutes)}</span><span>작성 {createdDateLabel(selected.created_at)}</span></div><div className="button-row status-row"><button className={`status-toggle ${selected.status==='completed'?'reopen':'complete'}`} onClick={()=>toggle(selected)}>{selected.status==='completed'?'완료 취소':'완료 처리'}</button></div></div>
    <div className="action-content-grid">
     <section className="action-entry"><h3>작업 기록 추가</h3>{selected.status==='completed'?<div className="completed-action-note"><b>완료된 할 일입니다.</b><span>새 작업 기록이 필요하면 위의 ‘완료 취소’를 눌러 진행 중으로 되돌려 주세요.</span></div>:<form ref={actionFormRef} onSubmit={submit} noValidate>
      <div className="row"><label>작업일<input name="workedOn" type="date" required value={workedOn} onChange={event=>setWorkedOn(event.target.value)}/></label><label>작업 시간(분)<input key={`${selected.id}:${selected.actual_minutes}:${selectedActions.length}`} name="actualMinutes" type="number" min="0" required defaultValue={defaultActualMinutes} placeholder="예: 35"/></label></div>
      <label>작업 메모 <small className="optional-label">선택</small><textarea name="note" placeholder="진행 내용이나 다음에 이어서 할 일을 자유롭게 기록하세요."/></label>
      <button className="primary action-submit">작업 기록 추가</button>
     </form>}</section>
     <section className="task-action-history"><h3>작업 기록 내역</h3>{selectedActions.map(action=><article key={action.id}><b>{calendarDateLabel(action.worked_on)}</b><span>{minutes(action.actual_minutes)}</span>{action.note&&<p>메모: {action.note}</p>}</article>)}{!selectedActions.length&&<div className="empty">아직 작업 기록이 없습니다.</div>}</section>
    </div>
   </>:tasks===null?<div className="empty action-empty">선택한 할 일을 불러오는 중입니다.</div>:<div className="empty action-empty"><b>할 일을 찾을 수 없습니다.</b><span>계획 상세에서 다시 선택해 주세요.</span></div>}</section>
  </div>
  <Notice message={notice} onClose={()=>setNotice('')}/>
 </>
}
