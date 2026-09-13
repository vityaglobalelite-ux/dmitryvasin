"use client";

import { Button } from "@/components/site/ui/Button";
import { accountT } from "@/components/site/account/copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

export function AccountMaterialsEmpty() {
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
        {copy.materialsTitle}
      </h1>
      <div className="max-w-[640px] rounded-[20px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
        <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
          {copy.emptyTitle}
        </p>
        <p className="mt-4 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
          {copy.emptyBody}
        </p>
        <Button href={routes.catalog} className="mt-8 h-[60px] max-[600px]:h-[50px]">
          {copy.catalogCta}
        </Button>
      </div>
    </div>
  );
}
