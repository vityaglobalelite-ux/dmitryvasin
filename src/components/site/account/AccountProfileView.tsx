"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AccountAvatar } from "@/components/site/account/AccountAvatar";
import {
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { accountT, type AccountCopy } from "@/components/site/account/copy";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { Button } from "@/components/site/ui/Button";
import { siteAssets } from "@/lib/catalog/assets";
import { useCatalogT, useLocale } from "@/lib/catalog/locale-context";
import {
  AVATAR_MAX_BYTES,
  deleteMyAvatar,
  profileAvatarSrc,
  updateMyProfile,
  uploadMyAvatar,
} from "@/lib/catalog/repo/profile";
import { useMyProfile } from "@/lib/catalog/hooks-account";
import { updatePassword } from "@/lib/supabase/auth";
import type { Profile } from "@/lib/catalog/types";

const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const AVATAR_OUTPUT_SIZE = 512;

export function AccountProfileView() {
  const gate = useAccountGate();
  const copy = accountT(useLocale());
  const passwordCopy = useCatalogT();
  const profileQuery = useMyProfile();
  const [profile, setProfile] = useState<Profile | null>(() => profileQuery.data);
  const [firstName, setFirstName] = useState(() => profileQuery.data?.firstName ?? "");
  const [lastName, setLastName] = useState(() => profileQuery.data?.lastName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [securityBusy, setSecurityBusy] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySaved, setSecuritySaved] = useState(false);
  const hydrated = useRef(Boolean(profileQuery.data));

  useEffect(() => {
    const next = profileQuery.data;
    if (!next) return;
    setProfile(next);
    if (hydrated.current) return;
    hydrated.current = true;
    setFirstName(next.firstName);
    setLastName(next.lastName);
  }, [profileQuery.data]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (gate.pending || (!profile && profileQuery.loading)) {
    return <AccountShellSkeleton variant="form" />;
  }

  const email = gate.user?.email ?? profile?.email ?? "";
  const shownAvatar = previewUrl ?? (removeAvatar ? null : profileAvatarSrc(profile));
  const hasCustomPhoto = Boolean(shownAvatar);

  function bumpReveal() {
    setRevealKey((key) => key + 1);
  }

  function onPickFile(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
    setRemoveAvatar(false);
    setProfileSaved(false);
    setProfileError(null);
    bumpReveal();
  }

  async function onSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSaved(false);
    setProfileBusy(true);
    setProfileError(null);
    const previousPath = profile?.avatarPath ?? null;
    const previousBucket = profile?.avatarBucket ?? null;
    try {
      let avatarPath = removeAvatar ? null : previousPath;
      let avatarBucket = removeAvatar ? null : previousBucket;
      if (file) {
        const prepared = await prepareAvatarUpload(file);
        const uploaded = await uploadMyAvatar(prepared);
        avatarPath = uploaded.path;
        avatarBucket = uploaded.bucket;
      }
      const saved = await updateMyProfile({
        firstName,
        lastName,
        avatarPath,
        avatarBucket,
      });
      if (file && previousPath && previousPath !== saved.avatarPath) {
        void deleteMyAvatar(previousPath, previousBucket);
      }
      if (removeAvatar && previousPath) {
        void deleteMyAvatar(previousPath, previousBucket);
      }
      setProfile(saved);
      setFirstName(saved.firstName);
      setLastName(saved.lastName);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(null);
      setPreviewUrl(null);
      setRemoveAvatar(false);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(avatarMessage(err, copy));
    } finally {
      setProfileBusy(false);
    }
  }

  async function onSaveSecurity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSecuritySaved(false);
    if (!password && !confirm) {
      setSecurityError(copy.passwordEmpty);
      return;
    }
    if (password !== confirm) {
      setSecurityError(copy.passwordMismatch);
      return;
    }
    if (password.length < 6) {
      setSecurityError(copy.weakPassword);
      return;
    }
    setSecurityBusy(true);
    setSecurityError(null);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirm("");
      setSecuritySaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("weak") || message.includes("password should be")) {
        setSecurityError(copy.weakPassword);
      } else {
        setSecurityError(copy.passwordError);
      }
    } finally {
      setSecurityBusy(false);
    }
  }

  return (
    <AccountShell email={email} active="profile">
      <div className="w-fit max-w-full rounded-[30px] bg-light-gray p-10 max-[1100px]:w-full max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
        <div className="flex items-start gap-10 max-[1100px]:flex-col max-[1100px]:items-stretch">
          <form
            onSubmit={(event) => void onSaveProfile(event)}
            className="flex w-[396px] shrink-0 flex-col items-center gap-5 max-[1100px]:w-full"
          >
            <h1 className="text-[24px] font-medium leading-[1.2] text-[#242424]">
              {copy.profileTitle}
            </h1>

            <ProfilePhotoField
              src={shownAvatar}
              hasCustomPhoto={hasCustomPhoto}
              busy={profileBusy && Boolean(file)}
              revealKey={revealKey}
              copy={copy}
              onFile={onPickFile}
              onRemove={
                hasCustomPhoto
                  ? () => {
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setFile(null);
                      setPreviewUrl(null);
                      setRemoveAvatar(true);
                      setProfileSaved(false);
                      bumpReveal();
                    }
                  : undefined
              }
            />

            <AccountField
              label={copy.lastName}
              value={lastName}
              onChange={setLastName}
              autoComplete="family-name"
              name="lastName"
            />
            <AccountField
              label={copy.firstName}
              value={firstName}
              onChange={setFirstName}
              autoComplete="given-name"
              name="firstName"
            />

            {profileError ? (
              <p role="alert" className="w-full text-[13px] leading-[1.4] text-accent-red">
                {profileError}
              </p>
            ) : null}
            {profileSaved ? (
              <p role="status" className="w-full text-[13px] leading-[1.4] text-plum">
                {copy.profileSaved}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={profileBusy}
              className="h-[60px] w-full max-[600px]:h-[50px]"
            >
              {profileBusy ? copy.saving : copy.save}
            </Button>
          </form>

          <span
            aria-hidden
            className="h-px w-full bg-[#d9d9d9] min-[1101px]:h-auto min-[1101px]:w-px min-[1101px]:self-stretch"
          />

          <form
            onSubmit={(event) => void onSaveSecurity(event)}
            className="flex w-[396px] shrink-0 flex-col items-center gap-5 max-[1100px]:w-full"
          >
            <h2 className="text-center text-[24px] font-medium leading-[1.2] text-[#242424]">
              {copy.securityTitle}
            </h2>
            <AccountField
              label={copy.loginLabel}
              value={email}
              readOnly
              autoComplete="username"
              name="username"
            />
            <AccountField
              label={copy.newPassword}
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete="new-password"
              name="new-password"
              hideLabel={passwordCopy.ui.hidePassword}
              showLabel={passwordCopy.ui.showPassword}
            />
            <AccountField
              label={copy.confirmPassword}
              value={confirm}
              onChange={setConfirm}
              type="password"
              autoComplete="new-password"
              name="confirm-password"
              hideLabel={passwordCopy.ui.hidePassword}
              showLabel={passwordCopy.ui.showPassword}
            />
            {securityError ? (
              <p role="alert" className="w-full text-[13px] leading-[1.4] text-accent-red">
                {securityError}
              </p>
            ) : null}
            {securitySaved ? (
              <p role="status" className="w-full text-[13px] leading-[1.4] text-plum">
                {copy.passwordSaved}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={securityBusy}
              className="h-[60px] w-full"
            >
              {securityBusy ? copy.saving : copy.save}
            </Button>
          </form>
        </div>
      </div>
    </AccountShell>
  );
}

function ProfilePhotoField({
  src,
  hasCustomPhoto,
  busy,
  revealKey,
  copy,
  onFile,
  onRemove,
}: {
  src: string | null;
  hasCustomPhoto: boolean;
  busy: boolean;
  revealKey: number;
  copy: AccountCopy;
  onFile: (file: File | null) => void;
  onRemove?: () => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0];
          if (next) onFile(next);
          event.target.value = "";
        }}
      />
      <AccountAvatar
        src={src}
        size={163}
        className="size-[163px] max-[600px]:size-20"
        interactive
        busy={busy}
        revealKey={revealKey}
        label={hasCustomPhoto ? copy.changePhoto : copy.addPhoto}
        onClick={() => inputRef.current?.click()}
      />
      {hasCustomPhoto && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-[13px] leading-[1.4] text-[#242424]/55 transition-colors duration-150 hover:text-plum"
        >
          {copy.removePhoto}
        </button>
      ) : null}
    </div>
  );
}

function AccountField({
  label,
  value,
  onChange,
  type = "text",
  readOnly,
  autoComplete,
  name,
  hideLabel,
  showLabel,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: "text" | "password";
  readOnly?: boolean;
  autoComplete?: string;
  name?: string;
  hideLabel?: string;
  showLabel?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && visible ? "text" : type;

  return (
    <label className="flex w-full flex-col gap-2.5 max-[600px]:gap-1.5">
      <span className="text-[16px] leading-[1.5] text-[#242424] max-[600px]:text-[13px]">
        {label}
      </span>
      <span className="relative block">
        <input
          type={resolvedType}
          name={name}
          value={value}
          readOnly={readOnly}
          autoComplete={autoComplete}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className={[
            "h-[62px] w-full rounded-[10px] bg-white px-5 text-[16px] leading-[1.5] text-[#242424] outline-none transition-shadow duration-150",
            "focus:shadow-[0_0_0_2px_rgba(76,13,50,0.25)] max-[600px]:h-[50px] max-[600px]:text-[13px]",
            "read-only:cursor-default read-only:text-text/80",
            isPassword ? "pr-12" : "",
          ].join(" ")}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? hideLabel : showLabel}
          >
            <img
              src={visible ? siteAssets.eye : siteAssets.eyeOff}
              alt=""
              width={visible ? 24 : 22}
              height={visible ? 24 : 20}
              className={visible ? "size-6" : "h-5 w-[22px]"}
            />
          </button>
        ) : null}
      </span>
    </label>
  );
}

function avatarMessage(err: unknown, copy: AccountCopy): string {
  const code = err instanceof Error ? err.message : "";
  if (code === "avatar_too_large") return copy.avatarTooLarge;
  if (code === "avatar_type") return copy.avatarBadType;
  if (code === "avatar_canvas") return copy.avatarError;
  return copy.profileError;
}

async function prepareAvatarUpload(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|avif)$/i.test(file.type)) {
    throw new Error("avatar_type");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("avatar_too_large");
  }

  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  if (side < 1) {
    bitmap.close();
    throw new Error("avatar_type");
  }

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("avatar_canvas");
  }

  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
  bitmap.close();

  const blob = await canvasToBlob(canvas);
  return new File([blob], "avatar.webp", { type: blob.type });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const finish = (type: string, quality: number) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else if (type === "image/webp") finish("image/jpeg", 0.9);
          else reject(new Error("avatar_canvas"));
        },
        type,
        quality,
      );
    };
    finish("image/webp", 0.9);
  });
}
