import {useEffect,useMemo,useState} from 'react'
import type {KeyboardEvent} from 'react'
import {api} from '../lib/api'

type TagOption={id:string;name:string;normalized_name:string;search_key:string;usage_count:number}
type Props={name?:string;value?:string[];defaultValue?:string[];onChange?:(tags:string[])=>void}

let optionsRequest:Promise<TagOption[]>|undefined
const loadOptions=()=>optionsRequest??=api<TagOption[]>('/api/tags').finally(()=>{optionsRequest=undefined})

function parts(value:string){
 let name=value.normalize('NFKC').trim().replace(/\s+/g,' ').replace(/^#+\s*/,'')
 const wrappers:Record<string,string>={'[':']','(':')','{':'}','"':'"',"'":"'"}
 const closing=wrappers[name[0]]
 if(closing&&name.endsWith(closing))name=name.slice(1,-1).trim()
 const normalized=name.toLocaleLowerCase('ko-KR').replace(/\s+/g,'')
 const ignored=`._-[](){}"'`
 return{name,normalized,search:[...normalized].filter(character=>!ignored.includes(character)).join('')}
}

function distance(a:string,b:string){
 const row=Array.from({length:b.length+1},(_,index)=>index)
 for(let i=1;i<=a.length;i++){
  let previous=row[0]
  row[0]=i
  for(let j=1;j<=b.length;j++){
   const saved=row[j]
   row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1))
   previous=saved
  }
 }
 return row[b.length]
}

export function TagPicker({name,value,defaultValue=[],onChange}:Props){
 const controlled=value!==undefined
 const [internal,setInternal]=useState(defaultValue),[query,setQuery]=useState(''),[options,setOptions]=useState<TagOption[]>([]),[focused,setFocused]=useState(false)
 const selected=controlled?value:internal
 useEffect(()=>{let active=true;void loadOptions().then(rows=>{if(active)setOptions(rows)}).catch(()=>{});return()=>{active=false}},[])
 const selectedKeys=useMemo(()=>new Set(selected.map(tag=>parts(tag).normalized)),[selected])
 const queryParts=parts(query)
 const exact=options.find(option=>option.normalized_name===queryParts.normalized)
 const suggestions=queryParts.normalized?options.filter(option=>!selectedKeys.has(option.normalized_name)&&(option.normalized_name.includes(queryParts.normalized)||queryParts.normalized.includes(option.normalized_name)||distance(option.search_key,queryParts.search)<=1)).slice(0,5):options.filter(option=>!selectedKeys.has(option.normalized_name)).slice(0,5)

 function commit(next:string[]){if(!controlled)setInternal(next);onChange?.(next)}
 function add(tag:string){const cleaned=parts(tag);if(!cleaned.name||selected.length>=10||selectedKeys.has(cleaned.normalized))return;commit([...selected,cleaned.name]);setQuery('')}
 function remove(tag:string){const key=parts(tag).normalized;commit(selected.filter(item=>parts(item).normalized!==key))}
 function keyboard(event:KeyboardEvent<HTMLInputElement>){
  if(event.key==='Backspace'&&!query&&selected.length){remove(selected[selected.length-1]);return}
  if(event.key!=='Enter'&&event.key!==',')return
  event.preventDefault()
  if(exact)add(exact.name)
  else if(!suggestions.length)add(query)
 }

 return <div className="tag-field">
  <span className="field-label">태그</span>
  <div className={`tag-control${focused?' focused':''}`}>
   {selected.map(tag=>{const key=parts(tag).normalized,isNew=!options.some(option=>option.normalized_name===key);return <button type="button" className="tag-chip" onClick={()=>remove(tag)} key={key}><span>{tag}</span>{isNew&&<i>NEW</i>}<b aria-hidden="true">×</b></button>})}
   <input value={query} disabled={selected.length>=10} onChange={event=>setQuery(event.target.value)} onKeyDown={keyboard} onFocus={()=>setFocused(true)} onBlur={()=>setTimeout(()=>setFocused(false),120)} placeholder={selected.length>=10?'태그는 최대 10개입니다':selected.length?'태그 추가':'기존 태그 검색 또는 새 태그 입력'} aria-label="태그 검색 또는 추가"/>
  </div>
  {name&&<input type="hidden" name={name} value={selected.join(',')}/>}
  {focused&&<div className="tag-suggestions">
   {suggestions.map(option=><button type="button" onMouseDown={event=>event.preventDefault()} onClick={()=>add(option.name)} key={option.id}><span><b>{option.name}</b><small>기존 태그 · 할 일 {option.usage_count}개</small></span><i>선택</i></button>)}
   {queryParts.name&&!exact&&<button type="button" className="create-tag" onMouseDown={event=>event.preventDefault()} onClick={()=>add(queryParts.name)}><span><b>“{queryParts.name}”</b><small>{suggestions.length?'비슷한 태그를 확인한 뒤 새로 만드세요.':'새 태그로 추가합니다.'}</small></span><i>NEW</i></button>}
   {!suggestions.length&&!queryParts.name&&<div className="tag-suggestion-empty">사용할 태그를 입력하세요.</div>}
  </div>}
 </div>
}
