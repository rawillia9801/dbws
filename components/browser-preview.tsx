import Image from "next/image";
import { MonitorSmartphone } from "lucide-react";

const puppyPhotos = [
  "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=480&q=85",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=480&q=85",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=480&q=85",
];

export function BrowserPreview() {
  return (
    <div className="preview-stage" aria-label="Responsive breeder website preview">
      <div className="responsive-badge"><MonitorSmartphone size={23} /><span>Designed for<br />every screen</span></div>
      <div className="laptop">
        <div className="laptop-screen">
          <div className="demo-nav">
            <span className="demo-brand">Willow Creek<br /><b>Chihuahuas</b></span>
            <span>Our Dogs</span><span>Available Puppies</span><span>Upcoming Litters</span><span>About</span>
          </div>
          <div className="demo-hero">
            <Image
              src="https://images.unsplash.com/photo-1610041518868-f9284e7eecfe?auto=format&fit=crop&w=1200&q=88"
              alt="Small dog sitting outdoors"
              fill
              sizes="(max-width: 900px) 90vw, 50vw"
              priority
            />
            <div className="demo-hero-copy"><b>Thoughtfully bred.<br />Lovingly raised.</b><span>Meet our dogs and learn about our program.</span></div>
          </div>
          <div className="demo-puppies">
            <h3>Available Puppies</h3>
            <div>{puppyPhotos.map((src, index) => <Image key={src} src={src} alt={`Example puppy ${index + 1}`} width={180} height={110} sizes="180px" />)}</div>
          </div>
        </div>
        <div className="laptop-base" />
      </div>
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-brand">Willow Creek <b>Chihuahuas</b></div>
        <div className="phone-photo"><Image src={puppyPhotos[1]} alt="Example puppy website on a phone" fill sizes="170px" /></div>
        <h4>Available Puppies</h4>
        <div className="phone-card"><Image src={puppyPhotos[0]} alt="Luna" width={48} height={48} /><span><b>Luna</b><small>View details</small></span></div>
      </div>
    </div>
  );
}
