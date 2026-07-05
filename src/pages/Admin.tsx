import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isAdminLoggedIn, logoutAdmin,
  getBlogPosts, saveBlogPosts, BlogPost,
  getGallery, saveGallery, GalleryImage,
  fileToDataUrl,
} from "@/lib/adminStore";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import InventoryManager from "@/components/admin/InventoryManager";
import OrdersManager from "@/components/admin/OrdersManager";
import Dashboard from "@/components/admin/Dashboard";
import CategoriesManager from "@/components/admin/CategoriesManager";
import BrandsManager from "@/components/admin/BrandsManager";
import VehicleModelsManager from "@/components/admin/VehicleModelsManager";

const Admin = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState<string | undefined>();

  const [caption, setCaption] = useState("");
  const [imgSrc, setImgSrc] = useState<string | undefined>();

  useEffect(() => {
    if (!isAdminLoggedIn()) { navigate("/admin/login", { replace: true }); return; }
    setPosts(getBlogPosts());
    setGallery(getGallery());
  }, [navigate]);

  const addPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error("Title and content required");
    const next = [{ id: crypto.randomUUID(), title, content, cover, createdAt: Date.now() }, ...posts];
    saveBlogPosts(next); setPosts(next);
    setTitle(""); setContent(""); setCover(undefined);
    toast.success("Blog post published");
  };

  const deletePost = (id: string) => {
    const next = posts.filter(p => p.id !== id);
    saveBlogPosts(next); setPosts(next);
  };

  const addImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgSrc) return toast.error("Select an image");
    const next = [{ id: crypto.randomUUID(), caption, src: imgSrc, createdAt: Date.now() }, ...gallery];
    saveGallery(next); setGallery(next);
    setCaption(""); setImgSrc(undefined);
    toast.success("Image added to gallery");
  };

  const deleteImage = (id: string) => {
    const next = gallery.filter(g => g.id !== id);
    saveGallery(next); setGallery(next);
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold uppercase">Admin Panel</h1>
          <Button variant="outline" onClick={() => { logoutAdmin(); navigate("/admin/login"); }}>Logout</Button>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="models">Vehicle Models</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6"><Dashboard /></TabsContent>
          <TabsContent value="orders" className="mt-6"><OrdersManager /></TabsContent>
          <TabsContent value="inventory" className="mt-6"><InventoryManager /></TabsContent>
          <TabsContent value="categories" className="mt-6"><CategoriesManager /></TabsContent>
          <TabsContent value="brands" className="mt-6"><BrandsManager /></TabsContent>
          <TabsContent value="models" className="mt-6"><VehicleModelsManager /></TabsContent>



          <TabsContent value="blog" className="space-y-8 mt-6">
            <form onSubmit={addPost} className="space-y-4 p-6 border rounded-lg">
              <h2 className="font-display text-xl font-semibold uppercase">Write a new post</h2>
              <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} maxLength={150} /></div>
              <div><Label>Content</Label><Textarea rows={8} value={content} onChange={e => setContent(e.target.value)} /></div>
              <div>
                <Label>Cover image (optional)</Label>
                <Input type="file" accept="image/*" onChange={async e => {
                  const f = e.target.files?.[0]; if (f) setCover(await fileToDataUrl(f));
                }} />
                {cover && <img src={cover} alt="cover" className="mt-2 h-32 rounded object-cover" />}
              </div>
              <Button type="submit">Publish Post</Button>
            </form>

            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold uppercase">Existing posts ({posts.length})</h3>
              {posts.map(p => (
                <div key={p.id} className="flex items-center justify-between border p-3 rounded">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deletePost(p.id)}><Trash2 size={16} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 mt-6">
            <form onSubmit={addImage} className="space-y-4 p-6 border rounded-lg">
              <h2 className="font-display text-xl font-semibold uppercase">Add image to gallery</h2>
              <div><Label>Caption (optional)</Label><Input value={caption} onChange={e => setCaption(e.target.value)} maxLength={120} /></div>
              <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={async e => {
                  const f = e.target.files?.[0]; if (f) setImgSrc(await fileToDataUrl(f));
                }} />
                {imgSrc && <img src={imgSrc} alt="preview" className="mt-2 h-32 rounded object-cover" />}
              </div>
              <Button type="submit">Add to Gallery</Button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map(g => (
                <div key={g.id} className="relative group border rounded overflow-hidden">
                  <img src={g.src} alt={g.caption} className="w-full h-40 object-cover" />
                  {g.caption && <div className="p-2 text-xs">{g.caption}</div>}
                  <Button size="icon" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => deleteImage(g.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
