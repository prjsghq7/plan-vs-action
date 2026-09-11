import type {ReactNode} from 'react'
import {navigate} from '../lib/router'

export function BackButton({to,children}:{to:string;children:ReactNode}){
 return <button type="button" className="back-button" onClick={()=>navigate(to)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4-6 6 6 6"/></svg><span>{children}</span></button>
}
