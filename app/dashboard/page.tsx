import React from 'react';

export default function Dashboard() {
  const vehicles = [
    { plate: "BA 3 PA 1234", status: "Healthy", expiry: "2082-03-15", cc: "160", color: "bg-green-100 text-green-700" },
    { plate: "PRO-03-002", status: "Warning", expiry: "2081-11-20", cc: "220", color: "bg-yellow-100 text-yellow-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Hello Beema</h1>
          <p className="text-slate-500">Namaste, your vehicle security center.</p>
        </div>
        <div className="bg-blue-900 text-white px-4 py-2 rounded-lg cursor-pointer">+ Add Vehicle</div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard Area */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-slate-700">Vehicle Health Carousel</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {vehicles.map((v) => (
              <div key={v.plate} className="min-w-[300px] bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${v.color}`}>
                  {v.status}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{v.plate}</h3>
                <div className="mt-4 text-sm text-slate-500 flex justify-between">
                  <span>Tax Expiry: <b>{v.expiry}</b></span>
                  <span>{v.cc} CC</span>
                </div>
                <button className="w-full mt-6 py-2 bg-slate-100 hover:bg-blue-50 text-blue-900 font-semibold rounded-xl transition">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <div className="p-4 border border-blue-100 rounded-xl hover:bg-blue-50 cursor-pointer group">
              <p className="font-bold text-blue-900 group-hover:underline">Renew Bluebook</p>
              <p className="text-xs text-slate-500">Estimate tax & book a rider</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer">
              <p className="font-bold text-slate-700">Insurance Quote</p>
              <p className="text-xs text-slate-500">Compare third-party rates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
