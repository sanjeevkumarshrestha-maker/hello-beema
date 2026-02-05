import React from 'react';

export default function Dashboard() {
  // Sample data - We will connect this to Supabase tomorrow!
  const vehicles = [
    { plate: "BA 3 PA 1234", status: "Healthy", expiry: "2082-03-15", cc: "160", color: "bg-green-100 text-green-700 border-green-200" },
    { plate: "PRO-03-002", status: "Warning", expiry: "2081-11-20", cc: "220", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#393ba8]">Hello Beema</h1>
          <p className="text-slate-500">Namaste, your vehicle security center.</p>
        </div>
        <button className="bg-[#393ba8] hover:bg-[#1b75bc] text-white px-4 py-2 rounded-lg transition shadow-sm font-medium">
          + Add Vehicle
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Dashboard Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-700">Vehicle Health Carousel</h2>
            <span className="text-xs text-slate-400">Swipe to view more →</span>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {vehicles.map((v) => (
              <div key={v.plate} className="min-w-[320px] bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-[#1b75bc] transition-all">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 border ${v.color}`}>
                  {v.status}
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{v.plate}</h3>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax Expiry (BS)</span>
                    <span className="font-semibold text-slate-700">{v.expiry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Engine Capacity</span>
                    <span className="font-semibold text-slate-700">{v.cc} CC</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-[#393ba8] hover:text-white text-[#393ba8] font-bold rounded-xl transition-colors border border-slate-100">
                  Manage Vehicle
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 mb-5">Quick Actions</h2>
            <div className="space-y-4">
              <div className="p-4 border border-blue-50 rounded-xl hover:bg-blue-50 cursor-pointer transition group">
                <p className="font-bold text-[#393ba8] group-hover:text-[#1b75bc]">Renew Bluebook</p>
                <p className="text-xs text-slate-500 mt-1">Instant tax estimation & rider booking</p>
              </div>
              <div className="p-4 border border-slate-50 rounded-xl hover:bg-slate-50 cursor-pointer transition">
                <p className="font-bold text-slate-700">Insurance Quote</p>
                <p className="text-xs text-slate-500 mt-1">Compare third-party & full insurance</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#393ba8] to-[#1b75bc] p-6 rounded-2xl text-white">
            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
            <p className="text-sm opacity-90 mb-4">Contact our support for bluebook pickup issues.</p>
            <button className="w-full py-2 bg-white text-[#393ba8] rounded-lg font-bold text-sm">
              Call Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
