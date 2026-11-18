// On-page preparation only. No submission, remote API, storage or analytics.
const enquiryForm=document.getElementById('enquiry-form');
const enquirySteps=Array.from(enquiryForm.querySelectorAll('fieldset'));
const progressSteps=Array.from(document.querySelectorAll('.form-progress li'));
let enquiryStep=0;
let enquiryText='';
function currentFieldsValid(){
 for(const field of enquirySteps[enquiryStep].querySelectorAll('input,select,textarea')){
  if(field.required&&field.value.trim()===''){field.setCustomValidity('Please complete this field.');}
  else field.setCustomValidity('');
  if(!field.reportValidity())return false;
 }
 return true;
}
function showEnquiryStep(step){
 enquiryStep=step;
 enquirySteps.forEach((el,i)=>el.hidden=i!==step);
 progressSteps.forEach((el,i)=>{if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 if(step===2)prepareEnquiry();
 const first=enquirySteps[step].querySelector('input,select,textarea,a');
 if(first)first.focus({preventScroll:true});
 enquiryForm.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
function prepareEnquiry(){
 const data=Object.fromEntries(new FormData(enquiryForm));
 for(const key of Object.keys(data))data[key]=data[key].trim();
 const rows=[['Focus',data.programme],['Team',data.teamType],['Group size',data.teamSize],['Objectives',data.goals],['Name',data.name],['Organisation',data.company],['Reply email',data.email],['Timing',data.timing||'Flexible / to discuss'],['Location',data.location||'To discuss']];
 const summary=document.getElementById('enquiry-summary');summary.replaceChildren();
 for(const [label,value] of rows){const row=document.createElement('div');const term=document.createElement('dt');const detail=document.createElement('dd');term.textContent=label;detail.textContent=value;row.append(term,detail);summary.append(row);}
 enquiryText='Hello Geetha,\n\nI’d like to discuss training with Orked Academy.\n\n'+rows.map(([key,value])=>key+': '+value).join('\n\n')+'\n\nThank you,\n'+data.name;
 document.getElementById('email-enquiry').href='mailto:amelia@themetkl.com?cc=geetha@themetkl.com&subject='+encodeURIComponent('Orked Academy training enquiry | '+data.company)+'&body='+encodeURIComponent(enquiryText);
 document.getElementById('enquiry-status').textContent='';
 document.getElementById('copy-fallback').hidden=true;
}
enquiryForm.querySelectorAll('.next-step').forEach(button=>button.addEventListener('click',()=>{if(currentFieldsValid())showEnquiryStep(Math.min(2,enquiryStep+1));}));
enquiryForm.querySelectorAll('.back-step').forEach(button=>button.addEventListener('click',()=>showEnquiryStep(enquiryStep-1)));
enquiryForm.addEventListener('submit',event=>{event.preventDefault();if(enquiryStep<2&&currentFieldsValid())showEnquiryStep(enquiryStep+1);});
enquiryForm.addEventListener('input',event=>{if(event.target.setCustomValidity)event.target.setCustomValidity('');});
document.querySelectorAll('[data-programme]').forEach(link=>link.addEventListener('click',()=>{document.getElementById('programme-interest').value=link.dataset.programme;enquiryStep=0;enquirySteps.forEach((el,i)=>el.hidden=i!==0);progressSteps.forEach((el,i)=>{if(i===0)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}));
document.getElementById('copy-enquiry').addEventListener('click',async()=>{
 const status=document.getElementById('enquiry-status');
 try{await navigator.clipboard.writeText(enquiryText);status.textContent='Enquiry copied. Paste it into an email to amelia@themetkl.com.';}
 catch{const fallback=document.getElementById('copy-fallback');fallback.value=enquiryText;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Select and copy the prepared text below, then email it to amelia@themetkl.com.';}
});
