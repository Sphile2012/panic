export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-md mx-auto px-4 pb-24 pt-6 animate-pulse">
        {/* Status bar */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="h-7 w-44 bg-white/5 rounded-xl mb-2" />
            <div className="h-3 w-32 bg-white/5 rounded-lg" />
            <div className="flex gap-2 mt-3">
              <div className="h-5 w-28 bg-white/5 rounded-full" />
              <div className="h-5 w-20 bg-white/5 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-20 bg-white/5 rounded-full" />
            <div className="h-5 w-24 bg-white/5 rounded-full" />
          </div>
        </div>

        {/* Panic button placeholder */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex gap-2 mb-6 w-full">
            {[1,2,3].map(i => <div key={i} className="flex-1 h-14 bg-white/5 rounded-xl" />)}
          </div>
          <div className="h-4 w-24 bg-white/5 rounded-lg mb-1" />
          <div className="h-3 w-36 bg-white/5 rounded-lg mb-4" />
          <div className="w-44 h-44 rounded-full bg-white/5" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
        </div>

        {/* Map */}
        <div className="h-60 bg-white/5 rounded-2xl mb-6" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}