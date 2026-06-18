export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  avgRating: true,
  ratingsCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const fullProfileSelect = {
  id: true,
  bio: true,
  studyPreferences: true,
  contentToStudy: true,
  contentToTeach: true,
  lessonsMentored: true,
  lessonsStudied: true,
  progress: true,
  matchCount: true,
  lastMatchAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const publicProfileSelect = {
  ...fullProfileSelect,
  user: {
    select: publicUserSelect,
  },
  userId: true,
} as const;

export const mentorSelect = {
  ...publicUserSelect,
  skills: {
    select: {
      id: true,
      name: true,
      kind: true,
      level: true,
      createdAt: true,
    },
  },
  profile: {
    select: {
      bio: true,
      studyPreferences: true,
      contentToStudy: true,
      contentToTeach: true,
      lessonsMentored: true,
      lessonsStudied: true,
      progress: true,
      matchCount: true,
      lastMatchAt: true,
    },
  },
} as const;
