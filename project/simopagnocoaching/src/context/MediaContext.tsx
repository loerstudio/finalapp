import React, { createContext, useState, ReactNode } from 'react';

interface Video {
  id: string;
  title: string;
  uri: string;
  thumbnail: string;
  createdAt: Date;
}

interface Photo {
  id: string;
  uri: string;
  createdAt: Date;
}

interface MediaContextType {
  videos: Video[];
  photos: Photo[];
  uploadVideo: (video: { uri: string; title: string; description: string }) => Promise<void>;
  uploadPhoto: (uri: string) => Promise<void>;
}

export const MediaContext = createContext<MediaContextType>({
  videos: [],
  photos: [],
  uploadVideo: async () => {},
  uploadPhoto: async () => {},
});

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const uploadVideo = async (video: { uri: string; title: string; description: string }) => {
    const newVideo: Video = {
      id: Date.now().toString(),
      title: video.title,
      uri: video.uri,
      thumbnail: video.uri, // In production, generate thumbnail
      createdAt: new Date(),
    };
    
    setVideos(prev => [...prev, newVideo]);
  };

  const uploadPhoto = async (uri: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      uri,
      createdAt: new Date(),
    };
    
    setPhotos(prev => [...prev, newPhoto]);
  };

  return (
    <MediaContext.Provider value={{
      videos,
      photos,
      uploadVideo,
      uploadPhoto,
    }}>
      {children}
    </MediaContext.Provider>
  );
}; 