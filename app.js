/* DevPulse Analytics | Static, reproducible client-side BI dashboard
   Source: Official Stack Overflow 2025 Developer Survey published aggregates
   https://github.com/StackExchange/Survey/tree/main/packages/archive/2025/json
*/
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const COLORS = ['#4ce4bf','#71bfc6','#b2a4fc','#d8ba76','#577591','#df8c9c'];
  const CHART_BG = 'rgba(0,0,0,0)';
  const FONT = 'DM Sans, Arial, sans-serif';
  const formatN = n => Number(n || 0).toLocaleString('en-US');
  const formatP = p => Number(p || 0).toFixed(1) + '%';
  const short = (s,n=25) => s.length>n ? s.slice(0,n-1)+'…' : s;
  const baseLayout = {
    paper_bgcolor:CHART_BG,plot_bgcolor:CHART_BG,
    font:{family:FONT,color:'#b4c8d3',size:11},
    margin:{l:48,r:18,t:18,b:56},hovermode:'closest',
    xaxis:{showgrid:true,gridcolor:'#284051',zeroline:false,ticksuffix:'%',tickfont:{color:'#88a4b5'}},
    yaxis:{showgrid:false,zeroline:false,tickfont:{color:'#c0d1dd'}},
    showlegend:false
  };
  const settings = {responsive:true,displaylogo:false,modeBarButtonsToRemove:['lasso2d','select2d','autoScale2d','toggleSpikelines','zoom2d','pan2d']};
  let DATA = null, lastSelection=null;
  const copy = s => JSON.parse(JSON.stringify(s));
  const setText = (id,text) => {$(id).textContent=text};
  const getGroup = (key,wanted) => {
    const item=DATA.questions[key];
    if(!item)return null;
    return item.groups.find(g=>g.name===wanted) || item.groups.find(g=>g.name==='All Respondents') || item.groups[0] || null;
  };
  const item = (group,label) => group?.rows.find(r=>r.label===label);
  const sumPct = (group,labels) => labels.reduce((a,l)=>a+(item(group,l)?.pct||0),0);
  const sumCount = (group,labels) => labels.reduce((a,l)=>a+(item(group,l)?.count||0),0);
  const graph = (id,traces,layout) => Plotly.react($(id),traces,{...copy(baseLayout),...layout},settings);
  const lab = (r) => r.label;
  const pct = (n) => Math.round(n*10)/10;
  function adoption(group) {
    const labels = ['Daily','Weekly','Monthly / rarely','Planning to use','No plans'];
    const rows=group.rows;
    const data=[{type:'bar',orientation:'h',y:[...labels].reverse(),x:rows.map(r=>r.pct).reverse(),
      customdata:rows.map(r=>[r.label,r.count]).reverse(),marker:{color:[...COLORS.slice(0,5)].reverse(),line:{width:0}},
      text:rows.map(r=>formatP(r.pct)).reverse(),textposition:'outside',textfont:{color:'#d5e8e9',size:11},
      hovertemplate:'<b>%{customdata[0]}</b><br>%{x:.2f}% · %{customdata[1]:,} responses<extra></extra>'}];
    graph('chart-adoption',data,{margin:{l:112,r:58,t:10,b:32},height:284,xaxis:{...copy(baseLayout.xaxis),range:[0,Math.max(65,Math.max(...rows.map(r=>r.pct))+10)]},yaxis:{...copy(baseLayout.yaxis),tickfont:{size:11,color:'#c3d8df'}}});
    const daily=rows[0].pct;
    setText('insight-adoption',formatP(daily)+' of this audience reports using AI tools daily. '+formatP(sumPct(group,rows.slice(0,3).map(lab)))+' use them at least occasionally.');
    setText('sample-adoption','BASE: n = '+formatN(group.n)+' · SINGLE SELECT · 2025');
  }
  function trustChart(sent,acc) {
    const positive=sumPct(sent,['Very favorable','Favorable']);
    const negative=sumPct(sent,['Unfavorable','Very unfavorable']);
    const trusting=sumPct(acc,['Highly trust','Somewhat trust']);
    const distrusting=sumPct(acc,['Somewhat distrust','Highly distrust']);
    const labels=['Favorable<br>sentiment','Trust AI<br>accuracy','Unfavorable<br>sentiment','Distrust AI<br>accuracy'];
    const values=[positive,trusting,negative,distrusting];
    const nums=[sumCount(sent,['Very favorable','Favorable']),sumCount(acc,['Highly trust','Somewhat trust']),sumCount(sent,['Unfavorable','Very unfavorable']),sumCount(acc,['Somewhat distrust','Highly distrust'])];
    graph('chart-trust',[{type:'bar',x:labels,y:values,customdata:nums,marker:{color:['#4ce4bf','#85caba','#798daa','#b2a4fc'],line:{width:0}},text:values.map(formatP),textposition:'outside',cliponaxis:false,hovertemplate:'%{x}<br><b>%{y:.2f}%</b><br>%{customdata:,} responses<extra></extra>'}],{
      height:284,margin:{l:41,r:11,t:28,b:66},
      xaxis:{showgrid:false,zeroline:false,tickfont:{color:'#a9c0cd',size:10}},
      yaxis:{showgrid:true,gridcolor:'#263f50',range:[0,85],ticksuffix:'%',zeroline:false,tickfont:{color:'#819ba9'}},
      bargap:.36
    });
    const diff=pct(positive-trusting);
    setText('insight-trust','Favorable AI sentiment ('+formatP(positive)+') exceeds reported accuracy trust ('+formatP(trusting)+') by '+formatP(diff).replace('%',' percentage points')+'.');
    setText('sample-trust','BASE: sentiment n = '+formatN(sent.n)+' · accuracy n = '+formatN(acc.n)+' · QUESTIONS HAVE DIFFERENT BASES');
    return {positive,trusting,distrusting,diff};
  }
  const TECH_LABELS={Language:'programming languages',Database:'databases',Platform:'cloud & infrastructure tools',AIModels:'AI models'};
  function techChart(group,kind) {
    const top=[...group.rows].sort((a,b)=>b.pct-a.pct).slice(0,10);
    const ordered=[...top].reverse();
    const names=ordered.map(r=>short(r.label,24));
    const label=TECH_LABELS[kind]||'technologies';
    setText('tech-title','The most-used '+label);
    graph('chart-tech',[{type:'bar',orientation:'h',x:ordered.map(r=>r.pct),y:names,customdata:ordered.map(r=>[r.label,r.count]),marker:{color:ordered.map((r,i)=>i===ordered.length-1?'#4ce4bf':'#4a7a8c'),line:{width:0}},hovertemplate:'<b>%{customdata[0]}</b><br>%{x:.2f}% · %{customdata[1]:,} responses<extra></extra>'}],{
      height:324,margin:{l:135,r:17,t:12,b:35},
      xaxis:{...copy(baseLayout.xaxis),range:[0,Math.min(100,Math.max(65,top[0].pct+7))]},
      yaxis:{showgrid:false,automargin:false,tickfont:{size:10,color:'#c8d9e3'}},
      bargap:.28
    });
    const t=top[0];
    setText('insight-tech',t.label+' leads the selected '+label+' group, reported by '+formatP(t.pct)+' of respondents to this question.');
    setText('sample-tech','BASE: n = '+formatN(group.n)+' · MULTI-SELECT; SHARES MAY TOTAL OVER 100%');
    return t;
  }
  function agentChart(group) {
    const shortNames=['Daily','Weekly','Monthly / rarely','Plan to adopt','Copilot only','No plans'];
    const rows=group.rows;
    const active=sumPct(group,rows.slice(0,2).map(lab));
    graph('chart-agents',[{
      type:'pie',hole:.69,
      labels:shortNames,values:rows.map(r=>r.count),customdata:rows.map(r=>[r.label,r.pct]),
      textinfo:'none',sort:false,direction:'clockwise',
      marker:{colors:COLORS,line:{width:2,color:'#112130'}},
      hovertemplate:'<b>%{customdata[0]}</b><br>%{customdata[1]:.2f}% · %{value:,} respondents<extra></extra>'
    }],{
      height:324,margin:{l:0,r:0,t:10,b:12},
      showlegend:true,
      legend:{orientation:'h',x:.5,xanchor:'center',y:-.11,yanchor:'top',font:{size:10,color:'#bed1d9'},itemwidth:70},
      annotations:[{text:'<b>'+formatP(active)+'</b><br><span style="font-size:10px;color:#97aebe">ACTIVE WEEKLY+</span>',x:.5,y:.57,showarrow:false,font:{size:25,color:'#e9fcf8'},align:'center'}]
    });
    setText('insight-agents',formatP(active)+' use agents at work daily or weekly; '+formatP(sumPct(group,rows.slice(4).map(lab)))+' use only copilots or have no plans to adopt agents.');
    setText('sample-agents','BASE: n = '+formatN(group.n)+' · SINGLE SELECT · 2025');
    return {active};
  }
  function renderFindings({daily,trust,agents,top,audience}) {
    const cards=[
      {title:'AI is becoming part of the daily workflow',description:formatP(daily)+' of '+audience.toLowerCase()+' answering the AI usage question report daily use. This is a self-reported behavior, not a productivity measure.'},
      {title:'Attitudes and confidence are different',description:formatP(trust.positive)+' report favorable sentiment but only '+formatP(trust.trusting)+' report trust in AI accuracy. Questions use different samples.'},
      {title:'Agent adoption is still uneven',description:formatP(agents.active)+' report using agents at work at least weekly. The rest report less frequent use or no agent use.'},
      {title:'Tool adoption has clear leaders',description:top.label+' leads the current technology category at '+formatP(top.pct)+'. Change the category to compare different kinds of tools.'}
    ];
    $('findings-list').replaceChildren(...cards.map((c,i)=>{const wrap=document.createElement('article');wrap.className='finding';const no=document.createElement('span');no.className='finding-no';no.textContent=String(i+1).padStart(2,'0');const content=document.createElement('div');const h=document.createElement('h4');h.textContent=c.title;const p=document.createElement('p');p.textContent=c.description;content.append(h,p);wrap.append(no,content);return wrap}));
  }
  function render() {
    if(!DATA)return;
    const audience=$('audience').value;
    const category=$('technology').value;
    const use=getGroup('AISelect',audience),sent=getGroup('AISent',audience),acc=getGroup('AIAcc',audience),tech=getGroup(category,audience),agent=getGroup('AIAgents',audience);
    if(!use||!sent||!acc||!tech||!agent)throw Error('A required survey group is missing.');
    const daily=use.rows[0].pct;
    const trustRatio=sumPct(acc,['Highly trust','Somewhat trust']);
    const active=sumPct(agent,agent.rows.slice(0,2).map(lab));
    const top=[...tech.rows].sort((a,b)=>b.pct-a.pct)[0];
    setText('kpi-daily',formatP(daily));setText('kpi-daily-note',formatN(use.n)+' answering this question');
    setText('kpi-trust',formatP(trustRatio));setText('kpi-trust-note','Highly or somewhat trust · n='+formatN(acc.n));
    setText('kpi-agent',formatP(active));setText('kpi-agent-note','Daily or weekly at work · n='+formatN(agent.n));
    setText('kpi-tech',top.label);setText('kpi-tech-note',formatP(top.pct)+' of n='+formatN(tech.n));
    adoption(use);
    const tr=trustChart(sent,acc);
    const tt=techChart(tech,category);
    const ag=agentChart(agent);
    renderFindings({daily,trust:tr,agents:ag,top:tt,audience});
    lastSelection={audience,category,use,sent,acc,tech,agent};
    const url=new URL(window.location.href);url.searchParams.set('audience',audience);url.searchParams.set('technology',category);history.replaceState({},'',url.toString());
  }
  function downloadCSV() {
    if(!lastSelection)return;
    const {audience,category,use,sent,acc,tech,agent}=lastSelection;
    const unique=[['AISelect',use],['AISent',sent],['AIAcc',acc],[category,tech],['AIAgents',agent]];
    const escape=s=>'"'+String(s).replaceAll('"','""')+'"';
    const lines=['question,audience,response,count,share_percent,question_respondents'];
    for(const [k,g] of unique)for(const row of g.rows)lines.push([k,g.name,row.label,row.count,row.pct,g.n].map(escape).join(','));
    const blob=new Blob([lines.join('\n')+'\n'],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='devpulse-2025-'+category.toLowerCase()+'-'+audience.toLowerCase().replaceAll(' ','-')+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function init() {
    const params=new URLSearchParams(location.search);
    const a=params.get('audience'),t=params.get('technology');
    if([...$('audience').options].some(x=>x.value===a))$('audience').value=a;
    if([...$('technology').options].some(x=>x.value===t))$('technology').value=t;
    $('audience').addEventListener('change',render);
    $('technology').addEventListener('change',render);
    $('reset').addEventListener('click',()=>{$('audience').value='All Respondents';$('technology').value='Language';render()});
    $('download').addEventListener('click',downloadCSV);
    try{
      if(typeof Plotly==='undefined')throw Error('Chart library could not load. Please check your internet connection.');
      const response=await fetch('data/survey_2025.json',{cache:'no-store'});
      if(!response.ok)throw Error('Dataset request returned '+response.status);
      DATA=await response.json();
      if(DATA.meta.total_records!==795)throw Error('Unexpected dataset version.');
      render();
      $('status').className='status ready';
      setText('status','✓ Showing official 2025 survey aggregates · 795 validated records · 11 questions');
    }catch(error){
      $('status').className='status error';
      setText('status','Unable to load dashboard: '+error.message+' Try the GitHub Pages URL rather than opening index.html directly.');
      console.error(error);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();