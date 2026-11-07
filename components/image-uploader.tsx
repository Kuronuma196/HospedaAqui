import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon, GripVertical } from "lucide-react";
import { C } from "./ds";
import { storageService } from "./services/api";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  /** Pasta no Supabase Storage (ex: "cars", "properties", "rooms") */
  folder?: string;
  /** Número máximo de fotos permitido */
  maxImages?: number;
  /** Se true, exibe erro quando não há nenhuma foto */
  required?: boolean;
  /** Rótulo exibido acima do uploader */
  label?: string;
};

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className ?? ""}`}>
        <ImageIcon size={20} style={{ color: C.textLight }} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
}

export function ImageUploader({ images, onChange, folder = "uploads", maxImages = 8, required = true, label = "Fotos" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = Math.max(0, maxImages - images.length);
    if (remaining === 0) {
      setUploadError(`O limite de ${maxImages} fotos já foi atingido.`);
      return;
    }
    const selected = Array.from(files);
    const errors: string[] = [];
    if (selected.length > remaining) errors.push(`Você pode adicionar no máximo mais ${remaining} foto(s).`);
    setUploading(true);
    setUploadError("");
    const results: string[] = [];
    try {
      for (const file of selected.slice(0, remaining)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          errors.push(`"${file.name}" não é JPG, PNG ou WebP.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`"${file.name}" excede 5MB.`);
          continue;
        }
        const url = await storageService.upload(file, folder);
        if (url) results.push(url);
        else errors.push(`Falha ao enviar "${file.name}". Verifique a configuração de armazenamento e tente novamente.`);
      }
      onChange([...images, ...results].slice(0, maxImages));
      setUploadError(errors.join(" "));
    } catch {
      setUploadError("Ocorreu um erro ao enviar as fotos. Tente novamente.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const moveLeft = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const canAdd = images.length < maxImages;

  return (
    <div>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>
          {label}
          {required && <span className="ml-1" style={{ color: C.error }}>*</span>}
        </label>
        <span className="text-xs" style={{ color: C.textLight }}>
          {images.length}/{maxImages} foto{maxImages !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {images.map((src, i) => (
            <div
              key={`${src.slice(-20)}_${i}`}
              className="relative rounded-xl overflow-hidden group"
              style={{ aspectRatio: "4/3", border: i === 0 ? `2px solid ${C.primary}` : `2px solid transparent` }}
            >
              <ImageWithFallback src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveLeft(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    title="Mover para frente"
                  >
                    <GripVertical size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                  title="Remover foto"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Cover badge */}
              {i === 0 && (
                <span
                  className="absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}
                >
                  Capa
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:opacity-80 select-none"
          style={{
            borderColor: required && images.length === 0 ? C.error : C.primary,
            backgroundColor: required && images.length === 0 ? `${C.error}08` : `${C.primary}06`,
          }}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" style={{ color: C.primary }} />
              <span className="text-sm" style={{ color: C.primary, fontWeight: 600 }}>
                Enviando...
              </span>
            </div>
          ) : (
            <>
              <Upload size={22} className="mx-auto mb-1.5" style={{ color: images.length === 0 && required ? C.error : C.primary }} />
              <p className="text-sm" style={{ color: images.length === 0 && required ? C.error : C.primary, fontWeight: 700 }}>
                {images.length === 0 ? "📷 Adicionar fotos (obrigatório)" : "➕ Adicionar mais fotos"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.textLight }}>
                JPG, PNG, WebP • Máx. 5MB por foto • Múltiplas seleções
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Validation messages */}
      {required && images.length === 0 && !uploading && (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: C.error }}>
          ⚠ Adicione pelo menos uma foto para continuar.
        </p>
      )}
      {uploadError && (
        <p className="text-xs mt-1.5" style={{ color: C.error }}>{uploadError}</p>
      )}
      {images.length > 0 && (
        <p className="text-xs mt-1.5" style={{ color: C.textLight }}>
          💡 Passe o mouse sobre uma foto para removê-la ou reordenar. A primeira foto é a capa.
        </p>
      )}
    </div>
  );
}
