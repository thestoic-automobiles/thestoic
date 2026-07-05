import { Phone } from "lucide-react";

const WhatsAppButton = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
    <a
      href={`https://wa.me/917387480081?text=${encodeURIComponent("Hi, I would like to enquire about an auto part from The Stoic Automobiles.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.96A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.338 22.614c-.394 1.108-1.946 2.03-3.2 2.298-.858.182-1.978.326-5.752-1.238-4.828-2-7.932-6.898-8.174-7.218-.232-.32-1.948-2.594-1.948-4.948s1.232-3.512 1.67-3.994c.438-.482.956-.602 1.274-.602.318 0 .636.004.914.016.294.014.688-.112 1.076.82.394.952 1.352 3.306 1.472 3.546.118.24.196.52.038.84-.158.32-.238.52-.476.8-.238.28-.5.626-.714.838-.238.238-.486.498-.208.978.278.478 1.236 2.038 2.654 3.302 1.822 1.624 3.358 2.128 3.836 2.366.478.24.756.2 1.034-.118.278-.32 1.194-1.388 1.512-1.868.318-.478.636-.398 1.074-.238.438.158 2.794 1.316 3.272 1.556.478.238.796.358.914.556.118.198.118 1.148-.276 2.258z" />
      </svg>
    </a>
    <a
      href="tel:+917387480081"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-signal shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Call us"
    >
      <Phone className="h-6 w-6 text-white" fill="white" />
    </a>
  </div>
);

export default WhatsAppButton;
