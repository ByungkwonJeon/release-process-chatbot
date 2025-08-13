import React, { createContext, useContext, useState } from 'react';

const ReleaseContext = createContext();

export const useRelease = () => {
  const context = useContext(ReleaseContext);
  if (!context) {
    throw new Error('useRelease must be used within a ReleaseProvider');
  }
  return context;
};

export const ReleaseProvider = ({ children }) => {
  const [releases, setReleases] = useState([]);
  const [currentRelease, setCurrentRelease] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/releases');
      if (response.ok) {
        const data = await response.json();
        setReleases(data.releases || []);
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRelease = async (releaseData) => {
    try {
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(releaseData),
      });
      
      if (response.ok) {
        const newRelease = await response.json();
        setReleases(prev => [...prev, newRelease]);
        return newRelease;
      }
    } catch (error) {
      console.error('Error creating release:', error);
      throw error;
    }
  };

  const updateRelease = async (releaseId, updateData) => {
    try {
      const response = await fetch(`/api/releases/${releaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const updatedRelease = await response.json();
        setReleases(prev => 
          prev.map(release => 
            release.id === releaseId ? updatedRelease : release
          )
        );
        return updatedRelease;
      }
    } catch (error) {
      console.error('Error updating release:', error);
      throw error;
    }
  };

  const getReleaseById = async (releaseId) => {
    try {
      const response = await fetch(`/api/releases/${releaseId}`);
      if (response.ok) {
        const release = await response.json();
        setCurrentRelease(release);
        return release;
      }
    } catch (error) {
      console.error('Error fetching release:', error);
      throw error;
    }
  };

  const value = {
    releases,
    currentRelease,
    loading,
    fetchReleases,
    createRelease,
    updateRelease,
    getReleaseById,
    setCurrentRelease
  };

  return (
    <ReleaseContext.Provider value={value}>
      {children}
    </ReleaseContext.Provider>
  );
};
