import {useEffect} from 'react'

function noticeTone(message:string){
 return /(저장|추가|수정).*했습니다|남겼습니다/.test(message)?'success':'error'
}

export function Notice({message,onClose}:{message:string;onClose:()=>void}){
 useEffect(()=>{
  if(!message)return
  const timeout=window.setTimeout(onClose,4000)
  return()=>window.clearTimeout(timeout)
 },[message,onClose])

 if(!message)return null
 const tone=noticeTone(message)
 return <div className={`notice ${tone}`} role={tone==='error'?'alert':'status'} aria-live={tone==='error'?'assertive':'polite'}>
  <span className="notice-mark" aria-hidden="true">{tone==='success'?'✓':'!'}</span>
  <span className="notice-message">{message}</span>
  <button type="button" className="notice-close" onClick={onClose} aria-label="알림 닫기">×</button>
 </div>
}
