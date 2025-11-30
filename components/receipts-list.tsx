"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"
import { Building2, Calendar, Eye, Trash2, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Receipt {
  id: string
  total_amount: number
  status: string
  created_at: string
  image_url: string
  stores: {
    name: string
  } | null
}

export function ReceiptsList({ receipts }: { receipts: Receipt[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTotal, setEditTotal] = useState("")

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        console.error("Failed to delete receipt:", res.status, data)
        alert(`Errore durante l'eliminazione: ${data.error || "Errore sconosciuto"}`)
      }
    } catch (error) {
      console.error("Error deleting receipt:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditOpen = (receipt: Receipt) => {
    setEditingId(receipt.id)
    setEditTotal(receipt.total_amount.toFixed(2))
  }

  const handleEditSave = async () => {
    if (!editingId) return

    try {
      const res = await fetch(`/api/receipts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_amount: parseFloat(editTotal) }),
      })

      if (res.ok) {
        setEditingId(null)
        router.refresh()
      } else {
        const data = await res.json()
        alert(`Errore: ${data.error || "Errore sconosciuto"}`)
      }
    } catch (error) {
      console.error("Error updating receipt:", error)
      alert("Errore durante l'aggiornamento")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge variant="default">Elaborato</Badge>
      case "pending":
        return <Badge variant="secondary">In attesa</Badge>
      case "rejected":
        return <Badge variant="destructive">Rifiutato</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {receipts.map((receipt) => (
        <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {receipt.stores?.name || "Negozio sconosciuto"}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(receipt.created_at), {
                    addSuffix: true,
                    locale: it,
                  })}
                </CardDescription>
              </div>
              {getStatusBadge(receipt.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Totale:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">€{receipt.total_amount.toFixed(2)}</span>
                  <Dialog open={editingId === receipt.id} onOpenChange={(open) => !open && setEditingId(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditOpen(receipt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifica Totale</DialogTitle>
                        <DialogDescription>
                          Correggi il totale dello scontrino se l'OCR ha sbagliato
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="total" className="text-right">
                            Totale (€)
                          </label>
                          <Input
                            id="total"
                            type="number"
                            step="0.01"
                            value={editTotal}
                            onChange={(e) => setEditTotal(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingId(null)}>
                          Annulla
                        </Button>
                        <Button onClick={handleEditSave}>
                          Salva
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {receipt.image_url && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Visualizza Scontrino
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>Scontrino del {new Date(receipt.created_at).toLocaleDateString()}</span>
                        <span className="text-xl font-bold">Totale: €{receipt.total_amount.toFixed(2)}</span>
                      </DialogTitle>
                      <DialogDescription>
                        Visualizzazione completa dello scontrino
                      </DialogDescription>
                    </DialogHeader>
                    <img
                      src={receipt.image_url || "/placeholder.svg"}
                      alt="Receipt Full"
                      className="w-full h-auto rounded-md"
                    />
                  </DialogContent>
                </Dialog>
              )}

              <div className="flex justify-end pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingId === receipt.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      Elimina
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Questa azione non può essere annullata. Questo eliminerà permanentemente lo scontrino e i dati associati.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(receipt.id)}
                        className="bg-destructive text-white hover:bg-destructive/90 active:text-white focus:text-white data-[state=open]:text-white"
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

