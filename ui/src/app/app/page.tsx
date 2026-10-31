"use client";

import React from "react";
import LiveCustomerApplianceWorkbench from "../../components/LiveCustomerApplianceWorkbench";

export default function TrailVaultEnterpriseAppPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#05070B] text-slate-100 p-2 sm:p-4 outline-none">
      <h1 className="sr-only">TrailVault™ Enterprise Enclave Intelligence Workbench</h1>
      <div className="max-w-[1800px] mx-auto">
        <LiveCustomerApplianceWorkbench standaloneMode={true} />
      </div>
    </main>
  );
}
