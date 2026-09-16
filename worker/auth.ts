import { connect } from 'cloudflare:sockets'

export type AuthBindings={SMTP_HOST?:string;SMTP_PORT?:string;SMTP_USER?:string;SMTP_PASS?:string;MAIL_FROM?:string;AUTH_SECRET?:string}
export const sessionTtlSeconds=60*30
export const verificationTtlMinutes=15
const encoder=new TextEncoder()
const encode=(value:Uint8Array)=>btoa(String.fromCharCode(...value))
const bytes=(value:string)=>encoder.encode(value)

export const token=()=>encode(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
export const code=()=>String(Math.floor(100000+Math.random()*900000))
export async function digest(value:string){return encode(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes(value))))}
export async function sign(value:string,secret:string){const key=await crypto.subtle.importKey('raw',bytes(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return encode(new Uint8Array(await crypto.subtle.sign('HMAC',key,bytes(value))))}
export async function password(password:string,salt?:string){const actualSalt=salt??encode(crypto.getRandomValues(new Uint8Array(16)));const key=await crypto.subtle.importKey('raw',bytes(password),'PBKDF2',false,['deriveBits']);const derived=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:bytes(actualSalt),iterations:310000},key,256);return {salt:actualSalt,hash:encode(new Uint8Array(derived))}}
export function same(left:string,right:string){const a=bytes(left),b=bytes(right);return a.length===b.length&&crypto.subtle.timingSafeEqual(a,b)}
export function readCookie(request:Request,name:string){return request.headers.get('Cookie')?.split(';').map(item=>item.trim()).find(item=>item.startsWith(`${name}=`))?.slice(name.length+1)}

export async function sendVerificationEmail(env:AuthBindings,to:string,value:string,type:'signup'|'password_reset'='signup'){
 if(!env.SMTP_HOST||!env.SMTP_PORT||!env.SMTP_USER||!env.SMTP_PASS||!env.MAIL_FROM)throw new Error('이메일 발송 설정이 없습니다. .dev.vars를 확인해 주세요.')
 const socket=connect({hostname:env.SMTP_HOST,port:Number(env.SMTP_PORT)},{secureTransport:'on',allowHalfOpen:false})
 const reader=socket.readable.getReader(),writer=socket.writable.getWriter(),decoder=new TextDecoder();let pending=''
 const response=async(expected:number)=>{for(;;){const end=pending.indexOf('\n');if(end<0){const chunk=await reader.read();if(chunk.done)throw new Error('SMTP 연결이 예기치 않게 종료되었습니다.');pending+=decoder.decode(chunk.value,{stream:true});continue}const line=pending.slice(0,end).replace(/\r$/,'');pending=pending.slice(end+1);if(!line.startsWith(String(expected)))throw new Error(`SMTP 오류: ${line}`);if(line.startsWith(`${expected} `))return}}
 const command=async(value:string,expected:number)=>{await writer.write(encoder.encode(`${value}\r\n`));await response(expected)}
 try{await response(220);await command('EHLO plan-vs-action',250);await command('AUTH LOGIN',334);await command(btoa(env.SMTP_USER),334);await command(btoa(env.SMTP_PASS.replace(/\s/g,'')),235);await command(`MAIL FROM:<${env.MAIL_FROM}>`,250);await command(`RCPT TO:<${to}>`,250);await command('DATA',354);const reset=type==='password_reset',title=reset?'비밀번호 재설정 인증번호':'회원가입 이메일 인증번호',heading=reset?'비밀번호를 다시 설정해 주세요.':'Plan vs Action 가입을 완료해 주세요.',body=reset?'비밀번호 재설정을 위해 아래 인증번호를 입력해 주세요.':'아래 인증번호를 입력해 이메일 인증을 완료해 주세요.',html=`<div style="max-width:520px;margin:0 auto;padding:40px 24px;background:#f7f8fa;font-family:Arial,sans-serif;color:#292a2e"><div style="font-size:24px;font-weight:800"><span style="color:#9c741f">Plan</span><span style="color:#858187;font-size:14px"> vs </span><span style="color:#526d9c">Action</span></div><div style="margin-top:28px;padding:28px;border:1px solid #dedfe2;border-radius:14px;background:#fff"><p style="margin:0 0 10px;color:#8b6a16;font-size:12px;font-weight:800;letter-spacing:1px">${title.toUpperCase()}</p><h1 style="margin:0 0 14px;font-size:24px">${heading}</h1><p style="margin:0;color:#60656d;line-height:1.7">${body}</p><p style="margin:24px 0;padding:17px;border-radius:8px;background:#f7f1de;color:#705d24;font-size:28px;font-weight:800;letter-spacing:8px;text-align:center">${value}</p><p style="margin:0;color:#858a92;font-size:13px">인증번호는 ${verificationTtlMinutes}분 뒤 만료됩니다.</p></div></div>`;await command(`From: Plan vs Action <${env.MAIL_FROM}>\r\nTo: ${to}\r\nSubject: [Plan vs Action] ${title}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n.`,250);await writer.write(encoder.encode('QUIT\r\n'))}finally{writer.releaseLock();reader.releaseLock();await socket.close()}
}
