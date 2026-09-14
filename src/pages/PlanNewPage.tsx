import {useState} from 'react'
import type {FormEvent} from 'react'
import {api} from '../lib/api'
import {emptyTask,tagList,today} from '../lib/types'
import type {DraftTask} from '../lib/types'
import {navigate} from '../lib/router'
import {Notice} from '../components/Notice'
import {PriorityPicker} from '../components/PriorityPicker'
import {TagPicker} from '../components/TagPicker'
import {validateForm} from '../lib/formValidation'

const MAX_TASKS=20

export function PlanNewPage({onChanged}:{onChanged:()=>Promise<void>}){
 const requestedDueDate=new URLSearchParams(location.search).get('dueDate')??''
 const initialDueDate=/^\d{4}-\d{2}-\d{2}$/.test(requestedDueDate)?requestedDueDate:today
 const [tasks,setTasks]=useState<DraftTask[]>([emptyTask(initialDueDate)]),[notice,setNotice]=useState('')
 function update(key:string,field:keyof DraftTask,value:string|number){setTasks(rows=>rows.map(row=>row.key===key?{...row,[field]:value}:row))}
 function addTask(){setTasks(rows=>rows.length<MAX_TASKS?[...rows,emptyTask(initialDueDate)]:rows)}
 async function submit(event:FormEvent<HTMLFormElement>){
 event.preventDefault()
  const invalidMessage=validateForm(event.currentTarget)
  if(invalidMessage){setNotice(invalidMessage);return}
  const f=new FormData(event.currentTarget)
  try{
   const created=await api<{id:string}>('/api/plans',{method:'POST',body:JSON.stringify({
    title:f.get('title'),priority:f.get('priority'),successCriteria:f.get('successCriteria'),
    tasks:tasks.map(task=>({title:task.title,dueDate:task.dueDate,estimatedMinutes:task.estimatedMinutes,priority:task.priority,tags:tagList(task.tags)}))
   })})
   await onChanged()
   navigate(`/plans/${created.id}`)
  }catch(error){setNotice((error as Error).message)}
 }

 return <>
  <section className="panel form-page">
   <h2 className="form-title">계획과 할 일 만들기</h2>
   <form onSubmit={submit} noValidate>
    <section className="plan-basics-card">
     <div className="form-section-head"><span>PLAN</span><h3>계획 정보</h3></div>
     <div className="plan-main-row">
      <label>계획 이름<input name="title" required placeholder="내가 실제로 할 계획"/></label>
      <PriorityPicker name="priority"/>
     </div>
     <label>성공 기준<textarea name="successCriteria" required placeholder="무엇이 되면 성공인가요?"/></label>
    </section>

    <div className="form-section-head draft-section-head">
     <span>TASKS</span><h3>할 일 구성</h3>
     <small>{tasks.length}개, 최대 {MAX_TASKS}개</small>
    </div>
    <div className="draft-tasks">
     {tasks.map((task,index)=><fieldset className="draft-task-card" key={task.key}>
      <legend>할 일 {index+1}</legend>
      <button type="button" className="delete-task-button draft-remove" disabled={tasks.length===1} onClick={()=>setTasks(rows=>rows.filter(row=>row.key!==task.key))}>삭제</button>
      <label>내용<input required value={task.title} onChange={e=>update(task.key,'title',e.target.value)} placeholder="할 일을 입력하세요"/></label>
      <div className="row">
       <label>마감일<input required type="date" value={task.dueDate} onChange={e=>update(task.key,'dueDate',e.target.value)}/></label>
       <label>예상 시간(분)<input required type="number" min="0" value={task.estimatedMinutes} onChange={e=>update(task.key,'estimatedMinutes',Number(e.target.value))}/></label>
      </div>
      <div className="row">
       <PriorityPicker value={task.priority} onChange={priority=>update(task.key,'priority',priority)}/>
       <TagPicker value={tagList(task.tags)} onChange={tags=>update(task.key,'tags',tags.join(', '))}/>
      </div>
     </fieldset>)}
     <button type="button" className="add-task-card" disabled={tasks.length>=MAX_TASKS} onClick={addTask}>
      <span>＋</span><b>{tasks.length>=MAX_TASKS?'최대 20개':'할 일 추가'}</b><small>{tasks.length>=MAX_TASKS?'추가 한도에 도달했습니다.':'다음 할 일을 카드로 추가합니다.'}</small>
     </button>
    </div>
    <button className="primary create-button form-submit">계획과 할 일 저장</button>
   </form>
  </section>
  <Notice message={notice} onClose={()=>setNotice('')}/>
 </>
}
