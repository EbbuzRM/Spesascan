"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function SettingsForm({ user, initialProfile }: { user: any; initialProfile: any }) {
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "")
  const [city, setCity] = useState(initialProfile?.city || "")
  const [cityCode, setCityCode] = useState(initialProfile?.city_code || "bg-bergamo-24121")
  const [citySearch, setCitySearch] = useState("")
  const [searchResults, setSearchResults] = useState<{ name: string; code: string }[]>([])
  const [searching, setSearching] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleCitySearch = async (searchTerm: string) => {
    setCitySearch(searchTerm)

    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/cities/search?q=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      setSearchResults(data.cities || [])
    } catch (error) {
      console.error("Error searching cities:", error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectCity = (selectedCity: { name: string; code: string }) => {
    setCity(selectedCity.name)
    setCityCode(selectedCity.code)
    setCitySearch("")
    setSearchResults([])
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName,
        city: city,
        city_code: cityCode,
      })

      if (error) throw error

      toast({
        title: "Profilo aggiornato",
        description: "Le tue impostazioni sono state salvate con successo.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare il profilo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profilo Utente</CardTitle>
        <CardDescription>Gestisci le tue informazioni personali e preferenze.</CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-sm text-muted-foreground">L'indirizzo email non può essere modificato.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome Visualizzato</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Il tuo nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Città</Label>
            <div className="relative">
              <Input
                id="city"
                value={city || citySearch}
                onChange={(e) => {
                  const value = e.target.value
                  if (city) {
                    setCity("")
                    setCityCode("")
                  }
                  handleCitySearch(value)
                }}
                placeholder="Cerca la tua città..."
              />
              {searching && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.code}
                      type="button"
                      onClick={() => selectCity(result)}
                      className="w-full px-4 py-2 text-left hover:bg-muted"
                    >
                      {result.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              I volantini verranno mostrati in base alla città selezionata.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salva Modifiche
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
