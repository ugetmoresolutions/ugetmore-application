export const extractS3FilePath = (s3Url: string): string | null => {
    try {
      const url = new URL(s3Url);
      return url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  };
  
