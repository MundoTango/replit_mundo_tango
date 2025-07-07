# Technical Implementation Guide - Mundo Tango & Life CEO Platform

## Database Implementation

### Core User Tables
```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isVerified BOOLEAN DEFAULT FALSE,
  replit_id VARCHAR(255) UNIQUE,
  form_status INTEGER DEFAULT 0,
  UNIQUE(replit_id)
);

-- user_profiles table  
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  bio TEXT,
  profile_image VARCHAR(255),
  background_image VARCHAR(255),
  location VARCHAR(255),
  website VARCHAR(255),
  birthdate DATE,
  phone VARCHAR(20),
  coordinates JSONB,
  follower_level VARCHAR(50),
  leader_level VARCHAR(50),
  years_of_dancing INTEGER,
  started_dancing_year INTEGER,
  code_of_conduct_accepted BOOLEAN DEFAULT FALSE,
  roles TEXT[],
  primary_role VARCHAR(50)
);
```

### Role Management Tables
```sql
-- roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('community', 'platform')),
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  permissions JSONB,
  is_assignable BOOLEAN DEFAULT TRUE
);

-- user_roles junction table
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER REFERENCES users(id),
  expires_at TIMESTAMP,
  is_primary BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, role_id)
);

-- custom_role_requests table
CREATE TABLE custom_role_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role_name VARCHAR(100) NOT NULL,
  justification TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Social Media Tables
```sql
-- posts table with enhanced features
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  content TEXT,
  rich_content JSONB,
  media_urls TEXT[],
  media_embeds JSONB,
  mentions INTEGER[],
  hashtags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'public',
  coordinates JSONB,
  place_id VARCHAR(255),
  formatted_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE
);

-- post_comments table
CREATE TABLE post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id),
  parent_id INTEGER REFERENCES post_comments(id),
  content TEXT,
  mentions INTEGER[],
  gif_url VARCHAR(255),
  image_url VARCHAR(255),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE
);

-- post_reactions table
CREATE TABLE post_reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id),
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id, emoji)
);
```

### Event Management Tables
```sql
-- events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  location VARCHAR(255),
  coordinates JSONB,
  place_id VARCHAR(255),
  formatted_address TEXT,
  organizer_id INTEGER REFERENCES users(id),
  image_url VARCHAR(255),
  max_attendees INTEGER,
  price DECIMAL(10,2),
  rsvp_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- event_rsvps table
CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- event_participants table
CREATE TABLE event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50),
  status VARCHAR(20) DEFAULT 'invited',
  invited_by INTEGER REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP
);
```

### Media Management Tables
```sql
-- media_assets table
CREATE TABLE media_assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  thumbnail_path VARCHAR(500),
  tags TEXT[],
  visibility VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- media_tags table
CREATE TABLE media_tags (
  id SERIAL PRIMARY KEY,
  media_id INTEGER REFERENCES media_assets(id),
  tag VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(media_id, tag)
);

-- memory_media junction table
CREATE TABLE memory_media (
  id SERIAL PRIMARY KEY,
  memory_id INTEGER REFERENCES posts(id),
  media_id INTEGER REFERENCES media_assets(id),
  caption TEXT,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Life CEO Tables
```sql
-- life_ceo_agents table
CREATE TABLE life_ceo_agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  priority INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- life_ceo_agent_memories table
CREATE TABLE life_ceo_agent_memories (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES life_ceo_agents(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT,
  context JSONB,
  embedding vector(1536),
  importance FLOAT DEFAULT 0.5,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- life_ceo_tasks table
CREATE TABLE life_ceo_tasks (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES life_ceo_agents(id),
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  priority VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Implementation

### Authentication Endpoints
```typescript
// POST /api/auth/register
router.post('/api/auth/register', async (req, res) => {
  const { username, email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await storage.createUser({
    username, email, password: hashedPassword, name
  });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ user, token });
});

// POST /api/auth/login
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await storage.getUserByEmail(email);
  const valid = await bcrypt.compare(password, user.password_hash);
  if (valid) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ user, token });
  }
});

// GET /api/auth/user (with Replit OAuth)
router.get('/api/auth/user', async (req, res) => {
  if (req.isAuthenticated?.()) {
    const replitId = req.session.claims.sub;
    const user = await storage.getUserByReplitId(replitId);
    res.json(user);
  }
});
```

### Role Management Endpoints
```typescript
// GET /api/roles/community
router.get('/api/roles/community', async (req, res) => {
  const roles = await storage.getCommunityRoles();
  res.json({ success: true, data: roles });
});

// POST /api/roles/assign
router.post('/api/roles/assign', authMiddleware, async (req, res) => {
  const { userId, roleId } = req.body;
  await storage.assignRoleToUser(userId, roleId, req.user.id);
  res.json({ success: true });
});

// POST /api/roles/custom/request
router.post('/api/roles/custom/request', authMiddleware, async (req, res) => {
  const { roleName, justification } = req.body;
  const request = await storage.createCustomRoleRequest({
    userId: req.user.id, roleName, justification
  });
  res.json({ success: true, data: request });
});
```

### Post Management Endpoints
```typescript
// POST /api/posts
router.post('/api/posts', authMiddleware, async (req, res) => {
  const { content, richContent, mediaUrls, location, visibility } = req.body;
  const post = await storage.createPost({
    userId: req.user.id,
    content,
    richContent,
    mediaUrls,
    coordinates: location?.coordinates,
    placeId: location?.placeId,
    formattedAddress: location?.formattedAddress,
    visibility
  });
  res.json({ success: true, data: post });
});

// GET /api/posts/feed
router.get('/api/posts/feed', authMiddleware, async (req, res) => {
  const { filterTags } = req.query;
  const posts = await storage.getPostsFeed(req.user.id, filterTags);
  res.json({ success: true, data: posts });
});

// POST /api/posts/:id/reactions
router.post('/api/posts/:id/reactions', authMiddleware, async (req, res) => {
  const { emoji } = req.body;
  await storage.upsertPostReaction(req.params.id, req.user.id, emoji);
  res.json({ success: true });
});
```

### Event Management Endpoints
```typescript
// POST /api/events
router.post('/api/events', authMiddleware, async (req, res) => {
  const { title, description, type, startDate, endDate, location, assignedRoles } = req.body;
  const event = await storage.createEvent({
    title, description, type,
    startDate, endDate,
    location,
    organizerId: req.user.id
  });
  
  // Assign roles to participants
  for (const role of assignedRoles) {
    await storage.createEventParticipant({
      eventId: event.id,
      userId: role.userId,
      role: role.role,
      invitedBy: req.user.id
    });
  }
  
  res.json({ code: 200, data: event });
});

// GET /api/events/sidebar
router.get('/api/events/sidebar', authMiddleware, async (req, res) => {
  const events = await storage.getPersonalizedEvents(req.user.id);
  res.json({ code: 200, data: events });
});

// POST /api/events/:id/rsvp
router.post('/api/events/:id/rsvp', authMiddleware, async (req, res) => {
  const { status } = req.body;
  await storage.upsertEventRSVP(req.params.id, req.user.id, status);
  res.json({ code: 200, message: 'RSVP updated' });
});
```

### Media Management Endpoints
```typescript
// POST /api/media/upload
router.post('/api/media/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const { tags, visibility } = req.body;
  const media = await storage.createMediaAsset({
    userId: req.user.id,
    fileName: req.file.filename,
    filePath: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    tags: tags ? tags.split(',') : [],
    visibility
  });
  res.json({ success: true, data: media });
});

// POST /api/media/:id/tags
router.post('/api/media/:id/tags', authMiddleware, async (req, res) => {
  const { tags } = req.body;
  for (const tag of tags) {
    await storage.addMediaTag(req.params.id, tag);
  }
  res.json({ success: true });
});

// GET /api/media/search
router.get('/api/media/search', authMiddleware, async (req, res) => {
  const { tags } = req.query;
  const media = await storage.searchMediaByTags(req.user.id, tags);
  res.json({ success: true, data: media });
});
```

### Life CEO Endpoints
```typescript
// GET /api/life-ceo/agents
router.get('/api/life-ceo/agents', superAdminMiddleware, async (req, res) => {
  const agents = await storage.getLifeCEOAgents();
  res.json({ success: true, data: agents });
});

// POST /api/life-ceo/chat/:agentSlug/message
router.post('/api/life-ceo/chat/:agentSlug/message', superAdminMiddleware, async (req, res) => {
  const { message, conversationId } = req.body;
  const agent = await storage.getAgentBySlug(req.params.agentSlug);
  
  // Process with OpenAI
  const response = await lifeCEOService.processMessage(
    agent, 
    message, 
    req.user.id,
    conversationId
  );
  
  // Store memory
  await storage.createAgentMemory({
    agentId: agent.id,
    userId: req.user.id,
    content: message,
    context: { response },
    embedding: await openAIService.createEmbedding(message)
  });
  
  res.json({ success: true, data: response });
});
```

## Frontend Components Implementation

### EnhancedHierarchicalTreeView Component
```typescript
interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task' | 'Sub-task';
  status: 'Completed' | 'In Progress' | 'Planned' | 'Blocked' | 'Under Review';
  completion: number;
  priority: 'High' | 'Medium' | 'Low';
  children?: ProjectItem[];
}

const EnhancedHierarchicalTreeView: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree'>('tree');
  
  const getColorByLevel = (type: string) => {
    const colors = {
      'Platform': 'border-purple-500',
      'Section': 'border-blue-500',
      'Feature': 'border-green-500',
      'Project': 'border-yellow-500',
      'Task': 'border-orange-500',
      'Sub-task': 'border-red-500'
    };
    return colors[type] || 'border-gray-500';
  };
  
  const renderTreeItem = (item: ProjectItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.id}>
        <div className={`border-l-4 ${getColorByLevel(item.type)} p-2`}>
          {/* Tree item content */}
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {item.children.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
};
```

### ModernPostCreator Component
```typescript
const ModernPostCreator: React.FC = () => {
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState({});
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [location, setLocation] = useState(null);
  const [visibility, setVisibility] = useState('public');
  
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    mention: {
      allowedChars: /^[A-Za-z0-9_]*$/,
      mentionDenotationChars: ["@"],
      source: async (searchTerm: string) => {
        const users = await searchUsers(searchTerm);
        return users.map(u => ({ id: u.id, value: u.username }));
      }
    }
  };
  
  const handleSubmit = async () => {
    const postData = {
      content,
      richContent,
      mediaUrls: selectedMedia,
      location,
      visibility
    };
    await createPost(postData);
  };
  
  return (
    <Card>
      <ReactQuill
        value={content}
        onChange={setContent}
        modules={modules}
        placeholder="What's on your mind?"
      />
      <GoogleMapsAutocomplete onLocationSelect={setLocation} />
      <MediaLibrary onSelect={setSelectedMedia} />
      <Button onClick={handleSubmit}>Post</Button>
    </Card>
  );
};
```

### GoogleMapsAutocomplete Component
```typescript
const GoogleMapsAutocomplete: React.FC<{ onLocationSelect: Function }> = ({ onLocationSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  useEffect(() => {
    if (!window.google) {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"]
      });
      
      loader.load().then(() => {
        initAutocomplete();
      });
    } else {
      initAutocomplete();
    }
  }, []);
  
  const initAutocomplete = () => {
    if (!inputRef.current) return;
    
    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode']
    });
    
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place.geometry) {
        onLocationSelect({
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          placeId: place.place_id,
          formattedAddress: place.formatted_address
        });
      }
    });
    
    setAutocomplete(ac);
  };
  
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Add location..."
      className="w-full p-2 border rounded"
    />
  );
};
```

## Service Implementations

### Life CEO Chat Service
```typescript
class LifeCEOChatService {
  async processMessage(agent: Agent, message: string, userId: number, conversationId: string) {
    // Get relevant memories
    const memories = await this.agentMemoryService.searchMemories(
      agent.id,
      userId,
      message,
      10
    );
    
    // Build context
    const context = memories.map(m => m.content).join('\n');
    
    // Generate response with OpenAI
    const response = await this.openAIService.generateResponse({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are ${agent.name}, a Life CEO agent. ${agent.description}. 
                   Use this context from previous conversations: ${context}`
        },
        {
          role: 'user',
          content: message
        }
      ]
    });
    
    // Extract and store important information
    const importance = await this.calculateImportance(message, response);
    if (importance > 0.7) {
      await this.agentMemoryService.createMemory({
        agentId: agent.id,
        userId,
        content: `User: ${message}\nAgent: ${response}`,
        importance,
        tags: await this.extractTags(message, response)
      });
    }
    
    return response;
  }
}
```

### Agent Memory Service
```typescript
class AgentMemoryService {
  async createMemory(data: {
    agentId: number;
    userId: number;
    content: string;
    importance: number;
    tags: string[];
  }) {
    // Create embedding
    const embedding = await this.openAIService.createEmbedding(data.content);
    
    // Store in database
    const memory = await db.insert(agentMemories).values({
      agent_id: data.agentId,
      user_id: data.userId,
      content: data.content,
      embedding,
      importance: data.importance,
      tags: data.tags,
      created_at: new Date()
    }).returning();
    
    return memory[0];
  }
  
  async searchMemories(agentId: number, userId: number, query: string, limit: number = 5) {
    // Create query embedding
    const queryEmbedding = await this.openAIService.createEmbedding(query);
    
    // Semantic search using pgvector
    const memories = await db.execute(sql`
      SELECT *, 1 - (embedding <=> ${queryEmbedding}) as similarity
      FROM life_ceo_agent_memories
      WHERE agent_id = ${agentId} AND user_id = ${userId}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `);
    
    return memories;
  }
}
```

### Voice Processing Service
```typescript
class VoiceProcessingService {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private compressor: DynamicsCompressorNode;
  private filter: BiquadFilterNode;
  
  constructor() {
    this.audioContext = new AudioContext();
    this.setupAudioProcessing();
  }
  
  setupAudioProcessing() {
    // Dynamic compression
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -50;
    this.compressor.knee.value = 40;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.05;
    this.compressor.release.value = 0.25;
    
    // High-pass filter
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = 'highpass';
    this.filter.frequency.value = 85;
    
    // Connect nodes
    this.filter.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);
  }
  
  async processAudioStream(stream: MediaStream) {
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.filter);
    
    // Apply noise suppression
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach(track => {
      track.applyConstraints({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      });
    });
    
    return stream;
  }
}
```

## Performance Optimizations

### Database Indexes
```sql
-- Location-based queries
CREATE INDEX idx_posts_coordinates ON posts USING GIN (coordinates);
CREATE INDEX idx_events_coordinates ON events USING GIN (coordinates);

-- Full-text search
CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('english', content));
CREATE INDEX idx_posts_hashtags ON posts USING GIN (hashtags);

-- Social queries
CREATE INDEX idx_post_reactions_post_user ON post_reactions(post_id, user_id);
CREATE INDEX idx_follows_follower_following ON follows(follower_id, following_id);

-- Performance queries
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_media_assets_user_tags ON media_assets(user_id, tags);
```

### React Component Optimization
```typescript
// Memoized components
const RoleItem = React.memo(({ role, isSelected, onToggle }) => {
  return (
    <div onClick={() => onToggle(role.id)}>
      {role.name}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.isSelected === nextProps.isSelected &&
         prevProps.role.id === nextProps.role.id;
});

// Optimized state management
const useOptimizedState = () => {
  const [state, setState] = useState(initialState);
  
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const memoizedValue = useMemo(() => {
    return computeExpensiveValue(state);
  }, [state]);
  
  return { state, updateState, memoizedValue };
};
```

## Security Implementation

### Row-Level Security Policies
```sql
-- Posts RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_select_policy ON posts
  FOR SELECT USING (
    visibility = 'public' OR
    user_id = current_user_id() OR
    (visibility = 'mutual' AND EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = current_user_id() 
      AND following_id = posts.user_id
    ))
  );

CREATE POLICY posts_insert_policy ON posts
  FOR INSERT WITH CHECK (user_id = current_user_id());

CREATE POLICY posts_update_policy ON posts
  FOR UPDATE USING (user_id = current_user_id());

-- Events RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_select_policy ON events
  FOR SELECT USING (true);

CREATE POLICY events_manage_policy ON events
  FOR ALL USING (organizer_id = current_user_id());
```

### Authentication Middleware
```typescript
const authMiddleware = async (req, res, next) => {
  try {
    // Check JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await storage.getUserById(decoded.userId);
    }
    
    // Check Replit OAuth
    else if (req.isAuthenticated?.()) {
      const replitId = req.session.claims.sub;
      req.user = await storage.getUserByReplitId(replitId);
    }
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Set security context
    await db.execute(sql`SET LOCAL app.current_user_id = ${req.user.id}`);
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication' });
  }
};

const roleAuthMiddleware = (roles) => {
  return async (req, res, next) => {
    await authMiddleware(req, res, async () => {
      const userRoles = await storage.getUserRoles(req.user.id);
      const hasRole = userRoles.some(r => roles.includes(r.name));
      
      if (!hasRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      next();
    });
  };
};
```

---

## Deployment Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Authentication
JWT_SECRET=your-secret-key
REPLIT_DEPLOYMENT_ID=your-deployment-id

# External Services
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
OPENAI_API_KEY=your-openai-key
PEXELS_API_KEY=your-pexels-key

# Analytics
VITE_PLAUSIBLE_DOMAIN=mundo-tango.life
```

### Build Scripts
```json
{
  "scripts": {
    "dev": "npm run server:dev & npm run client:dev",
    "build": "npm run client:build && npm run server:build",
    "server:dev": "tsx watch server/index.ts",
    "server:build": "esbuild server/index.ts --bundle --platform=node --outfile=dist/server.js",
    "client:dev": "vite",
    "client:build": "vite build",
    "db:push": "drizzle-kit push:pg"
  }
}
```

---

Last Updated: January 7, 2025
Version: 1.0