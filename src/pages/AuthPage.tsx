import {navigate} from '../lib/router'
import {api} from '../lib/api'
import {useState} from 'react'
import {Notice} from '../components/Notice'
import '../auth.css'

type AuthMode='login'|'signup'|'verify-email'|'reset-password'

function Brand(){
 return <button className="brand brand-button auth-brand" onClick={()=>navigate('/login')} aria-label="Plan vs Action 로그인으로 이동">
  <span>Plan</span><i>vs</i><strong>Action</strong>
 </button>
}

function AuthIntro(){
 return <section className="auth-intro">
  <Brand/>
  <div className="auth-intro-copy">
   <h1><span>계획은 선명하게,</span><br/><strong>기록은 나에게만.</strong></h1>
   <p>계획한 시간과 실제로 쓴 시간을 기록하고<br/>그 차이를 돌아보며 다음 계획을 다듬어 보세요.</p>
   <ul className="auth-feature-list">
    <li><i aria-hidden="true"/><span><b>계획</b>할 일과 예상 시간을 정리합니다.</span></li>
    <li><i aria-hidden="true"/><span><b>실행</b>실제로 사용한 시간을 기록합니다.</span></li>
    <li><i aria-hidden="true"/><span><b>회고</b>계획과 실제의 차이를 돌아봅니다.</span></li>
   </ul>
  </div>
 </section>
}

function LoginForm(){
 const [error,setError]=useState(''),[submitting,setSubmitting]=useState(false)
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(submitting)return;const form=new FormData(event.currentTarget);setSubmitting(true);try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:form.get('email'),password:form.get('password')})});navigate('/',true)}catch(cause){setError((cause as Error).message);setSubmitting(false)}}
 return <>
  <header className="auth-card-head"><span className="auth-eyebrow">WELCOME BACK</span><h2>다시 만나서 반가워요.</h2><p>내 기록을 이어서 확인해 보세요.</p></header>
  <form className="auth-form" onSubmit={submit} noValidate>
   <label>이메일<input type="email" name="email" placeholder="name@example.com" autoComplete="email"/></label>
   <label>비밀번호<span className="auth-label-row"><button type="button" onClick={()=>navigate('/reset-password')}>비밀번호를 잊었나요?</button></span><input type="password" name="password" placeholder="비밀번호를 입력하세요" autoComplete="current-password"/></label>
   <button className="auth-submit" type="submit" disabled={submitting}>{submitting?'로그인 중…':<>로그인 <span>→</span></>}</button>
  </form>
  <p className="auth-switch">아직 계정이 없나요? <button onClick={()=>navigate('/signup')}>이메일로 가입하기</button></p>
  <Notice message={error} onClose={()=>setError('')}/></>
}

function SignupForm(){
 const [error,setError]=useState(''),[submitting,setSubmitting]=useState(false)
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(submitting)return;const form=new FormData(event.currentTarget);setSubmitting(true);try{const result=await api<{flowId:string;flowToken:string}>('/api/auth/signup',{method:'POST',body:JSON.stringify({email:form.get('email')})});sessionStorage.setItem('pva:verify-email',String(form.get('email')));sessionStorage.setItem('pva:flow-id',result.flowId);sessionStorage.setItem('pva:flow-token',result.flowToken);navigate('/verify-email')}catch(cause){setError((cause as Error).message);setSubmitting(false)}}
 return <>
  <header className="auth-card-head"><span className="auth-eyebrow">CREATE ACCOUNT</span><h2>나만의 기록을 시작하세요.</h2><p>이메일 확인 후 계정을 만들 수 있습니다.</p></header>
  <form className="auth-form" onSubmit={submit} noValidate>
   <label>이메일<input type="email" name="email" placeholder="name@example.com" autoComplete="email"/></label>
   <button className="auth-submit" type="submit" disabled={submitting}>{submitting?'인증메일 보내는 중…':<>인증메일 받기 <span>→</span></>}</button>
  </form>
  <p className="auth-policy">가입하면 서비스 이용 안내와 개인정보 처리 안내를 확인한 것으로 봅니다.</p>
  <p className="auth-switch">이미 계정이 있나요? <button onClick={()=>navigate('/login')}>로그인</button></p>
  <Notice message={error} onClose={()=>setError('')}/></>
}

function VerifyEmail(){
 const [code,setCode]=useState(''),[error,setError]=useState(''),[verified,setVerified]=useState(false),[submitting,setSubmitting]=useState(false)
 async function resend(){if(submitting)return;setSubmitting(true);try{const email=sessionStorage.getItem('pva:verify-email');const result=await api<{flowId:string;flowToken:string}>('/api/auth/signup',{method:'POST',body:JSON.stringify({email})});sessionStorage.setItem('pva:flow-id',result.flowId);sessionStorage.setItem('pva:flow-token',result.flowToken);setCode('')}catch(cause){setError((cause as Error).message)}finally{setSubmitting(false)}}
 async function verify(){if(submitting)return;setSubmitting(true);try{await api('/api/auth/verify-email',{method:'POST',body:JSON.stringify({email:sessionStorage.getItem('pva:verify-email'),code,flowId:sessionStorage.getItem('pva:flow-id'),flowToken:sessionStorage.getItem('pva:flow-token')})});setVerified(true)}catch(cause){setError((cause as Error).message)}finally{setSubmitting(false)}}
 async function complete(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(submitting)return;const form=new FormData(event.currentTarget);if(form.get('password')!==form.get('passwordConfirm'))return setError('비밀번호 확인이 일치하지 않습니다.');setSubmitting(true);try{await api('/api/auth/complete-signup',{method:'POST',body:JSON.stringify({flowId:sessionStorage.getItem('pva:flow-id'),flowToken:sessionStorage.getItem('pva:flow-token'),name:form.get('name'),password:form.get('password')})});['pva:verify-email','pva:flow-id','pva:flow-token'].forEach(key=>sessionStorage.removeItem(key));navigate('/',true)}catch(cause){setError((cause as Error).message);setSubmitting(false)}}
 return <section className="auth-verify">
  <div className="auth-mail-icon" aria-hidden="true"><span/><i>✓</i></div>
  <span className="auth-eyebrow">VERIFY YOUR EMAIL</span>
  <h2>이메일 인증을 완료해 주세요.</h2>
  <p>{verified?'비밀번호를 설정하면 가입이 완료됩니다.':'입력한 이메일로 보낸 인증번호를 확인해 주세요.'}</p>
  <div className="auth-verify-steps"><span className="done"><i>1</i>가입 정보 입력</span><b/><span><i>2</i>이메일 확인</span><b/><span><i>3</i>로그인</span></div>
  {!verified?<><label className="auth-verify-code"><span>인증번호<button type="button" onClick={resend} disabled={submitting}>{submitting?'보내는 중…':'인증메일 다시 보내기'}</button></span><input value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" placeholder="인증번호 6자리" autoFocus/></label><button className="auth-submit" onClick={verify} disabled={code.length!==6||submitting}>{submitting?'확인 중…':'인증 완료하기'}</button></>:<form className="auth-form" onSubmit={complete}><label>이름<input name="name" autoComplete="name" placeholder="이름을 입력하세요" required/></label><label>비밀번호<input name="password" type="password" autoComplete="new-password" required/><small>8자 이상, 영문과 숫자를 함께 입력해 주세요.</small></label><label>비밀번호 확인<input name="passwordConfirm" type="password" autoComplete="new-password" required/></label><button className="auth-submit" disabled={submitting}>{submitting?'가입 중…':'가입 완료하기'}</button></form>}
  <Notice message={error} onClose={()=>setError('')}/>
  <button className="auth-text-button" onClick={()=>navigate('/signup')}>이메일 주소 다시 입력하기</button>
 </section>
}

function ResetPassword(){
 const [step,setStep]=useState<'email'|'code'|'password'>('email'),[email,setEmail]=useState(''),[code,setCode]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 async function request(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);try{const result=await api<{flowId?:string;flowToken?:string}>('/api/auth/password-reset/request',{method:'POST',body:JSON.stringify({email})});if(!result.flowId||!result.flowToken)throw new Error('등록된 이메일을 확인해 주세요.');sessionStorage.setItem('pva:reset-id',result.flowId);sessionStorage.setItem('pva:reset-token',result.flowToken);setStep('code')}catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
 async function verify(){setBusy(true);try{await api('/api/auth/password-reset/verify',{method:'POST',body:JSON.stringify({flowId:sessionStorage.getItem('pva:reset-id'),flowToken:sessionStorage.getItem('pva:reset-token'),code})});setStep('password')}catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
 async function complete(event:React.FormEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget);if(form.get('password')!==form.get('confirm'))return setError('비밀번호 확인이 일치하지 않습니다.');setBusy(true);try{await api('/api/auth/password-reset/complete',{method:'POST',body:JSON.stringify({flowId:sessionStorage.getItem('pva:reset-id'),flowToken:sessionStorage.getItem('pva:reset-token'),password:form.get('password')})});sessionStorage.removeItem('pva:reset-id');sessionStorage.removeItem('pva:reset-token');navigate('/login',true)}catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
 return <><header className="auth-card-head"><span className="auth-eyebrow">RESET PASSWORD</span><h2>비밀번호를 재설정하세요.</h2><p>{step==='email'?'가입한 이메일을 입력해 주세요.':step==='code'?'이메일로 보낸 인증번호를 입력해 주세요.':'새 비밀번호를 설정해 주세요.'}</p></header>{step==='email'?<form className="auth-form" onSubmit={request} noValidate><label>이메일<input value={email} onChange={event=>setEmail(event.target.value)} type="email" required/></label><button className="auth-submit" disabled={busy}>{busy?'인증메일 보내는 중…':'인증메일 받기'}</button></form>:step==='code'?<><label className="auth-verify-code">인증번호<input value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))}/></label><button className="auth-submit" onClick={verify} disabled={busy||code.length!==6}>{busy?'확인 중…':'인증 완료하기'}</button></>:<form className="auth-form" onSubmit={complete} noValidate><label>새 비밀번호<input name="password" type="password" required/><small>8자 이상, 영문과 숫자를 함께 입력해 주세요.</small></label><label>새 비밀번호 확인<input name="confirm" type="password" required/></label><button className="auth-submit" disabled={busy}>{busy?'저장 중…':'새 비밀번호 저장'}</button></form>}<Notice message={error} onClose={()=>setError('')}/><p className="auth-switch"><button onClick={()=>navigate('/login')}>로그인으로 돌아가기</button></p></>
}

export function AuthPage({mode,notice='',onNoticeClose=()=>{}}:{mode:AuthMode;notice?:string;onNoticeClose?:()=>void}){
 return <main className="auth-shell">
  <AuthIntro/>
  <section className="auth-panel">
   <div className="auth-mobile-brand"><Brand/></div>
   <div className="auth-card">
    {mode==='login'?<LoginForm/>:mode==='signup'?<SignupForm/>:mode==='verify-email'?<VerifyEmail/>:<ResetPassword/>}
   </div>
   <Notice message={notice} onClose={onNoticeClose}/>
   <small className="auth-copyright">© 2026 Plan vs Action</small>
  </section>
 </main>
}
