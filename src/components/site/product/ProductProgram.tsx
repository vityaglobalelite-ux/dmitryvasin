"use client";

import Link from "next/link";
import { productAssets } from "@/components/site/product/assets";
import { productUi } from "@/components/site/product/copy";
import { LessonGifRow } from "@/components/site/product/LessonGif";
import { Button } from "@/components/site/ui/Button";
import { CatalogMoney, CatalogPrice } from "@/components/site/ui/CatalogPrice";
import { formatAccessLabel, lessonNoun } from "@/components/site/catalog/display";
import { useCatalogCurrency } from "@/lib/catalog/currency-context";
import {
  POSTURE_COURSE_BLOCK1_ID,
  POSTURE_COURSE_BLOCK2_ID,
} from "@/lib/catalog/ids";
import { catalogT } from "@/lib/catalog/i18n";
import { useCatalogT, useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { catalogPriceMinor } from "@/lib/catalog/money";
import type { Locale, Product, ProgramBlock } from "@/lib/catalog/types";

export type ProductCartApi = {
  add: (productId: string) => Promise<void>;
  isAdded: (productId: string) => boolean;
  pendingFor: (productId: string) => boolean;
  ready: boolean;
};

export function hasShopPrice(product: Product): boolean {
  return product.priceMinor > 0;
}

function blockNumber(blockKey: string, index: number): number {
  const match = blockKey.match(/(\d+)/);
  if (match) return Number(match[1]);
  return index + 1;
}

function skuForBlock(block: ProgramBlock, children: Product[], index: number): Product | null {
  if (block.blockKey === "block1") {
    return children.find((item) => item.id === POSTURE_COURSE_BLOCK1_ID) ?? children[index] ?? null;
  }
  if (block.blockKey === "block2") {
    return children.find((item) => item.id === POSTURE_COURSE_BLOCK2_ID) ?? children[index] ?? null;
  }
  return children[index] ?? null;
}

function headingFromTitle(title: string, n: number): string {
  const stripped = title
    .replace(new RegExp(`^Блок\\s*${n}:\\s*`, "i"), "")
    .replace(new RegExp(`^Block\\s*${n}:\\s*`, "i"), "")
    .replace(/^[«"]+|[»"]+$/g, "")
    .trim();
  return stripped || title;
}

function accessMeta(days: number, locale: Locale): string | null {
  const t = catalogT(locale);
  const label = formatAccessLabel(days, "chip", locale);
  if (!label) return null;
  return label.replace(new RegExp(`^${t.product.access}:\\s*`), `${t.product.access} `);
}

export function ProductProgram({
  id,
  product,
  cart,
  parent,
  bundleChildren,
}: {
  id: string;
  product: Product;
  cart: ProductCartApi;
  parent: Product | null;
  bundleChildren: Product[];
}) {
  const locale = useLocale();
  const t = useCatalogT();
  const ui = productUi(locale);
  const routes = useLocalizedRoutes();
  const blocks = product.programBlocks.blocks;
  const isBlockSku = Boolean(product.bundleParentId);
  const fullProduct = isBlockSku ? parent : product;
  const lead = isBlockSku ? ui.programLeadBlock : ui.programLead;

  return (
    <section id={id} className="mt-[100px] scroll-mt-24 max-[600px]:mt-10">
      <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
        {t.product.programTitle}
      </h2>
      <p className="mt-5 max-w-[702px] text-[24px] leading-[1.2] text-text max-[600px]:mt-2.5 max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
        {blocks.length > 0
          ? lead
          : product.lessonCount
            ? `${product.lessonCount} ${lessonNoun(product.lessonCount, locale)}`
            : t.product.courseContents}
      </p>
      {isBlockSku && parent ? (
        <p className="mt-3 text-[16px] leading-[1.5] max-[600px]:text-[13px]">
          <Link
            href={routes.product(parent.id)}
            className="font-medium text-plum underline decoration-plum/30 underline-offset-4 transition-opacity hover:opacity-80"
          >
            {ui.viewFullCourse}
          </Link>
        </p>
      ) : null}

      {blocks.length === 0 ? (
        <ProgramSoon />
      ) : (
        <div className="mt-10 flex flex-col gap-10 max-[600px]:mt-5 max-[600px]:gap-5">
          {blocks.map((block, index) => (
            <ProgramBlockCard
              key={block.blockKey}
              block={block}
              index={index}
              product={product}
              sku={isBlockSku ? product : skuForBlock(block, bundleChildren, index)}
              cart={cart}
            />
          ))}
        </div>
      )}

      {fullProduct && hasShopPrice(fullProduct) ? (
        <BundleBanner
          full={fullProduct}
          parts={
            isBlockSku
              ? [product, ...bundleChildren.filter((item) => item.id !== product.id)]
              : bundleChildren
          }
          cart={cart}
          parentHref={
            isBlockSku && fullProduct.id !== product.id
              ? routes.product(fullProduct.id)
              : undefined
          }
        />
      ) : null}
    </section>
  );
}

function ProgramSoon() {
  const ui = productUi(useLocale());
  return (
    <article className="mt-10 flex flex-col gap-10 rounded-[30px] bg-light-gray p-10 max-[600px]:mt-5 max-[600px]:gap-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
      <header className="flex flex-wrap items-center gap-5 max-[600px]:gap-2.5">
        <span className="inline-flex h-[45px] items-center justify-center rounded-[30px] bg-white px-5 text-[16px] font-semibold leading-[1.2] text-text/40 max-[600px]:h-8 max-[600px]:px-3 max-[600px]:text-[13px]">
          {ui.programSoonTitle}
        </span>
      </header>
      <p className="max-w-[720px] text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
        {ui.programSoonBody}
      </p>
    </article>
  );
}

function ProgramBlockCard({
  block,
  index,
  product,
  sku,
  cart,
}: {
  block: ProgramBlock;
  index: number;
  product: Product;
  sku: Product | null;
  cart: ProductCartApi;
}) {
  const locale = useLocale();
  const t = useCatalogT();
  const ui = productUi(locale);
  const n = blockNumber(block.blockKey, index);
  const lessons = [...block.lessons].sort((a, b) => a.sort - b.sort);
  const title = headingFromTitle(sku?.i18n[locale].title || product.i18n[locale].title, n);
  const lessonCount = lessons.length || sku?.lessonCount || 0;
  const accessDays = sku?.accessDays ?? product.accessDays;
  const access = accessMeta(accessDays, locale);
  const buyId = sku?.id ?? product.id;
  const priced = sku && hasShopPrice(sku);
  const added = cart.isAdded(buyId);

  return (
    <article className="flex flex-col gap-10 rounded-[30px] bg-light-gray p-10 max-[600px]:gap-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
      <header className="flex flex-wrap items-center gap-5 max-[600px]:gap-2.5">
        <span className="inline-flex h-[45px] items-center justify-center rounded-[30px] bg-[image:var(--brand-gradient)] px-5 text-[16px] font-semibold leading-[1.2] text-white max-[600px]:h-8 max-[600px]:px-3 max-[600px]:text-[13px]">
          {ui.blockLabel.replace("{n}", String(n))}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
            {title}
          </h3>
          <p className="flex flex-wrap items-center gap-2.5 text-[12px] font-medium leading-[1.2] text-[rgba(37,37,37,0.6)]">
            {lessonCount ? (
              <span>
                {lessonCount} {lessonNoun(lessonCount, locale)}
              </span>
            ) : null}
            {lessonCount && access ? (
              <span aria-hidden className="h-2.5 w-px rotate-90 bg-[rgba(37,37,37,0.2)]" />
            ) : null}
            {access ? <span>{access}</span> : null}
          </p>
        </div>
      </header>

      {block.outcomes.length > 0 ? (
        <div className="flex max-w-[720px] flex-col gap-5">
          <p className="text-[14px] font-semibold uppercase leading-[1.1] text-accent-red">
            {ui.outcomes}
          </p>
          <ul className="flex flex-col gap-2.5">
            {block.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2.5">
                <img
                  src={productAssets.check}
                  alt=""
                  width={17}
                  height={17}
                  className="mt-0.5 size-[17px] shrink-0"
                />
                <span className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
                  {outcome}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lessons.length > 0 ? (
        <div className="flex flex-col gap-5">
          <p className="text-[14px] font-semibold uppercase leading-[1.1] text-accent-red">
            {ui.lessons}
          </p>
          <div className="flex flex-col gap-0.5" role="list">
            {lessons.map((lesson, lessonIndex) => (
              <div
                key={`${block.blockKey}-${lesson.sort}-${lesson.title}`}
                role="listitem"
                className="flex flex-col gap-3 rounded-[10px] bg-white p-3 max-[600px]:gap-2.5 max-[600px]:p-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-[17px] shrink-0 items-center justify-center rounded-full bg-[image:var(--brand-gradient)] text-[12px] font-semibold text-white">
                    {lessonIndex + 1}
                  </span>
                  <p className="text-[16px] leading-normal text-text max-[600px]:text-[13px]">
                    {lesson.title}
                  </p>
                </div>
                <LessonGifRow urls={lesson.gifUrls} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {priced ? (
        <div className="flex flex-wrap items-center gap-[60px] max-[600px]:gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-semibold uppercase leading-[1.5] text-[rgba(37,37,37,0.6)]">
              {ui.blockOnly}
            </p>
            <div className="text-[30px] font-bold leading-[1.2] text-plum max-[600px]:text-[24px]">
              <CatalogPrice product={sku} />
            </div>
          </div>
          <SkuBuyButton
            added={added}
            pending={cart.pendingFor(buyId)}
            ready={cart.ready}
            label={added ? t.product.inCart : t.product.addToCart}
            onAdd={() => {
              void cart.add(buyId);
            }}
          />
        </div>
      ) : null}
    </article>
  );
}

function BundleBanner({
  full,
  parts,
  cart,
  parentHref,
}: {
  full: Product;
  parts: Product[];
  cart: ProductCartApi;
  parentHref?: string;
}) {
  const locale = useLocale();
  const t = useCatalogT();
  const ui = productUi(locale);
  const routes = useLocalizedRoutes();
  const { currency, ready } = useCatalogCurrency();
  const added = cart.isAdded(full.id);
  const pricedParts = parts.filter(hasShopPrice);
  const blockSum =
    ready && pricedParts.length >= 2
      ? pricedParts.reduce((sum, item) => sum + catalogPriceMinor(item, currency), 0)
      : 0;
  const fullMinor = ready ? catalogPriceMinor(full, currency) : 0;
  const save = blockSum > fullMinor ? blockSum - fullMinor : 0;
  const access = accessMeta(full.accessDays, locale);

  return (
    <div className="mt-10 overflow-hidden rounded-[30px] bg-[image:var(--brand-gradient)] p-10 max-[600px]:mt-5 max-[600px]:rounded-[10px] max-[600px]:p-5">
      <div className="flex flex-wrap items-stretch justify-between gap-8">
        <div className="flex min-w-[240px] flex-1 flex-col justify-between gap-8">
          <h3 className="max-w-[485px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
            {t.product.buyBundle}
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {full.lessonCount ? (
              <span className="inline-flex items-center gap-2.5 rounded-[30px] border border-white/50 px-[15px] py-2.5 text-[16px] text-white max-[600px]:text-[13px]">
                <img
                  src={productAssets.checkWhite}
                  alt=""
                  width={17}
                  height={17}
                  className="size-[17px]"
                />
                {full.lessonCount} {lessonNoun(full.lessonCount, locale)}
              </span>
            ) : null}
            {access ? (
              <span className="inline-flex items-center gap-2.5 rounded-[30px] border border-white/50 px-[15px] py-2.5 text-[16px] text-white max-[600px]:text-[13px]">
                <img
                  src={productAssets.checkWhite}
                  alt=""
                  width={17}
                  height={17}
                  className="size-[17px]"
                />
                {access}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full max-w-[405px] flex-col justify-between gap-6 rounded-[20px] bg-white p-5">
          {save > 0 ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-5">
                <div className="text-[24px] font-semibold uppercase leading-[1.5] text-[rgba(33,33,33,0.6)] line-through decoration-from-font">
                  <CatalogMoney minor={blockSum} />
                </div>
                <p className="text-[12px] leading-normal text-[rgba(33,33,33,0.6)]">
                  {ui.separateBlocks}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[27px]">
                <div className="bg-[image:var(--brand-gradient)] bg-clip-text text-[50px] font-bold leading-[1.2] text-transparent max-[600px]:text-[32px]">
                  <CatalogPrice product={full} />
                </div>
                <div className="rounded-[30px] bg-light-gray px-[15px] py-2.5 text-[16px] font-semibold leading-[1.2] text-text">
                  −<CatalogMoney minor={save} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[image:var(--brand-gradient)] bg-clip-text text-[50px] font-bold leading-[1.2] text-transparent max-[600px]:text-[32px]">
              <CatalogPrice product={full} />
            </div>
          )}
          <SkuBuyButton
            added={added}
            pending={cart.pendingFor(full.id)}
            ready={cart.ready}
            label={added ? t.product.inCart : t.product.buyCourse}
            onAdd={() => {
              void cart.add(full.id);
            }}
          />
        </div>
      </div>
      <p aria-live="polite" className="mt-5 min-h-[1.5em] text-[14px] leading-[1.5] text-white/80">
        {parentHref ? (
          <Link
            href={parentHref}
            className="font-medium text-white underline decoration-white/40 underline-offset-4 transition-opacity hover:opacity-80"
          >
            {ui.viewFullCourse}
          </Link>
        ) : added ? (
          <Link
            href={routes.cart}
            className="font-medium text-white underline decoration-white/40 underline-offset-4 transition-opacity hover:opacity-80"
          >
            {t.product.addedOpenCart}
          </Link>
        ) : null}
      </p>
    </div>
  );
}

function SkuBuyButton({
  added,
  pending,
  ready,
  label,
  onAdd,
}: {
  added: boolean;
  pending: boolean;
  ready: boolean;
  label: string;
  onAdd: () => void;
}) {
  const routes = useLocalizedRoutes();
  if (added) {
    return (
      <Button href={routes.cart} className="gap-2.5 max-[600px]:h-[50px] max-[600px]:px-4 max-[600px]:text-[13px]">
        {label}
        <img
          src={productAssets.checkWhite}
          alt=""
          width={17}
          height={17}
          className="size-[17px]"
        />
      </Button>
    );
  }
  return (
    <Button
      type="button"
      onClick={onAdd}
      disabled={!ready || pending}
      className="gap-2.5 max-[600px]:h-[50px] max-[600px]:px-4 max-[600px]:text-[13px]"
    >
      {label}
      <img
        src={productAssets.cart}
        alt=""
        width={27}
        height={26}
        className="h-[26px] w-[27px] max-[600px]:h-4 max-[600px]:w-[17px]"
      />
    </Button>
  );
}
