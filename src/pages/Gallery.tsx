import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { getGallery, GalleryImage } from "@/lib/adminStore";

const Gallery = () => {
  const [imgs, setImgs] = useState<GalleryImage[]>([]);
  useEffect(() => { setImgs(getGallery()); }, []);

  return (
    <Layout>
      <SEO title="Gallery — The Stoic Automobiles" description="Inside the counter and warehouse: genuine spares, our team, and the workshops we supply." path="/gallery" />
      <div className="container mx-auto py-12">
        <h1 className="font-display text-4xl font-bold uppercase mb-8">Gallery</h1>
        {imgs.length === 0 ? (
          <p className="text-muted-foreground">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imgs.map(g => (
              <figure key={g.id} className="border rounded overflow-hidden">
                <img src={g.src} alt={g.caption || "Gallery image"} className="w-full h-56 object-cover" loading="lazy" />
                {g.caption && <figcaption className="p-2 text-sm">{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gallery;
