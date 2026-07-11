import { MaterialIcon } from "./MaterialIcon";

export type Role = "seller" | "buyer";

export function RoleGate({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 py-16">
      <h2 className="text-[28px] font-bold text-on-surface">Nasıl devam etmek istersiniz?</h2>
      <p className="text-on-surface-variant text-[14px] max-w-md">
        Satıcıysanız içerik kaydedip teslimatları yönetin; alıcıysanız satılan içerikleri görüntüleyip satın alın.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => onSelect("seller")}
          className="glass-panel rounded-xl px-10 py-8 flex flex-col items-center gap-3 hover:border-primary transition-colors w-56"
        >
          <div className="bg-primary/20 p-3 rounded-full">
            <MaterialIcon name="store" className="text-primary text-[28px]" />
          </div>
          <span className="font-semibold text-on-surface">Satıcıyım</span>
        </button>
        <button
          onClick={() => onSelect("buyer")}
          className="glass-panel rounded-xl px-10 py-8 flex flex-col items-center gap-3 hover:border-secondary transition-colors w-56"
        >
          <div className="bg-secondary/20 p-3 rounded-full">
            <MaterialIcon name="shopping_cart" className="text-secondary text-[28px]" />
          </div>
          <span className="font-semibold text-on-surface">Alıcıyım</span>
        </button>
      </div>
    </div>
  );
}
