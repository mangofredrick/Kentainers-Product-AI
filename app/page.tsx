"use client";
import {useState, type CSSProperties} from "react";

type Message={role:"user"|"assistant";text:string;sources?:{document:string;page?:number}[];enquiryId?:string};

const capabilities=[
 {icon:"◈",title:"Product Intelligence",text:"Find products by capacity, application, product code and customer requirement."},
 {icon:"▣",title:"Technical Q&A",text:"Ask technical questions and receive answers grounded in the Kentainers knowledge library."},
 {icon:"KSh",title:"Price Guidance",text:"Use indexed pricing evidence and request delivery location when a price is zonal."}
];

const technicalQuestions=[
 "What technical factors should I consider when selecting a tank?",
 "What is the difference between the available tank applications?",
 "What installation information is available for this product?",
 "What are the key specifications of this product?"
];

export default function Home(){
 const[input,setInput]=useState("");
 const[customerName,setCustomerName]=useState("");
 const[customerEmail,setCustomerEmail]=useState("");
 const[customerPhone,setCustomerPhone]=useState("");
 const[enquiryId,setEnquiryId]=useState("");
 const[loading,setLoading]=useState(false);
 const[messages,setMessages]=useState<Message[]>([{role:"assistant",text:"Welcome to the Kentainers Product Chatbot. Enter the customer's details and ask me about a product, price, technical specification or customer requirement."}]);

 function newEnquiry(){
  setCustomerName("");setCustomerEmail("");setCustomerPhone("");setEnquiryId("");setInput("");
  setMessages([{role:"assistant",text:"New customer enquiry started. Enter the customer's name, email and phone number, then ask your product or technical question."}]);
 }

 function useQuestion(question:string){
  setInput(question);
  window.setTimeout(()=>document.getElementById("chat-input")?.focus(),0);
 }

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
   setMessages(m=>[...m,{role:"assistant",text:data.answer||"I could not process that request.",enquiryId:data.enquiryId}]);
  }catch{
   setMessages(m=>[...m,{role:"assistant",text:"The service is temporarily unavailable. Please try again."}]);
  }finally{setLoading(false);}
 }

 return <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#eef7fb 0%,#f7fafc 45%,#eaf3f8 100%)",padding:"28px 18px 50px"}}>
  <div style={{maxWidth:1180,margin:"0 auto"}}>
   <header style={{position:"relative",overflow:"hidden",borderRadius:26,padding:"34px 36px",background:"linear-gradient(135deg,#073b4c 0%,#0b6078 55%,#118ab2 100%)",color:"white",boxShadow:"0 18px 45px rgba(7,59,76,.18)"}}>
    <div style={{position:"absolute",right:-60,top:-90,width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.08)"}}/>
    <div style={{position:"relative",display:"flex",justifyContent:"space-between",gap:25,alignItems:"center",flexWrap:"wrap"}}>
     <div>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:999,background:"rgba(255,255,255,.12)",fontSize:12,fontWeight:800,letterSpacing:.6}}>KENTAINERS • PRODUCT INTELLIGENCE</div>
      <h1 style={{fontSize:"clamp(30px,5vw,48px)",lineHeight:1.05,margin:"17px 0 10px",letterSpacing:-1.2}}>Kentainers Product Chatbot</h1>
      <p style={{maxWidth:720,fontSize:16,lineHeight:1.6,margin:0,color:"rgba(255,255,255,.86)"}}>A grounded sales and technical assistant for Kentainers products, customer enquiries and verified price information.</p>
     </div>
     <div style={{minWidth:150,textAlign:"center",padding:"18px 20px",borderRadius:18,background:"rgba(255,255,255,.1)",backdropFilter:"blur(8px)"}}>
      <div style={{fontSize:28,fontWeight:900}}>AI</div>
      <div style={{fontSize:12,opacity:.8,marginTop:3}}>Knowledge Grounded</div>
     </div>
    </div>
   </header>

   <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14,margin:"18px 0"}}>
    {capabilities.map(c=><div key={c.title} style={{background:"rgba(255,255,255,.9)",border:"1px solid #dce8ee",borderRadius:18,padding:"18px 19px",boxShadow:"0 7px 24px rgba(18,59,76,.06)"}}><div style={{fontSize:12,fontWeight:900,color:"#0b6078",letterSpacing:.7}}>{c.icon}</div><h3 style={{margin:"8px 0 6px",fontSize:16}}>{c.title}</h3><p style={{margin:0,color:"#60717c",fontSize:13,lineHeight:1.5}}>{c.text}</p></div>)}
   </section>

   <section style={{background:"rgba(255,255,255,.92)",border:"1px solid #dbe7ed",borderRadius:20,padding:"18px 20px",marginBottom:18,boxShadow:"0 8px 28px rgba(18,59,76,.06)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
     <div><div style={{fontWeight:900,fontSize:16}}>Technical Q&A</div><div style={{fontSize:12,color:"#6b7b84",marginTop:3}}>Try a technical question from the knowledge library.</div></div>
     <div style={{fontSize:11,fontWeight:800,color:"#087f5b",background:"#e8f8f1",padding:"7px 10px",borderRadius:999}}>SOURCE-GROUNDED</div>
    </div>
    <div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:13}}>
     {technicalQuestions.map(q=><button key={q} onClick={()=>useQuestion(q)} style={chipStyle}>{q}</button>)}
    </div>
   </section>

   <div style={{background:"rgba(255,255,255,.96)",border:"1px solid #dbe7ed",borderRadius:24,boxShadow:"0 14px 40px rgba(18,59,76,.1)",overflow:"hidden"}}>
    <section style={{padding:"20px 22px",borderBottom:"1px solid #e5edf1",background:"linear-gradient(180deg,#ffffff,#f8fbfc)"}}>
     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:15,flexWrap:"wrap"}}>
      <div><div style={{fontWeight:900,fontSize:17}}>Customer enquiry</div><div style={{fontSize:12,color:"#6b7b84",marginTop:3}}>Capture contact details before discussing the requirement.</div></div>
      <div style={{display:"flex",alignItems:"center",gap:9}}>{enquiryId&&<span style={{fontSize:11,fontWeight:800,color:"#087f5b",background:"#e8f8f1",padding:"7px 10px",borderRadius:999}}>Saved • {enquiryId}</span>}<button onClick={newEnquiry} disabled={loading} style={{padding:"9px 13px",border:"1px solid #cbd9e0",borderRadius:10,background:"white",fontWeight:800,color:"#174b5f",cursor:"pointer"}}>New enquiry</button></div>
     </div>
     <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10,marginTop:16}}>
      <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Customer name" style={inputStyle}/>
      <input type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} placeholder="Customer email" style={inputStyle}/>
      <input type="tel" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Customer phone number" style={inputStyle}/>
     </div>
    </section>

    <section style={{padding:"8px 22px 18px",minHeight:390,maxHeight:560,overflowY:"auto",background:"#fbfdfe"}}>
     {messages.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",margin:"14px 0"}}>
      <div style={{maxWidth:"82%",padding:"14px 16px",borderRadius:m.role==="user"?"18px 18px 5px 18px":"18px 18px 18px 5px",background:m.role==="user"?"linear-gradient(135deg,#0b6078,#118ab2)":"#f0f5f7",color:m.role==="user"?"white":"#24353d",boxShadow:"0 4px 12px rgba(0,0,0,.05)"}}>
       <div style={{fontSize:11,fontWeight:900,opacity:.72,marginBottom:6}}>{m.role==="user"?"YOU":"CHATBOT"}</div>
       <div style={{whiteSpace:"pre-wrap",lineHeight:1.55,fontSize:14}}>{m.text}</div>
       {m.enquiryId?<div style={{marginTop:8,fontSize:10,color:"#087f5b",fontWeight:900}}>ENQUIRY SAVED: {m.enquiryId}</div>:null}
      </div>
     </div>)}
     {loading&&<div style={{display:"flex",alignItems:"center",gap:9,color:"#60717c",fontSize:13,padding:"10px 2px"}}><span style={{width:8,height:8,borderRadius:"50%",background:"#118ab2",display:"inline-block"}}/> Chatbot is checking the Kentainers knowledge base…</div>}
    </section>

    <section style={{padding:"16px 22px 22px",borderTop:"1px solid #e4edf1",background:"white"}}>
     <div style={{display:"flex",gap:10,alignItems:"stretch"}}>
      <input id="chat-input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about a product, price, dimensions, application or technical requirement…" style={{...inputStyle,flex:1,fontSize:14,padding:"14px 15px"}}/>
      <button onClick={send} disabled={loading||!input.trim()} style={{minWidth:125,padding:"0 18px",border:0,borderRadius:12,background:loading||!input.trim()?"#b8c7ce":"#073b4c",color:"white",fontWeight:900,cursor:loading?"wait":"pointer"}}>{loading?"Checking…":"Ask Chatbot"}</button>
     </div>
     <div style={{fontSize:10,color:"#7a8990",marginTop:9}}>Answers are grounded in available Kentainers catalogue, technical library and website evidence. Confirm current commercial and engineering details before final quotation or installation.</div>
    </section>
   </div>
  </div>
 </main>
}

const inputStyle:CSSProperties={padding:"11px 12px",border:"1px solid #ccdbe2",borderRadius:10,outline:"none",background:"white",color:"#1e3038",fontSize:14};
const chipStyle:CSSProperties={border:"1px solid #cbdde5",background:"#f6fbfd",color:"#174b5f",borderRadius:999,padding:"9px 12px",fontSize:12,fontWeight:800,cursor:"pointer"};
