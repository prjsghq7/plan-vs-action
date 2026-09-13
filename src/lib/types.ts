export type Priority='low'|'medium'|'high'
export type Plan={id:string;title:string;priority:Priority;success_criteria:string;task_estimated_minutes:number;task_count:number;completed_count:number;final_due_date:string|null}
export type Task={id:string;plan_id:string;plan_title:string;title:string;due_date:string;priority:Priority;estimated_minutes:number;actual_minutes:number;status:'active'|'completed';status_version:number;tags:string[]}
export type Action={id:string;task_id:string;task_title:string;worked_on:string;actual_minutes:number;note:string}
export type Review={id:string;plan_id:string;plan_title:string;improvement_text:string;next_plan_title?:string}
export type Summary={planned_count:number;completed_count:number;overdue_count:number;estimated_minutes:number;tracked_estimated_minutes:number;tracked_count:number;actual_minutes:number;difference_minutes:number;today_seoul:string}
export type DraftTask={key:string;title:string;dueDate:string;estimatedMinutes:number;priority:Priority;tags:string}

export const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
export const priorityLabel:Record<Priority,string>={low:'낮음',medium:'보통',high:'높음'}
export const emptyTask=(dueDate=today):DraftTask=>({key:crypto.randomUUID(),title:'',dueDate,estimatedMinutes:30,priority:'medium',tags:''})
export function minutes(value:number){const sign=value<0?'-':'',n=Math.abs(value),hours=Math.floor(n/60),rest=n%60;if(!hours)return `${sign}${rest}분`;if(!rest)return `${sign}${hours}시간`;return `${sign}${hours}시간 ${rest}분`}
export function calendarDateLabel(value:string){const [year,month,day]=value.split('-').map(Number);return `${year}. ${month}. ${day}.`}
export function tagList(value:FormDataEntryValue|null){return String(value??'').split(',').map(x=>x.trim()).filter(Boolean)}
