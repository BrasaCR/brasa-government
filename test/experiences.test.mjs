import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import worker from '../src/index.js';
import { serviceNavigator } from '../src/experiences.js';

const records=[{label:'AyA agua potable',page:'Agua y saneamiento',url:'https://www.aya.go.cr'},{label:'Ministerio de Salud',page:'Salud',url:'https://www.ministeriodesalud.go.cr'}];

test('builds bilingual anonymous service guidance from curated topics',()=>{
  const english=serviceNavigator(records,new URLSearchParams('topic=water&locale=en&countryCode=CR')).data;
  const spanish=serviceNavigator(records,new URLSearchParams('topic=water&locale=es&countryCode=CR')).data;
  assert.equal(english.services.length,1);assert.equal(english.steps.length,4);assert.equal(spanish.locale,'es');assert.notEqual(spanish.title,english.title);
  assert.deepEqual(english.boundaries,{informationalOnly:true,legalAdvice:false,eligibilityDecision:false,officialService:false,personalDataRequested:false,sourceStatus:'unreviewed-existing-index'});
  for(const field of ['govId','citizenId','politicalPreference','activity','application'])assert.doesNotMatch(JSON.stringify(english),new RegExp(`"${field}"\\s*:`));
});

test('rejects open-ended topics, unsupported countries, and unsafe limits',()=>{
  assert.equal(serviceNavigator(records,new URLSearchParams('topic=my-personal-problem')).error,'invalid_topic');
  assert.equal(serviceNavigator(records,new URLSearchParams('countryCode=US')).error,'country_not_available');
  assert.equal(serviceNavigator(records,new URLSearchParams('limit=13')).error,'invalid_limit');
});

test('serves the experience as a read-only cacheable API',async()=>{
  const env={ASSETS:{fetch:async()=>Response.json(records)}};
  const response=await worker.fetch(new Request('https://brasagovernment.net/api/v1/experiences/service-navigator?topic=health&locale=es'),env);
  assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/^public/);assert.equal((await response.json()).data.topic,'health');
  const denied=await worker.fetch(new Request('https://brasagovernment.net/api/v1/experiences/service-navigator',{method:'POST'}),env);assert.equal(denied.status,405);
});

test('experience interface is bilingual, responsive, and injection-resistant',async()=>{
  const html=await readFile(new URL('../service-navigator.html',import.meta.url),'utf8'),script=await readFile(new URL('../service-navigator.js',import.meta.url),'utf8'),styles=await readFile(new URL('../service-navigator.css',import.meta.url),'utf8');
  assert.match(html,/service-navigator\.js/);assert.match(script,/Government-powered guidance/);assert.match(script,/Orientación impulsada/);assert.match(script,/credentials:'omit'/);assert.match(script,/textContent=text/);assert.doesNotMatch(script,/innerHTML|insertAdjacentHTML|document\.write/);assert.match(styles,/@media\(max-width:700px\)/);
});
