import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { getBlogPosts, BlogPost } from "@/lib/adminStore";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => { setPosts(getBlogPosts()); }, []);

  return (
    <Layout>
      <SEO title="Auto Parts Blog & Guides" description="Buying guides, fitment tips and maintenance advice for genuine car and bike spares in India." path="/blog" />
      <div className="container mx-auto py-12">
        <h1 className="font-display text-4xl font-bold uppercase mb-8">Blog</h1>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-10">
            {posts.map(p => (
              <article key={p.id} className="border-b pb-8">
                {p.cover && <img src={p.cover} alt={p.title} className="w-full max-h-80 object-cover rounded mb-4" />}
                <h2 className="font-display text-2xl font-bold mb-2">{p.title}</h2>
                <div className="text-xs text-muted-foreground mb-3">{new Date(p.createdAt).toLocaleDateString()}</div>
                <p className="whitespace-pre-wrap leading-relaxed">{p.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;
