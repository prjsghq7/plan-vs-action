type FormControl=HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement

function isFormControl(element:Element):element is FormControl{
 return element instanceof HTMLInputElement||element instanceof HTMLSelectElement||element instanceof HTMLTextAreaElement
}

function fieldLabel(control:FormControl){
 const explicitLabel=control.id?control.form?.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(control.id)}"]`):null
 const label=explicitLabel??control.closest('label')
 const directText=label?Array.from(label.childNodes).filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent?.trim()).filter(Boolean).join(' '):''
 return directText||control.getAttribute('aria-label')||control.getAttribute('placeholder')||'필수 입력값'
}

function validationMessage(control:FormControl){
 const label=fieldLabel(control)
 if(control.validity.valueMissing)return `${label} 항목을 입력해 주세요.`
 if(control.validity.rangeUnderflow&&'min' in control)return `${label} 항목은 ${control.min} 이상으로 입력해 주세요.`
 if(control.validity.rangeOverflow&&'max' in control)return `${label} 항목은 ${control.max} 이하로 입력해 주세요.`
 if(control.validity.tooShort&&'minLength' in control)return `${label} 항목은 ${control.minLength}자 이상 입력해 주세요.`
 if(control.validity.tooLong&&'maxLength' in control)return `${label} 항목은 ${control.maxLength}자 이하로 입력해 주세요.`
 return `${label} 항목을 올바르게 입력해 주세요.`
}

export function validateForm(form:HTMLFormElement){
 const controls=Array.from(form.elements).filter((element):element is FormControl=>isFormControl(element)&&!element.disabled)
 controls.forEach(control=>control.removeAttribute('aria-invalid'))
 const invalid=controls.find(control=>!control.validity.valid)
 if(!invalid)return ''
 invalid.setAttribute('aria-invalid','true')
 const clear=()=>invalid.removeAttribute('aria-invalid')
 invalid.addEventListener('input',clear,{once:true})
 invalid.addEventListener('change',clear,{once:true})
 invalid.focus()
 return validationMessage(invalid)
}
