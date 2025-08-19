import { Router } from 'express';

const router = Router();

// Mock test data for development
const mockMemories = [
  {
    id: '1',
    content: 'Just finished an amazing milonga at Salon Canning! The energy was incredible and the live orchestra made it unforgettable.',
    userId: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userName: 'Scott Boddye',
    userUsername: 'admin3304',
    userProfileImage: null,
    emotionTags: ['joyful', 'excited', 'grateful'],
    location: {
      name: 'Salon Canning',
      formatted_address: 'Av. Raúl Scalabrini Ortiz 1331, Buenos Aires, Argentina'
    },
    reactions: {
      love: 5,
      like: 12,
      wow: 3
    },
    userReaction: 'love',
    commentCount: 7,
    shareCount: 2
  },
  {
    id: '2',
    content: 'Learning the subtle art of cabeceo at a traditional milonga. It\'s fascinating how much communication happens without words in tango culture.',
    userId: 1,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    userName: 'Scott Boddye',
    userUsername: 'admin3304',
    userProfileImage: null,
    emotionTags: ['curious', 'thoughtful', 'inspired'],
    location: {
      name: 'La Viruta',
      formatted_address: 'Armenia 1366, Buenos Aires, Argentina'
    },
    reactions: {
      like: 8,
      love: 2
    },
    userReaction: null,
    commentCount: 3,
    shareCount: 0
  },
  {
    id: '3',
    content: 'My first time dancing to Di Sarli\'s orchestra recordings. The pauses, the walks, the emotion - now I understand why he\'s called El Señor del Tango.',
    userId: 1,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    userName: 'Scott Boddye',
    userUsername: 'admin3304',
    userProfileImage: null,
    emotionTags: ['moved', 'nostalgic', 'passionate'],
    location: {
      name: 'Milonga del Indio',
      formatted_address: 'Virrey Cevallos 265, Buenos Aires, Argentina'
    },
    reactions: {
      love: 15,
      wow: 7,
      like: 20
    },
    userReaction: 'wow',
    commentCount: 12,
    shareCount: 5
  }
];

// Get test memories for feed
router.get('/api/posts/feed', (req, res) => {
  const { filterBy = 'all', filterTags = [] } = req.query;
  
  // Filter by tags if provided
  let filteredMemories = mockMemories;
  if (filterTags && Array.isArray(filterTags) && filterTags.length > 0) {
    filteredMemories = mockMemories.filter(memory => 
      filterTags.every(tag => memory.emotionTags.includes(tag))
    );
  }
  
  res.json({
    code: 200,
    message: 'Test memories fetched successfully',
    data: filteredMemories.map(memory => ({
      ...memory,
      user: {
        id: memory.userId,
        name: memory.userName,
        username: memory.userUsername,
        profileImage: memory.userProfileImage,
        tangoRoles: ['dancer', 'teacher', 'organizer']
      }
    }))
  });
});

// Get test comments for a memory
router.get('/api/memories/:id/comments', (req, res) => {
  const mockComments = [
    {
      id: '1',
      memoryId: req.params.id,
      userId: 2,
      userName: 'Maria Garcia',
      content: 'That sounds amazing! Salon Canning is one of my favorite venues too.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      memoryId: req.params.id,
      userId: 3,
      userName: 'Carlos Rodriguez',
      content: 'The live orchestras there are always incredible. Which orchestra was playing?',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ];
  
  res.json({
    code: 200,
    message: 'Comments fetched successfully',
    data: mockComments
  });
});

// Add reaction to memory
router.post('/api/memories/:id/reactions', (req, res) => {
  const { type } = req.body;
  res.json({
    code: 200,
    message: `Reaction ${type} added successfully`,
    data: { type, memoryId: req.params.id }
  });
});

// Add comment to memory
router.post('/api/memories/:id/comments', (req, res) => {
  const { content } = req.body;
  res.json({
    code: 200,
    message: 'Comment added successfully',
    data: {
      id: Date.now().toString(),
      content,
      userId: 1,
      userName: 'Scott Boddye',
      createdAt: new Date().toISOString()
    }
  });
});

// Share memory
router.post('/api/memories/:id/share', (req, res) => {
  const { text } = req.body;
  res.json({
    code: 200,
    message: 'Memory shared successfully',
    data: {
      sharedMemoryId: req.params.id,
      shareText: text,
      sharedAt: new Date().toISOString()
    }
  });
});

export default router;