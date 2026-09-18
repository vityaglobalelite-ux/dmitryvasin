"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AccountBackLink,
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { AccessMeter } from "@/components/site/account/AccessMeter";
import { accountT, type AccountCopy } from "@/components/site/account/copy";
import { remainingAccess } from "@/components/site/account/remaining";
import { useAccessEntry } from "@/components/site/account/use-access-entry";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { isAccessActive } from "@/lib/catalog/access";
import { POSTURE_BUNDLE } from "@/lib/catalog/ids";
import { useMyAccess } from "@/lib/catalog/hooks-account";
import { CATALOG_STATIC_PARAM_STUB } from "@/lib/catalog/static-params";
import { productCopy } from "@/lib/catalog/locale";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { getPublishedProduct } from "@/lib/catalog/repo/products";
import type { Access, ProgramBlock, Product } from "@/lib/catalog/types";
import { ProductNotFound } from "@/components/site/product/ProductStates";

function paramId(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  if (!value || value === CATALOG_STATIC_PARAM_STUB) return null;
  return value;
}

function pickEarlierExpiry(a: Access, b: Access): string {
  return new Date(a.expiresAt).getTime() < new Date(b.expiresAt).getTime()
    ? a.expiresAt
    : b.expiresAt;
}

function resolvePostureFullAccess(
  rows: Access[],
  fullProduct: Product | null,
): Access | null {
  const block1 = rows.find(
    (row) =>
      row.productId === POSTURE_BUNDLE.block1Id && isAccessActive(row),
  );
  const block2 = rows.find(
    (row) =>
      row.productId === POSTURE_BUNDLE.block2Id && isAccessActive(row),
  );
  if (!block1 || !block2 || !fullProduct) return null;
  return {
    ...block1,
    productId: POSTURE_BUNDLE.fullId,
    expiresAt: pickEarlierExpiry(block1, block2),
    product: fullProduct,
  };
}

function blockHeading(blockKey: string, ui: AccountCopy): string {
  if (blockKey === "block1") return ui.programBlock1;
  if (blockKey === "block2") return ui.programBlock2;
  return blockKey;
}

export function AccountCourseView() {
  const params = useParams();
  const id = paramId(params.id);
  const router = useRouter();
  const gate = useAccountGate();
  const entry = useAccessEntry(id, Boolean(gate.user) && !gate.pending);
  const allAccess = useMyAccess();
  const locale = useLocale();
  const copyUi = accountT(locale);
  const routes = useLocalizedRoutes();
  const [fullCourseProduct, setFullCourseProduct] = useState<Product | null>(
    null,
  );

  const needsPostureFullProduct =
    id === POSTURE_BUNDLE.fullId &&
    !entry.data?.product &&
    Boolean(
      allAccess.data.some(
        (row) => row.productId === POSTURE_BUNDLE.block1Id && isAccessActive(row),
      ) &&
        allAccess.data.some(
          (row) =>
            row.productId === POSTURE_BUNDLE.block2Id && isAccessActive(row),
        ),
    );

  useEffect(() => {
    if (!needsPostureFullProduct) {
      setFullCourseProduct(null);
      return undefined;
    }
    let cancelled = false;
    void getPublishedProduct(POSTURE_BUNDLE.fullId, locale).then((product) => {
      if (!cancelled) setFullCourseProduct(product);
    });
    return () => {
      cancelled = true;
    };
  }, [needsPostureFullProduct, locale]);

  const access = useMemo((): Access | null => {
    const direct = entry.data;
    if (direct && isAccessActive(direct) && direct.product) return direct;
    if (id === POSTURE_BUNDLE.fullId) {
      return resolvePostureFullAccess(allAccess.data, fullCourseProduct);
    }
    return direct;
  }, [allAccess.data, entry.data, fullCourseProduct, id]);

  useEffect(() => {
    if (gate.pending || entry.loading || !id) return;
    if (allAccess.loading && id === POSTURE_BUNDLE.fullId) return;

    if (!access || !access.product) {
      router.replace(routes.product(id));
      return;
    }
    if (!isAccessActive(access)) {
      router.replace(routes.accountExpired);
      return;
    }
    if (access.product.type !== "course") {
      router.replace(routes.accountWatch(id));
    }
  }, [
    access,
    allAccess.loading,
    entry.loading,
    gate.pending,
    id,
    router,
    routes,
  ]);

  if (!id) return <ProductNotFound />;
  if (
    gate.pending ||
    entry.loading ||
    (needsPostureFullProduct && !fullCourseProduct)
  ) {
    return <AccountShellSkeleton variant="form" />;
  }

  if (!access || !isAccessActive(access) || access.product?.type !== "course") {
    return <AccountShellSkeleton variant="form" />;
  }

  const product = access.product;
  const copy = productCopy(product, locale);
  const remaining = remainingAccess(access, new Date(), locale);
  const blocks = product.programBlocks.blocks;

  return (
    <AccountShell email={gate.user?.email} active="materials">
      <div className="flex flex-col gap-5">
        <AccountBackLink />
        <h1 className="max-w-[799px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[30px] max-[600px]:tracking-[-0.9px]">
          {copy.title}
        </h1>
        <AccessMeter remaining={remaining} />
        <section className="rounded-[20px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
          <h2 className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
            {copyUi.programTitle}
          </h2>
          {blocks.length === 0 ? (
            <p className="mt-5 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
              {copyUi.programEmpty}
            </p>
          ) : (
            <div className="mt-8 flex flex-col gap-10 max-[600px]:gap-8">
              {blocks.map((block) => (
                <CourseProgramBlock
                  key={block.blockKey}
                  block={block}
                  ui={copyUi}
                  showBlockTitle={blocks.length > 1}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AccountShell>
  );
}

function CourseProgramBlock({
  block,
  ui,
  showBlockTitle,
}: {
  block: ProgramBlock;
  ui: AccountCopy;
  showBlockTitle: boolean;
}) {
  const hasLessons = block.lessons.length > 0;
  const hasOutcomes = block.outcomes.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {showBlockTitle ? (
        <h3 className="text-[20px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
          {blockHeading(block.blockKey, ui)}
        </h3>
      ) : null}
      {hasOutcomes ? (
        <div className="flex flex-col gap-3">
          <p className="text-[14px] font-semibold uppercase leading-[1.1] text-accent-red max-[600px]:text-[13px]">
            {ui.programOutcomes}
          </p>
          <ul className="flex flex-col gap-2">
            {block.outcomes.map((line, index) => (
              <li
                key={`${block.blockKey}-outcome-${index}`}
                className="rounded-[10px] bg-white p-3 text-[16px] leading-[1.5] text-text max-[600px]:p-2.5 max-[600px]:text-[13px]"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hasLessons ? (
        <ol className="flex flex-col gap-3">
          {block.lessons.map((lesson, index) => (
            <li
              key={`${block.blockKey}-lesson-${lesson.sort}`}
              className="flex flex-col gap-3 rounded-[10px] bg-white p-3 max-[600px]:p-2.5"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-[17px] shrink-0 items-center justify-center rounded-full bg-[image:var(--brand-gradient)] text-[12px] font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-[16px] leading-normal text-text max-[600px]:text-[13px]">
                  {lesson.title}
                </span>
              </div>
              {lesson.gifUrls.length > 0 ? (
                <div className="flex flex-wrap gap-2 pl-[27px] max-[600px]:pl-0">
                  {lesson.gifUrls.map((url) => (
                    <div
                      key={url}
                      className="relative h-[120px] w-[160px] overflow-hidden rounded-[10px] bg-light-gray max-[600px]:h-[100px] max-[600px]:w-full max-[600px]:max-w-[280px]"
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="160px"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
