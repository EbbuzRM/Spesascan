"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
    id: string
    name: string
    category: string
    created_at: string
}

interface ProductManagerProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onProductUpdate?: () => void
}

export function ProductManager({ open, onOpenChange, onProductUpdate }: ProductManagerProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [newName, setNewName] = useState("")
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/products")
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            } else {
                setError("Errore nel caricamento dei prodotti")
            }
        } catch (err) {
            setError("Errore di connessione")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchProducts()
        }
    }, [open])

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setNewName(product.name)
        setError("")
    }

    const handleSave = async () => {
        if (!editingProduct || !newName.trim()) {
            setError("Il nome del prodotto è obbligatorio")
            return
        }

        try {
            const response = await fetch(`/api/products/${editingProduct.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            })

            if (response.ok) {
                await fetchProducts()
                setEditingProduct(null)
                setNewName("")
                setError("")
                onProductUpdate?.()
            } else {
                const data = await response.json()
                setError(data.error || "Errore nell'aggiornamento")
            }
        } catch (err) {
            setError("Errore di connessione")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                await fetchProducts()
                onProductUpdate?.()
            } else {
                const data = await response.json()
                setError(data.error || "Errore nell'eliminazione")
            }
        } catch (err) {
            setError("Errore di connessione")
        }
    }

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Gestisci Prodotti
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Gestisci Prodotti</DialogTitle>
                    <DialogDescription>
                        Modifica i nomi dei prodotti per standardizzarli manualmente
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 flex-1 overflow-auto">
                    <div>
                        <Label>Cerca Prodotto</Label>
                        <Input
                            placeholder="Cerca per nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Caricamento...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Nessun prodotto trovato</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="border rounded-lg p-4">
                                    {editingProduct?.id === product.id ? (
                                        <div className="space-y-3">
                                            <div>
                                                <Label>Nome Prodotto</Label>
                                                <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={handleSave} size="sm">
                                                    Salva
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setEditingProduct(null)
                                                        setNewName("")
                                                        setError("")
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Annulla
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-sm text-muted-foreground">{product.category}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEdit(product)} variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(product.id)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
