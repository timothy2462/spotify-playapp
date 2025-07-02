  export const getImageUrl = (images: Array<{ url: string }>, fallback: any) => {
    return images && images.length > 0 ? { uri: images[0].url } : fallback;
  };

  export const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  export const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  export const safeFetch = async (url: string, options: RequestInit) => {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Empty response');
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      throw error;
    }
  };