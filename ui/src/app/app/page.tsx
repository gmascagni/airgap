"use client";

import React from "react";
import LiveCustomerApplianceWorkbench from "../../components/LiveCustomerApplianceWorkbench";

export default function AirVaultEnterpriseAppPage() {
  return (
    <main className="min-h-screen bg-[#05070B] text-slate-100 p-2 sm:p-4">
      <div className="max-w-[1800px] mx-auto">
        <LiveCustomerApplianceWorkbench standaloneMode={true} />
      </div>
    </main>
  );
}
