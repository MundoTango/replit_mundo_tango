# ESA LIFE CEO 61x21 - Layer 57: City Group Creation Automation

## 13. AUTOMATIONS — City Group Creation (Layer 57)

**Purpose:** Automatically ensure a City Group exists and is connected whenever a new **user registers**, a **recommendation post** mentions a city, or an **event** specifies a city/venue. Must be idempotent, race-safe, RLS-safe, auditable, and cache-coherent.

**Triggers (canonical sources):**
- User registration → `user.city` field set.  
- Recommendation post → `post.city` or (lat,lng) geotag.  
- Event creation/update → `event.city` or venue.city.  
- (Optional) seed/import flows.  

**Invariants (do not break):**  
- One group per city (case/accents/whitespace-insensitive).  
- No duplicates under concurrency.  
- Normalized `name` / `slug` / `country`.  
- Audit log for every create/connect.  
- Client cannot insert (server/service only).  
- Stats/cache updated immediately.  

## Manual QA Test Cases

1. **User Registration**: New user selects "Mendoza, AR" → expect **created** group + audit row.  
2. **Event Creation**: Organizer makes event with "Mendoza, AR" → expect **connected** (no duplicate) + audit row.  
3. **Recommendation Post**: User posts with "méndoza" or "  Mendoza  " → expect **same** normalized group.  
4. **Concurrency**: Fire 10 parallel creates → expect **1 created + 9 connected**, no 500s.  
5. **RLS**: Confirm client insert forbidden; server/service path allowed.  
6. `/api/community/city-groups-stats` updates immediately.  

## cURL/SQL Test Probes

```bash
# Registration trigger
curl -X POST http://localhost:5000/api/automation/city-group \
  -H "Content-Type: application/json" \
  -d '{"name":"Mendoza","countryCode":"AR","source":"user.registration"}'

# Event trigger  
curl -X POST http://localhost:5000/api/automation/city-group \
  -H "Content-Type: application/json" \
  -d '{"name":"Mendoza","countryCode":"AR","source":"event.city"}'

# Post trigger
curl -X POST http://localhost:5000/api/automation/city-group \
  -H "Content-Type: application/json" \
  -d '{"name":"Mendoza","countryCode":"AR","source":"post.city"}'

# SQL verification
psql -c "SELECT id,name,slug FROM city_groups WHERE lower(name)='mendoza'" # Should return 1 row
psql -c "SELECT topic,source,result FROM automation_audit WHERE topic='city-group-create' ORDER BY created_at DESC LIMIT 10"
```

## Automated Test Suite

```javascript
async function automationCityGroupTests(baseUrl='http://localhost:5000'){
  const results={passed:[],failed:[]};
  async function post(p,b){
    const r=await fetch(baseUrl+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});
    return{status:r.status,json:await r.json().catch(()=>({}))};
  }

  // Registration trigger
  let reg=await post('/api/automation/city-group',{name:'Mendoza',countryCode:'AR',source:'user.registration'});
  if(reg.status===200&&reg.json?.result?.action==='created'){results.passed.push('registration-Mendoza')}
  else{results.failed.push({step:'registration-Mendoza',detail:reg});}

  // Event trigger
  let evt=await post('/api/automation/city-group',{name:'mÉNDoza',countryCode:'ar',source:'event.city'});
  if(evt.status===200&&evt.json?.result?.action==='connected'){results.passed.push('event-connect')}
  else{results.failed.push({step:'event-connect',detail:evt});}

  // Post trigger concurrency
  const payload={name:'Cusco',countryCode:'PE',source:'post.city'};
  const rr=await Promise.all(Array.from({length:8},()=>post('/api/automation/city-group',payload)));
  const actions=rr.map(x=>x.json?.result?.action).filter(Boolean);
  const created=actions.filter(a=>a==='created').length;
  const connected=actions.filter(a=>a==='connected').length;
  if(created===1&&connected===7){results.passed.push('post-concurrency')}
  else{results.failed.push({step:'post-concurrency',created,connected,rr:rr.map(x=>x.status)})}

  console.log('Automation City Group Results:',results);
  return results;
}

// Execute test when loaded
if (typeof window !== 'undefined') {
  window.automationCityGroupTests = automationCityGroupTests;
  console.log('City Group Automation Tests loaded. Run: automationCityGroupTests()');
}
```

## Implementation Status

### ✅ Completed
- City groups table with normalized slugs
- Automatic geocoding on registration
- Deduplication logic for city names
- Stats endpoint `/api/community/city-groups-stats`

### 🔧 In Progress
- Automation audit logging
- Concurrency protection with advisory locks
- Cache invalidation on create/connect

### 📋 TODO
- Implement `/api/automation/city-group` endpoint
- Add RLS policies for server-only insertion
- Set up automated test runner
- Add accent/case normalization function

## Related Files
- `server/routes/groupRoutes.ts` - Group management endpoints
- `server/services/geocoding.ts` - City normalization and geocoding
- `shared/schema.ts` - City groups table definition
- `client/src/components/Groups/CityGroupCard.tsx` - UI component

## Audit Requirements

Every city group creation/connection must log:
```json
{
  "topic": "city-group-create",
  "source": "user.registration|event.city|post.city",
  "input": {"name": "Mendoza", "countryCode": "AR"},
  "result": {
    "action": "created|connected",
    "cityGroupId": 123,
    "normalizedName": "Mendoza",
    "slug": "mendoza-ar"
  },
  "timestamp": "2025-08-17T18:15:00Z",
  "userId": 7,
  "success": true
}
```

## Performance Targets
- Create/connect latency: < 100ms
- Concurrent request handling: 100 req/s
- Cache update propagation: < 500ms
- Audit log write: async, non-blocking

## Security Considerations
- Server-only endpoint (no direct client access)
- Input sanitization for city names
- Country code validation against ISO 3166
- Rate limiting: 100 requests per minute per source
- Audit trail for compliance

---

**Layer 57 Status:** Implementation ready, awaiting endpoint creation and testing