import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('chat');
  const [inventoryData, setInventoryData] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const addToUploadHistory = (fileData) => {
    const newEntry = {
      id: Date.now(),
      name: fileData.name,
      uploadDate: new Date(),
      rowCount: fileData.data.length,
      data: fileData.data,
      headers: fileData.headers
    };
    setUploadHistory(prev => [newEntry, ...prev]);
    setInventoryData(fileData.data);
  };

  const loadFromHistory = (historyItem) => {
    setInventoryData(historyItem.data);
    navigateTo('chat');
  };

  const value = {
    currentPage,
    inventoryData,
    uploadHistory,
    navigateTo,
    addToUploadHistory,
    loadFromHistory,
    setInventoryData
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
