import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { entities, functions } from "@/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Plus, Zap, Users, HeartPulse, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import LandingHero from "@/components/home/LandingHero";
import OnboardingSetup from "@/components/home/OnboardingSetup";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import EmergencyCallingScreen from "@/components/home/EmergencyCallingScreen";
import TapToAlert from "@/components/home/TapToAlert";
import useBatteryMonitor from "@/hooks/useBatteryMonitor";
import useSmartLocation from "@/hooks/useSmartLocation";

function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function fmtDist(m) {
  if (!m) return "—";
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}
async function fetchNearby(lat, lng) {
  const r = 5000;
  const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:${r},${lat},${lng});node["amenity"="clinic"](around:${r},${lat},${lng});node["emergency"="defibrillator"](around:${r},${lat},${lng}););out body;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query, headers: { "Content-Type": "text/plain" } });
    if (!res.ok) return null;
    return (await res.json()).elements || [];
  } catch { return null; }
}
function buildStats(contacts, alerts, locAvailable, locSource, accuracy) {
  const resolved = alerts.filter(a => a.status === "resolved").length;
  const pct = Math.min(100, Math.round(30 + contacts.length * 10 + resolved * 5 + (locAvailable ? 15 : 0)));
  const src = locSource === "gps" ? "GPS" : locSource === "network" ? "Network" : "Cached";
  return [
    { pct, label: "Your safety", sub: contacts.length > 0 ? `${contacts.length} contact${contacts.length !== 1 ? "s" : ""} ready` : "Add contacts to improve" },
    { pct: locAvailable ? Math.max(30, Math.min(100, 100 - Math.round((accuracy || 200) / 5))) : 10, label: "Location accuracy", sub: locAvailable ? `${src} · ±${Math.round(accuracy || 0)}m` : "Enable location services" },
    { pct: Math.min(100, contacts.length * 20), label: "Contact coverage", sub: `${contacts.length} of 5 recommended` },
  ];
}

/* ── Metallic PANIC button ────────────────────────────────────────── */
function PanicBtn({ onStart, onEnd, active, pressing, pct }) {
  const S = 260; // SVG viewBox size
  const CX = 130, CY = 130, RO = 126, RI = 100, RD = 84;
  const circ = 2 * Math.PI * (RI + 4);
  return (
    <div style={{ width: "min(260px,72vw)", height: "min(260px,72vw)", position: "relative", margin: "0 auto" }}>
      <svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="sO" cx="38%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#E8E8E8"/><stop offset="28%" stopColor="#B8B8B8"/>
            <stop offset="58%" stopColor="#848484"/><stop offset="82%" stopColor="#606060"/>
            <stop offset="100%" stopColor="#484848"/>
          </radialGradient>
          <radialGradient id="sI" cx="42%" cy="36%" r="58%">
            <stop offset="0%" stopColor="#D4D4D4"/><stop offset="35%" stopColor="#969696"/>
            <stop offset="70%" stopColor="#626262"/><stop offset="100%" stopColor="#3E3E3E"/>
          </radialGradient>
          <radialGradient id="rN" cx="36%" cy="26%" r="68%">
            <stop offset="0%" stopColor="#FF9090"/><stop offset="18%" stopColor="#E03030"/>
            <stop offset="54%" stopColor="#AA0000"/><stop offset="80%" stopColor="#720000"/>
            <stop offset="100%" stopColor="#4A0000"/>
          </radialGradient>
          <radialGradient id="rP" cx="40%" cy="36%" r="60%">
            <stop offset="0%" stopColor="#CC3030"/><stop offset="40%" stopColor="#860000"/>
            <stop offset="100%" stopColor="#380000"/>
          </radialGradient>
          <radialGradient id="dH" cx="32%" cy="22%" r="52%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </radialGradient>
          <filter id="ds"><feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000" floodOpacity="0.55"/></filter>
          <filter id="is"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.6"/></filter>
        </defs>

        {/* Steel outer ring */}
        <circle cx={CX} cy={CY} r={RO} fill="url(#sO)" filter="url(#ds)"/>
        <circle cx={CX} cy={CY} r={RI+2} fill="none" stroke="#2C2C2C" strokeWidth="7"/>
        <circle cx={CX} cy={CY} r={RI} fill="url(#sI)"/>

        {/* 4 screws */}
        {[[CX,4],[S-4,CY],[CX,S-4],[4,CY]].map(([x,y],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="url(#sO)" stroke="#383838" strokeWidth="1.2"/>
            <line x1={x-5} y1={y} x2={x+5} y2={y} stroke="#4E4E4E" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1={x} y1={y-5} x2={x} y2={y+5} stroke="#4E4E4E" strokeWidth="1.8" strokeLinecap="round"/>
          </g>
        ))}

        {/* Hold-progress arc */}
        {pressing && pct > 0 && (
          <circle cx={CX} cy={CY} r={RI+4}
            fill="none" stroke="#FF3333" strokeWidth="7"
            strokeDasharray={`${circ*pct/100} ${circ}`}
            strokeDashoffset={circ*0.25}
            strokeLinecap="round"
            style={{ transform:`rotate(-90deg)`, transformOrigin:`${CX}px ${CY}px`, transition:"stroke-dasharray 0.03s linear" }}
          />
        )}

        {/* Red dome */}
        <circle cx={CX} cy={CY-3} r={RD} fill={pressing?"url(#rP)":"url(#rN)"} filter="url(#is)"/>
        {/* Gloss */}
        <ellipse cx={CX-16} cy={CY-36} rx="36" ry="22" fill="url(#dH)"/>
        {/* ! */}
        <text x={CX} y={CY+18} textAnchor="middle" fill="rgba(55,0,0,0.6)"
          fontSize="52" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif">!</text>

        {/* PANIC text top */}
        <path id="tA" d={`M ${CX-96},${CY} A 96,96 0 0,1 ${CX+96},${CY}`} fill="none"/>
        <text fontSize="13" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif" fill="#C8C8C8" letterSpacing="7">
          <textPath href="#tA" startOffset="22%">PANIC</textPath>
        </text>
        {/* PANIC text left */}
        <path id="lA" d={`M ${CX},${CY-96} A 96,96 0 0,0 ${CX},${CY+96}`} fill="none"/>
        <text fontSize="11" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif" fill="#989898" letterSpacing="5">
          <textPath href="#lA" startOffset="14%">PANIC</textPath>
        </text>
        {/* PANIC text right */}
        <path id="rA" d={`M ${CX},${CY+96} A 96,96 0 0,0 ${CX},${CY-96}`} fill="none"/>
        <text fontSize="11" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif" fill="#989898" letterSpacing="5">
          <textPath href="#rA" startOffset="14%">PANIC</textPath>
        </text>

        {/* Active pulse rings */}
        {active && (<>
          <circle cx={CX} cy={CY} r={RD+4} fill="none" stroke="#FF2222" strokeWidth="4" opacity="0.7">
            <animate attributeName="r" values={`${RD+4};${RD+44};${RD+4}`} dur="1.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0;0.7" dur="1.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx={CX} cy={CY} r={RD+4} fill="none" stroke="#FF5555" strokeWidth="2" opacity="0.4">
            <animate attributeName="r" values={`${RD+4};${RD+58};${RD+4}`} dur="1.3s" begin="0.35s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.3s" begin="0.35s" repeatCount="indefinite"/>
          </circle>
        </>)}
      </svg>

      {/* Invisible touch target over dome */}
      <button
        onMouseDown={onStart} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchEnd={onEnd}
        aria-label="PANIC — hold 2s to trigger SOS"
        style={{
          position:"absolute", left:"50%", top:"50%",
          transform:"translate(-50%,-50%)",
          width:"62%", height:"62%", borderRadius:"50%",
          background:"transparent", border:"none", cursor:"pointer",
          WebkitTapHighlightColor:"transparent", zIndex:10
        }}
      />
    </div>
  );
}

/* ── Teal pin tile ────────────────────────────────────────────────── */
function PinTile({ icon:Icon, label, value, dim }) {
  return (
    <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 3px" }}>
      <span style={{ fontSize:10, color:"#5A6A6E", fontWeight:600, textAlign:"center", marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>{label}</span>
      <div style={{ position:"relative", width:36, height:46, flexShrink:0 }}>
        <svg viewBox="0 0 36 46" width="36" height="46" style={{ position:"absolute", top:0, left:0 }}>
          <defs>
            <radialGradient id={`pg${label.replace(/\s/g,"")}`} cx="38%" cy="28%" r="65%">
              <stop offset="0%" stopColor="#52CCD4"/><stop offset="100%" stopColor="#168890"/>
            </radialGradient>
          </defs>
          <path d="M18 2C9.7 2 3 8.7 3 17c0 9.5 12.3 26 14.2 28.2.5.6 1.1.6 1.6 0C20.7 43 33 26.5 33 17 33 8.7 26.3 2 18 2z" fill={`url(#pg${label.replace(/\s/g,"")})`}/>
          <circle cx="18" cy="17" r="9" fill="rgba(255,255,255,0.2)"/>
        </svg>
        <div style={{ position:"absolute", top:6, left:0, right:0, display:"flex", justifyContent:"center" }}>
          <Icon size={13} color="#fff" strokeWidth={2.5}/>
        </div>
      </div>
      <span style={{ fontSize:11, color: dim ? "#8A9AA0" : "#1C3038", fontWeight:700, marginTop:2, textAlign:"center" }}>
        {value}
      </span>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */
export default function Home() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { coords, source:locSource, accuracy, unavailable:locUnavail, loading:locLoading } = useSmartLocation({ enabled: true });

  const [statIdx, setStatIdx] = useState(0);
  const [showCalling, setShowCalling] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [holdPct, setHoldPct] = useState(0);
  const [nearbyDists, setNearbyDists] = useState({ hospital:null, defib:null });
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const holdRef = useRef(null);
  const nearbyFetched = useRef(false);

  const { data:profile, isLoading:profLoad } = useQuery({ queryKey:['safetyProfile',user?.email], queryFn:()=>entities.SafetyProfile.filter({owner_email:user.email}).then(d=>d[0]||null), enabled:!!user?.email, staleTime:60000 });
  const { data:alerts=[], isLoading:alertLoad } = useQuery({ queryKey:['alerts',user?.email], queryFn:()=>entities.Alert.filter({owner_email:user.email},'-created_date',10), enabled:!!user?.email, staleTime:20000, refetchInterval:30000 });
  const { data:contacts=[], isLoading:contLoad } = useQuery({ queryKey:['contacts',user?.email], queryFn:()=>entities.EmergencyContact.filter({owner_email:user.email},'priority',20), enabled:!!user?.email, staleTime:120000 });

  const loading = profLoad || alertLoad || contLoad;
  const activeAlert = alerts.find(a=>a.status==='active')||null;
  const needsOnboarding = !loading && isAuthenticated && !profile;
  const locAvail = !!coords && !locUnavail;
  const stats = buildStats(contacts, alerts, locAvail, locSource, accuracy);

  useBatteryMonitor(user, contacts);

  const invalidateAll = useCallback(()=>{
    queryClient.invalidateQueries({queryKey:['alerts',user?.email]});
    queryClient.invalidateQueries({queryKey:['safetyProfile',user?.email]});
  },[queryClient,user?.email]);

  // Fetch nearby once GPS ready
  useEffect(()=>{
    if (!coords||nearbyFetched.current) return;
    nearbyFetched.current=true;
    setNearbyLoading(true);
    fetchNearby(coords.latitude,coords.longitude).then(els=>{
      if(!els){setNearbyLoading(false);return;}
      let mH=Infinity,mD=Infinity;
      for(const e of els){
        const d=haversineM(coords.latitude,coords.longitude,e.lat,e.lon);
        if(e.tags?.amenity==="hospital"||e.tags?.amenity==="clinic"){if(d<mH)mH=d;}
        if(e.tags?.emergency==="defibrillator"){if(d<mD)mD=d;}
      }
      setNearbyDists({hospital:mH===Infinity?null:mH,defib:mD===Infinity?null:mD});
      setNearbyLoading(false);
    });
  },[coords]);

  // Stream location → active alert
  useEffect(()=>{
    if(!activeAlert||!navigator.geolocation)return;
    const id=navigator.geolocation.watchPosition(pos=>entities.Alert.update(activeAlert.id,{latitude:pos.coords.latitude,longitude:pos.coords.longitude}),null,{enableHighAccuracy:true,maximumAge:5000});
    return()=>navigator.geolocation.clearWatch(id);
  },[activeAlert?.id]);

  // Battery push
  useEffect(()=>{
    if(!user?.email||!profile?.device_imei||!('getBattery' in navigator))return;
    const push=async()=>{
      try{
        const bat=await navigator['getBattery']?.();
        if(!bat)return;
        const info=(await import("@/hooks/useDeviceFingerprint")).getDeviceInfo();
        await functions.invoke("updateDeviceLocation",{latitude:coords?.latitude,longitude:coords?.longitude,accuracy:accuracy||null,deviceId:info.deviceId,deviceName:info.deviceName,platform:info.platform,batteryLevel:bat.level,batteryCharging:bat.charging});
      }catch{}
    };
    push();
    const iv=setInterval(push,5*60*1000);
    return()=>clearInterval(iv);
  },[user?.email,profile?.device_imei,coords,accuracy]);

  const handleResolved=async(alertId)=>{
    await entities.Alert.update(alertId,{status:'resolved',resolved_at:new Date().toISOString()});
    setShowCalling(false);invalidateAll();
  };
  const handleTriggered=useCallback(()=>{setShowCalling(true);invalidateAll();},[invalidateAll]);

  const startHold=useCallback(()=>{
    setPressing(true);setHoldPct(0);
    const t=Date.now();
    holdRef.current=setInterval(()=>{
      const p=Math.min(100,((Date.now()-t)/2000)*100);
      setHoldPct(p);
      if(p>=100){clearInterval(holdRef.current);setPressing(false);setHoldPct(0);handleTriggered();}
    },30);
  },[handleTriggered]);

  const cancelHold=useCallback(()=>{clearInterval(holdRef.current);setPressing(false);setHoldPct(0);},[]);

  if(isLoadingAuth||(isAuthenticated&&loading)) return <HomeSkeleton/>;
  if(!isAuthenticated) return <LandingHero onGetStarted={()=>navigate('/Login')}/>;
  if(!loading&&needsOnboarding) return <OnboardingSetup user={user} onComplete={invalidateAll}/>;

  const cur=stats[statIdx];
  const pinItems=[
    {label:"Emergency", icon:Plus,       value:nearbyDists.hospital!=null?fmtDist(nearbyDists.hospital):locAvail?"…":"—", dim:!locAvail},
    {label:"Defibrill.", icon:Zap,        value:nearbyDists.defib!=null?fmtDist(nearbyDists.defib):locAvail?"…":"—",     dim:!locAvail},
    {label:"Rescuers",  icon:Users,       value:String(contacts.length),                                                  dim:false},
    {label:"Users",     icon:HeartPulse,  value:"0",                                                                      dim:true},
  ];

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      width:"100%", maxWidth:480, margin:"0 auto",
      minHeight:"100dvh", height:"100dvh",
      background:"linear-gradient(180deg,#C2D8DA 0%,#D2E8EA 28%,#B4DAE0 100%)",
      overflowX:"hidden", overflowY:"auto",
      position:"relative",
    }}>
      {/* Overlays */}
      <AnimatePresence>
        {showCalling&&activeAlert&&(
          <EmergencyCallingScreen contacts={contacts} alert={activeAlert} user={user} onDismiss={()=>setShowCalling(false)}/>
        )}
      </AnimatePresence>
      <TapToAlert corner="bottom-right" onTriggered={handleTriggered}/>

      {/* Active alert strip */}
      <AnimatePresence>
        {activeAlert&&(
          <motion.div key="strip" initial={{y:-48}} animate={{y:0}} exit={{y:-48}}
            style={{position:"fixed",top:0,left:0,right:0,maxWidth:480,margin:"0 auto",height:44,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",background:"#C01818"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <motion.div animate={{opacity:[1,0.2,1]}} transition={{repeat:Infinity,duration:0.9}} style={{width:10,height:10,borderRadius:"50%",background:"#fff"}}/>
              <span style={{color:"#fff",fontWeight:900,fontSize:13}}>🚨 EMERGENCY ACTIVE</span>
            </div>
            <button onClick={()=>handleResolved(activeAlert.id)} style={{background:"#fff",color:"#B01010",fontWeight:900,fontSize:11,padding:"4px 12px",borderRadius:999,border:"none",cursor:"pointer"}}>Resolve</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER */}
      <header style={{
        flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 16px", height:52,
        background:"rgba(255,255,255,0.58)",
        backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
        borderBottom:"1px solid rgba(255,255,255,0.72)",
        marginTop: activeAlert?44:0,
      }}>
        <div style={{display:"flex",alignItems:"baseline",gap:1}}>
          <span style={{color:"#C01818",fontWeight:900,fontSize:22,lineHeight:1}}>i</span>
          <span style={{color:"#1C2A2C",fontWeight:900,fontSize:15,letterSpacing:0.5}}>
            {user?.full_name?.split(" ")[0]?`HELLO, ${user.full_name.split(" ")[0].toUpperCase()}`:"PANIC RING"}
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* GPS indicator */}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:locAvail?"#22C55E":"#F59E0B",boxShadow:locAvail?"0 0 5px #22C55E":"none"}}/>
            <span style={{fontSize:10,color:"#3A6A6E",fontWeight:600}}>
              {locLoading?"…":locUnavail?"No GPS":locSource==="gps"?"GPS":locSource==="network"?"Cell":"Cached"}
              {locAvail&&accuracy&&!locLoading?` ±${Math.round(accuracy)}m`:""}
            </span>
          </div>
          <Link to="/Settings" aria-label="Settings"><Settings size={20} color="#1C2A2C"/></Link>
        </div>
      </header>

      {/* ── NEARBY ROW */}
      <div style={{flexShrink:0,display:"flex",alignItems:"flex-start",justifyContent:"space-around",padding:"10px 8px",background:"rgba(255,255,255,0.42)",borderBottom:"1px solid rgba(255,255,255,0.65)"}}>
        {pinItems.map(item=><PinTile key={item.label} icon={item.icon} label={item.label} value={item.value} dim={item.dim}/>)}
      </div>

      {/* ── SAFETY % (swipeable, flex-1) */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",padding:"8px 0",minHeight:150}}>
        <button onClick={()=>setStatIdx(i=>(i-1+stats.length)%stats.length)}
          style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.48)",border:"1px solid rgba(255,255,255,0.72)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <ChevronLeft size={18} color="#268A90"/>
        </button>
        <button onClick={()=>setStatIdx(i=>(i+1)%stats.length)}
          style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.48)",border:"1px solid rgba(255,255,255,0.72)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <ChevronRight size={18} color="#268A90"/>
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={statIdx} initial={{opacity:0,x:28}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-28}} transition={{duration:0.2}}
            style={{textAlign:"center",padding:"0 48px",width:"100%"}}>
            <p style={{fontSize:"clamp(50px,15vw,76px)",fontWeight:900,color:"#36A6B2",lineHeight:1,margin:"0 0 2px"}}>
              {cur.pct}%
            </p>
            <p style={{fontSize:"clamp(16px,5vw,26px)",fontWeight:600,color:"#36A6B2",margin:"0 0 4px"}}>
              {cur.label}
            </p>
            <p style={{fontSize:12,color:"#527A80",margin:0}}>{cur.sub}</p>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
              {stats.map((_,i)=>(
                <button key={i} onClick={()=>setStatIdx(i)}
                  style={{width:i===statIdx?18:7,height:7,borderRadius:4,background:i===statIdx?"#36A6B2":"rgba(54,166,178,0.28)",border:"none",cursor:"pointer",transition:"all 0.2s"}}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM SECTION — wave + PANIC + circles */}
      <div style={{flexShrink:0,position:"relative",paddingBottom:"max(env(safe-area-inset-bottom,0px),68px)"}}>

        {/* White curved wave */}
        <svg viewBox="0 0 480 140" preserveAspectRatio="none"
          style={{width:"100%",height:"clamp(90px,28vw,140px)",display:"block"}}>
          <path d="M0,72 Q80,20 200,54 Q320,88 420,36 Q456,18 480,30 L480,140 L0,140 Z" fill="rgba(255,255,255,0.46)"/>
          <path d="M0,92 Q80,42 200,72 Q320,104 420,54 Q456,36 480,48 L480,140 L0,140 Z" fill="rgba(255,255,255,0.76)"/>
        </svg>

        {/* PANIC BUTTON */}
        <div style={{position:"relative",zIndex:2,marginTop:-8,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <p style={{fontSize:10,color:"#8A6060",fontWeight:700,letterSpacing:2,marginBottom:4,textTransform:"uppercase",textAlign:"center"}}>
            {pressing?`Hold… ${Math.round(holdPct)}%`:activeAlert?"Alert active":"Hold 2s to trigger SOS"}
          </p>
          <PanicBtn onStart={startHold} onEnd={cancelHold} active={!!activeAlert} pressing={pressing} pct={holdPct}/>
          {pressing&&<p style={{fontSize:10,color:"#999",marginTop:4}}>Release to cancel</p>}
        </div>

        {/* Bottom 3 circles — fully responsive using vw */}
        <div style={{position:"relative",zIndex:3,display:"flex",alignItems:"flex-end",justifyContent:"center",height:"clamp(96px,30vw,120px)",gap:0}}>

          {/* HELP OTHERS (left) */}
          <motion.button whileTap={{scale:0.93}} onClick={()=>navigate('/Contacts')}
            style={{
              width:"clamp(84px,25vw,104px)", height:"clamp(84px,25vw,104px)",
              borderRadius:"50%", border:"none", cursor:"pointer", flexShrink:0,
              background:"radial-gradient(circle at 40% 32%, #F06060, #AC1616)",
              boxShadow:"4px 5px 16px rgba(156,18,18,0.55),inset -3px -3px 8px rgba(0,0,0,0.22),inset 2px 2px 6px rgba(255,140,140,0.2)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              alignSelf:"flex-end", marginBottom:10, marginRight:"-8px",
            }}>
            <Users size={16} color="#fff" strokeWidth={2}/>
            <span style={{color:"#fff",fontWeight:900,fontSize:"clamp(8px,2.2vw,10px)",textAlign:"center",marginTop:3,lineHeight:1.2}}>HELP{"\n"}OTHERS</span>
          </motion.button>

          {/* I NEED HELP (centre, tallest) */}
          <motion.button
            onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
            onTouchStart={startHold} onTouchEnd={cancelHold}
            animate={activeAlert?{scale:[1,1.04,1]}:{}}
            transition={{repeat:Infinity,duration:1.3}}
            style={{
              width:"clamp(114px,35vw,138px)", height:"clamp(114px,35vw,138px)",
              borderRadius:"50%", border:"none", cursor:"pointer", flexShrink:0, zIndex:10,
              background:pressing
                ?"radial-gradient(circle at 42% 36%, #CC2828, #860000)"
                :"radial-gradient(circle at 38% 30%, #E53030, #9C0E0E)",
              boxShadow:pressing
                ?"0 3px 18px rgba(130,0,0,0.72),inset -3px -4px 10px rgba(0,0,0,0.32)"
                :"5px 7px 20px rgba(156,14,14,0.62),inset -4px -5px 12px rgba(0,0,0,0.26),inset 2px 2px 7px rgba(255,140,140,0.18)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              position:"relative",
            }}>
            {pressing&&(
              <motion.div style={{position:"absolute",inset:0,borderRadius:"50%",border:"4px solid rgba(255,255,255,0.35)"}}
                animate={{scale:[1,1.45],opacity:[0.5,0]}} transition={{repeat:Infinity,duration:0.7}}/>
            )}
            <span style={{color:"#fff",fontWeight:900,fontSize:"clamp(10px,3.2vw,13px)",textAlign:"center",lineHeight:1.2,zIndex:1}}>
              {pressing?"SENDING…":"I NEED\nHELP"}
            </span>
          </motion.button>

          {/* Grey expand (right) */}
          <motion.button whileTap={{scale:0.9}} onClick={()=>navigate('/AlertHistory')}
            style={{
              width:"clamp(50px,15vw,62px)", height:"clamp(50px,15vw,62px)",
              borderRadius:"50%", border:"none", cursor:"pointer", flexShrink:0,
              background:"radial-gradient(circle at 38% 32%, #DCDCDC, #ADADAD)",
              boxShadow:"3px 4px 10px rgba(0,0,0,0.2),inset -2px -2px 5px rgba(0,0,0,0.12),inset 1px 1px 4px rgba(255,255,255,0.55)",
              display:"flex",alignItems:"center",justifyContent:"center",
              alignSelf:"flex-end", marginBottom:32, marginLeft:"-8px",
            }}>
            <span style={{fontSize:16,color:"#777",lineHeight:1}}>↗</span>
          </motion.button>

        </div>
      </div>
    </div>
  );
}
