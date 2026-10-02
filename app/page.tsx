"use client";
import {useState} from "react";
type Message={role:"user"|"assistant";text:string;sources?:{document:string;page?:number}[];enquiryId?:string};
export default function Home(){
 const[input,setInput]=useState("");
 const[customerName,setCustomerName]=useState("");
 const[customerEmail,setCustomerEmail]=useState("");
 const[customerPhone,setCustomerPhone]=useState("");
 const[enquiryId,setEnquiryId]=useState("");
 const[loading,setLoading]=useState(false);
 const[messages,setMessages]=useState<Message[]>([{role:"assistant",text:"Hello. I’m the Kentainers Product Chatbot. Enter the customer details, then ask a product question. I’ll use the Kentainers knowledge base to identify relevant products, prices and clarification requirements."}]);
 function newEnquiry(){setCustomerName("");setCustomerEmail("");setCustomerPhone("");setEnquiryId("");setInput("");setMessages([{role:"assistant",text:"New customer enquiry started. Enter the customer's name, email and phone number, then ask a product question."}]);}
 async function send(){
  const question=input.trim();
  if(!question||loading)return;
  const customerContext=`Customer name: ${customerName.trim()||"Not provided"}\nCustomer email: ${customerEmail.trim()||"Not provided"}\nCustomer phone: ${customerPhone.trim()||"Not provided"}`;
  const message=`${customerContext}\n\nProduct question: ${question}`;
  setInput("");
  setMessages(m=>[...m,{role:"user",text:question}]);
  setLoading(true);
  try{
   const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,customer:{name:customerName,email:customerEmail,phone:customerPhone}})});
   const data=await res.json();
   if(data.enquiryId)setEnquiryId(data.enquiryId);
   setMessages(m=>[...m,{role:"assistant",text:data.answer||"I could not process that request.",sources:data.sources,enquiryId:data.enquiryId}]);
  }catch{setMessages(m=>[...m,{role:"assistant",text:"The service is temporarily unavailable. Please try again."}]);}
  finally{setLoading(false);}
 }
 return <main style={{maxWidth:1100,margin:"30px auto",padding:"0 20px"}}><div style={{background:"white",borderRadius:16,padding:28,boxShadow:"0 5px 25px rgba(0,0,0,.08)"}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:15,alignItems:"center",flexWrap:"wrap"}}><div><h1 style={{marginTop:0,marginBottom:6}}>Kentainers Product Chatbot</h1><p style={{color:"#58636f",marginTop:0}}>AI-powered product selection, pricing and customer enquiry support for Kentainers sales representatives.</p></div><button onClick={newEnquiry} disabled={loading} style={{padding:"10px 14px",border:"1px solid #ccd3da",borderRadius:9,background:"white",fontWeight:700}}>New Customer Enquiry</button></div>
  <section style={{background:"#f8fafc",padding:18,borderRadius:12,margin:"20px 0"}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><strong>Customer details</strong>{enquiryId?<span style={{fontSize:12,color:"#286749",fontWeight:700}}>Enquiry ID: {enquiryId}</span>:null}</div>
   <p style={{margin:"6px 0 14px",fontSize:13,color:"#58636f"}}>Capture the customer's contact details so the product discussion can be saved as a customer enquiry.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
    <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Customer name" style={{padding:12,border:"1px solid #ccd3da",borderRadius:9}}/>
    <input type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} placeholder="Customer email" style={{padding:12,border:"1px solid #ccd3da",borderRadius:9}}/>
    <input type="tel" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Customer phone number" style={{padding:12,border:"1px solid #ccd3da",borderRadius:9}}/>
   </div>
  </section>
  <div style={{margin:"25px 0",minHeight:360}}>{messages.map((m,i)=><div key={i} style={{margin:"14px 0",padding:16,borderRadius:12,background:m.role==="user"?"#eef5ff":"#f3f5f7"}}><strong>{m.role==="user"?"You":"Chatbot"}</strong><div style={{marginTop:8,whiteSpace:"pre-wrap"}}>{m.text}</div>{m.sources?.length?<div style={{marginTop:10,fontSize:12,color:"#566"}}>Sources: {m.sources.map((s,j)=><span key={j}>{s.document}{s.page?`, p.${s.page}`:""}{j<m.sources!.length-1?"; ":""}</span>)}</div>:null}{m.enquiryId?<div style={{marginTop:8,fontSize:12,color:"#286749",fontWeight:700}}>Saved as customer enquiry: {m.enquiryId}</div>:null}</div>)}</div>
  <div style={{display:"flex",gap:10}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask the Kentainers Chatbot about a product, price or customer requirement" style={{flex:1,padding:14,border:"1px solid #ccd3da",borderRadius:10,fontSize:16}}/><button onClick={send} disabled={loading} style={{padding:"14px 20px",border:0,borderRadius:10,background:"#173f5f",color:"white",fontWeight:700}}>{loading?"Thinking...":"Ask Chatbot"}</button></div>
 </div></main>
}
