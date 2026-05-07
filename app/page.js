import ObjectDetection from "@/components/object-detection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <div className="max-w-4xl text-center">
        <h1 className="gradient-title font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-tight md:px-6 text-center">
          Object Detection
        </h1>
        <p className="mt-4 text-slate-700 text-base md:text-lg lg:text-xl">
          Detect people and everyday objects in real time using your webcam with a clean, modern interface.
        </p>
      </div>
      <ObjectDetection />
    </main>
  );
}
