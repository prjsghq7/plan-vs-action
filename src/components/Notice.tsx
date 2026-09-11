export function Notice({message,onClose}:{message:string;onClose:()=>void}){return message?<button className="notice" onClick={onClose}>{message} ×</button>:null}
