export const ADMIN_EMAIL = "supportthestoic@gmail.com";
export const ADMIN_PASSWORD = "supportthestoic@706511";
const SESSION_KEY = "tsa_admin_session";
const BLOG_KEY = "tsa_blog_posts";
const GALLERY_KEY = "tsa_gallery_images";

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  cover?: string;
  createdAt: number;
};

export type GalleryImage = {
  id: string;
  caption: string;
  src: string;
  createdAt: number;
};

export const isAdminLoggedIn = () =>
  typeof window !== "undefined" && localStorage.getItem(SESSION_KEY) === "1";

export const loginAdmin = (email: string, password: string) => {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
};

export const logoutAdmin = () => localStorage.removeItem(SESSION_KEY);

export const getBlogPosts = (): BlogPost[] => {
  try { return JSON.parse(localStorage.getItem(BLOG_KEY) || "[]"); } catch { return []; }
};
export const saveBlogPosts = (posts: BlogPost[]) =>
  localStorage.setItem(BLOG_KEY, JSON.stringify(posts));

export const getGallery = (): GalleryImage[] => {
  try { return JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]"); } catch { return []; }
};
export const saveGallery = (imgs: GalleryImage[]) =>
  localStorage.setItem(GALLERY_KEY, JSON.stringify(imgs));

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
