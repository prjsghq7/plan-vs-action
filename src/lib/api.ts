export const SESSION_EXPIRED_EVENT='pva:session-expired'

const publicAuthPaths=[
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-email',
  '/api/auth/complete-signup',
  '/api/auth/password-reset/'
]

function isProtectedRequest(url:string){
  return !publicAuthPaths.some(path=>url===path||url.startsWith(path))
}

async function request(url:string,options?:RequestInit){
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options?.headers??{})}})
  if(response.status===401&&isProtectedRequest(url))window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  return response
}

async function responseError(response:Response){
  const data=await response.json().catch(()=>({error:'요청에 실패했습니다.'})) as {error?:string}
  return new Error(data.error??'요청에 실패했습니다.')
}

export async function api<T>(url:string,options?:RequestInit):Promise<T>{
  const response=await request(url,options)
  if(!response.ok)throw await responseError(response)
  return response.json() as Promise<T>
}

export async function downloadFile(url:string){
  const response=await request(url)
  if(!response.ok)throw await responseError(response)
  const disposition=response.headers.get('Content-Disposition')??''
  const filename=disposition.match(/filename="?([^";]+)"?/i)?.[1]??'download.json'
  const objectUrl=URL.createObjectURL(await response.blob())
  const link=document.createElement('a')
  link.href=objectUrl
  link.download=filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}
