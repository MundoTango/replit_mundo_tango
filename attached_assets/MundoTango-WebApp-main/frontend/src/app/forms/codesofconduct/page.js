"use client";

import CodesofConduct from "@/sections/auth/CodesofConduct/CodesofConduct";
import CodesofConductTwo from "@/sections/auth/CodesofConduct/CodesofConductTwo";
import { useState } from "react";

function Page() {
  const [codesPage, setCodesPage] = useState(1);

  const handleNext = () => setCodesPage(2);

  const handleBack = () => setCodesPage(1);

  const Component = {
    1: <CodesofConduct handleNext={handleNext} />,
    // 2: <CodesofConductTwo handleBack={handleBack} />,
  };

  return Component[codesPage];
}

export default Page;
