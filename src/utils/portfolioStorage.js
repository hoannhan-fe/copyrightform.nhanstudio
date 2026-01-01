// Utility functions to manage portfolio data in localStorage

const STORAGE_KEY = 'portfolio_items';

// Get portfolio items from localStorage or return default data
export const getPortfolioItems = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return null;
};

// Save portfolio items to localStorage
export const savePortfolioItems = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Initialize with default data if localStorage is empty
export const initializePortfolioData = (defaultData) => {
  const existing = getPortfolioItems();
  if (!existing || existing.length === 0) {
    savePortfolioItems(defaultData);
    return defaultData;
  }
  return existing;
};

// Add a new project
export const addProject = (project, defaultData) => {
  const items = getPortfolioItems() || defaultData;
  const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  const newProject = { ...project, id: newId };
  const updatedItems = [...items, newProject];
  savePortfolioItems(updatedItems);
  return updatedItems;
};

// Update an existing project
export const updateProject = (id, updatedProject, defaultData) => {
  const items = getPortfolioItems() || defaultData;
  const updatedItems = items.map(item => 
    item.id === parseInt(id) ? { ...updatedProject, id: parseInt(id) } : item
  );
  savePortfolioItems(updatedItems);
  return updatedItems;
};

// Delete a project
export const deleteProject = (id, defaultData) => {
  const items = getPortfolioItems() || defaultData;
  const updatedItems = items.filter(item => item.id !== parseInt(id));
  savePortfolioItems(updatedItems);
  return updatedItems;
};


