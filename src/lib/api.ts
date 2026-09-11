export async function api<T>(url:string,options?:RequestInit):Promise<T>{
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options?.headers??{})}})
  const data=await response.json()
  if(!response.ok)throw new Error(data.error??'요청에 실패했습니다.')
  return data
}
