import {useCallback,useEffect,useMemo,useState} from 'react'
import type {FormEvent} from 'react'
import {api} from '../lib/api'
import type {Action,Plan,Task} from '../lib/types'
import {minutes,priorityLabel} from '../lib/types'
import {navigate} from '../lib/router'
import {Notice} from '../components/Notice'
import {BackButton} from '../components/BackButton'

export function ActionPage({plan,taskId,onChanged}:{plan:Plan;taskId?:string;onChanged:()=>Promise<void>}){
 const [tasks,setTasks]=useState<Task[]|null>(null)
 const [actions,setActions]=useState<Action[]>([])
 const [selectedId,setSelectedId]=useState(taskId??'')
 const [q,setQ]=useState('')
 const [status,setStatus]=useState('')
 const [startedAt,setStartedAt]=useState('')
 const [endedAt,setEndedAt]=useState('')
 const [actualMinutes,setActualMinutes]=useState('')
 const [notice,setNotice]=useState('')
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
 // Keep the editable duration in sync after either timestamp changes.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{if(startedAt&&endedAt){const duration=Math.max(0,Math.round((new Date(endedAt).getTime()-new Date(startedAt).getTime())/60000));setActualMinutes(String(duration))}},[startedAt,endedAt])

 const taskRows=useMemo(()=>tasks??[],[tasks])
 const selected=useMemo(()=>taskRows.find(task=>task.id===selectedId),[taskRows,selectedId])
 const selectedActions=useMemo(()=>selected?actions.filter(action=>action.task_id===selected.id):[],[actions,selected])

 async function toggle(task:Task){
  try{
   await api(`/api/tasks/${task.id}/status`,{method:'POST',body:JSON.stringify({completed:task.status!=='completed',expectedVersion:task.status_version,idempotencyKey:`${task.id}:${task.status_version}:${task.status==='completed'?'active':'completed'}`})})
   await Promise.all([load(),onChanged()])
  }catch(error){setNotice((error as Error).message)}
 }

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  if(!selected)return
  const form=event.currentTarget,f=new FormData(form)
  try{
   await api('/api/actions',{method:'POST',body:JSON.stringify({taskId:selected.id,startedAt:new Date(startedAt).toISOString(),endedAt:new Date(endedAt).toISOString(),actualMinutes:Number(actualMinutes),note:f.get('note')})})
   form.reset();setStartedAt('');setEndedAt('');setActualMinutes('')
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
    <div className="execution-tasks">{tasks===null?<div className="empty loading-state">할 일을 불러오는 중입니다.</div>:<>{taskRows.map(task=><button className={selectedId===task.id?'selected':''} onClick={()=>selectTask(task.id)} key={task.id}><span><b>{task.title}</b><small>마감 {task.due_date} · 예상 {minutes(task.estimated_minutes)}</small></span><i className={`task-state ${task.status}`}>{task.status==='completed'?'완료':'진행 중'}</i></button>)}{!taskRows.length&&<div className="empty">이 계획에 실행할 할 일이 없습니다.</div>}</>}</div>
   </section>}
   <section className="panel action-workspace">{selected?<>
    <div className="action-title-row"><div><div className="eyebrow">선택한 할 일</div><h2>{selected.title}</h2></div>{directTaskMode&&taskRows.length>1&&<label className="task-switcher"><span>다른 할 일</span><select aria-label="다른 할 일 선택" value={selected.id} onChange={event=>selectTask(event.target.value)}>{taskRows.map(task=><option value={task.id} key={task.id}>{task.title}</option>)}</select></label>}</div>
    <div className="action-meta-row"><div className="task-context"><span className={`badge ${selected.priority}`}>{priorityLabel[selected.priority]}</span><span>예상 {minutes(selected.estimated_minutes)}</span><span>실제 {minutes(selected.actual_minutes)}</span></div><div className="button-row status-row"><button className={`status-toggle ${selected.status==='completed'?'reopen':'complete'}`} onClick={()=>toggle(selected)}>{selected.status==='completed'?'완료 취소':'완료 처리'}</button></div></div>
    <div className="action-content-grid">
     <section className="action-entry"><h3>작업 기록 추가</h3>{selected.status==='completed'?<div className="completed-action-note"><b>완료된 할 일입니다.</b><span>새 작업 기록이 필요하면 위의 ‘완료 취소’를 눌러 진행 중으로 되돌려 주세요.</span></div>:<form onSubmit={submit}>
      <div className="row"><label>시작<input name="startedAt" type="datetime-local" required value={startedAt} onChange={event=>setStartedAt(event.target.value)}/></label><label>종료<input name="endedAt" type="datetime-local" required value={endedAt} onChange={event=>setEndedAt(event.target.value)}/></label></div>
      <label>실제 시간(분)<input name="actualMinutes" type="number" min="0" required value={actualMinutes} onChange={event=>setActualMinutes(event.target.value)}/><small className="field-hint">시작·종료 시각으로 자동 계산되며 필요하면 직접 수정할 수 있습니다.</small></label>
      <label>작업 메모 <small className="optional-label">선택</small><textarea name="note" placeholder="진행 내용이나 다음에 이어서 할 일을 자유롭게 기록하세요."/></label>
      <button className="primary action-submit">작업 기록 추가</button>
     </form>}</section>
     <section className="task-action-history"><h3>작업 기록 내역</h3>{selectedActions.map(action=><article key={action.id}><b>{new Date(action.started_at).toLocaleString('ko-KR')}</b><span>{minutes(action.actual_minutes)}</span>{action.note&&<p>메모 · {action.note}</p>}</article>)}{!selectedActions.length&&<div className="empty">아직 작업 기록이 없습니다.</div>}</section>
    </div>
   </>:tasks===null?<div className="empty action-empty">선택한 할 일을 불러오는 중입니다.</div>:<div className="empty action-empty"><b>할 일을 찾을 수 없습니다.</b><span>계획 상세에서 다시 선택해 주세요.</span></div>}</section>
  </div>
  <Notice message={notice} onClose={()=>setNotice('')}/>
 </>
}
