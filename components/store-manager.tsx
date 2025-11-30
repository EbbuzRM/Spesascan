"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Loader2, Store } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Store {
    id: string
    name: string
    created_at: string
}

interface StoreManagerProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onStoreUpdate?: () => void
}

export function StoreManager({ open, onOpenChange, onStoreUpdate }: StoreManagerProps) {
    const [stores, setStores] = useState<Store[]>([])
    const [loading, setLoading] = useState(false)
    const [editingStore, setEditingStore] = useState<Store | null>(null)
    const [newStoreName, setNewStoreName] = useState("")
    const [editStoreName, setEditStoreName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    // Fetch stores when modal opens
    useEffect(() => {
        if (open) {
            fetchStores()
        }
    }, [open])

    const fetchStores = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/stores")
            if (response.ok) {
                const data = await response.json()
                setStores(data)
            } else {
                throw new Error("Failed to fetch stores")
            }
        } catch (error) {
            console.error("Error fetching stores:", error)
            toast({
                title: "Errore",
                description: "Impossibile caricare i negozi",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStoreName.trim()) {
            toast({
                title: "Errore",
                description: "Inserisci un nome per il negozio",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: newStoreName.trim() }),
            })

            if (response.ok) {
                const newStore = await response.json()
                setStores([...stores, newStore])
                setNewStoreName("")
                toast({
                    title: "Successo",
                    description: "Negozio creato con successo",
                })
                onStoreUpdate?.()
            } else {
                const error = await response.json()
                throw new Error(error.error || "Failed to create store")
            }
        } catch (error: any) {
            console.error("Error creating store:", error)
            toast({
                title: "Errore",
                description: error.message || "Impossibile creare il negozio",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateStore = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingStore || !editStoreName.trim()) {
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/stores/${editingStore.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: editStoreName.trim() }),
            })

            if (response.ok) {
                const updatedStore = await response.json()
                setStores(stores.map((store) => (store.id === editingStore.id ? updatedStore : store)))
                setEditingStore(null)
                setEditStoreName("")
                toast({
                    title: "Successo",
                    description: "Negozio aggiornato con successo",
                })
                onStoreUpdate?.()
            } else {
                const error = await response.json()
                throw new Error(error.error || "Failed to update store")
            }
        } catch (error: any) {
            console.error("Error updating store:", error)
            toast({
                title: "Errore",
                description: error.message || "Impossibile aggiornare il negozio",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteStore = async (storeId: string) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/stores/${storeId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setStores(stores.filter((store) => store.id !== storeId))
                toast({
                    title: "Successo",
                    description: "Negozio eliminato con successo",
                })
                onStoreUpdate?.()
            } else {
                const error = await response.json()
                throw new Error(error.error || "Failed to delete store")
            }
        } catch (error: any) {
            console.error("Error deleting store:", error)
            toast({
                title: "Errore",
                description: error.message || "Impossibile eliminare il negozio",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const startEditing = (store: Store) => {
        setEditingStore(store)
        setEditStoreName(store.name)
    }

    const cancelEditing = () => {
        setEditingStore(null)
        setEditStoreName("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Store className="h-4 w-4 mr-2" />
                    Gestisci Negozi
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Gestisci Negozi</DialogTitle>
                    <DialogDescription>
                        Aggiungi, modifica o elimina negozi dalla lista
                    </DialogDescription>
                </DialogHeader>

                {/* Add new store form */}
                <form onSubmit={handleCreateStore} className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="new-store">Nuovo Negozio</Label>
                        <div className="flex gap-2">
                            <Input
                                id="new-store"
                                placeholder="Nome del negozio"
                                value={newStoreName}
                                onChange={(e) => setNewStoreName(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <Button type="submit" size="sm" disabled={isSubmitting || !newStoreName.trim()}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Stores list */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nessun negozio trovato</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {stores.map((store) => (
                                <div
                                    key={store.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                >
                                    {editingStore?.id === store.id ? (
                                        <form onSubmit={handleUpdateStore} className="flex-1 flex gap-2">
                                            <Input
                                                value={editStoreName}
                                                onChange={(e) => setEditStoreName(e.target.value)}
                                                disabled={isSubmitting}
                                                className="flex-1"
                                            />
                                            <Button type="submit" size="sm" disabled={isSubmitting || !editStoreName.trim()}>
                                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salva"}
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={cancelEditing} disabled={isSubmitting}>
                                                Annulla
                                            </Button>
                                        </form>
                                    ) : (
                                        <>
                                            <span className="font-medium">{store.name}</span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => startEditing(store)}
                                                    disabled={isSubmitting}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={isSubmitting}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Questa azione non può essere annullata. Il negozio verrà eliminato permanentemente.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteStore(store.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Elimina
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                        Chiudi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}