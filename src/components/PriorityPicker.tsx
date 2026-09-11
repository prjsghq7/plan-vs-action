import type {Priority} from '../lib/types'
import {priorityLabel} from '../lib/types'

const priorities:Priority[]=['low','medium','high']

type Props={
 name?:string
 value?:Priority
 defaultValue?:Priority
 onChange?:(priority:Priority)=>void
}

export function PriorityPicker({name,value,defaultValue='medium',onChange}:Props){
 const controlled=value!==undefined
 return <fieldset className="priority-field">
  <legend>우선순위</legend>
  <div className="priority-picker">
   {priorities.map(priority=><label className={`priority-option ${priority}`} key={priority}>
    <input type="radio" name={name} value={priority} checked={controlled?value===priority:undefined} defaultChecked={controlled?undefined:defaultValue===priority} onChange={()=>onChange?.(priority)}/>
    <span><i aria-hidden="true"/>{priorityLabel[priority]}</span>
   </label>)}
  </div>
 </fieldset>
}
