import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentReceiptsProps {
  receipts: {
    id: string
    total_amount: number
    created_at: string
    store?: {
      name: string
    } | null
  }[]
}

export function RecentReceipts({ receipts }: RecentReceiptsProps) {
  if (!receipts || receipts.length === 0) {
    return <div className="text-sm text-muted-foreground">Nessuno scontrino recente.</div>
  }

  return (
    <div className="space-y-8">
      {receipts.map((receipt) => {
        const storeName = receipt.store?.name || "Negozio sconosciuto"
        const initial = storeName.substring(0, 2).toUpperCase()

        return (
          <div className="flex items-center" key={receipt.id}>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{storeName}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(receipt.created_at).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="ml-auto font-medium">€{Number(receipt.total_amount).toFixed(2)}</div>
          </div>
        )
      })}
    </div>
  )
}
