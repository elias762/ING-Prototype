import { useState, useEffect, useCallback } from 'react'
import type { Offer } from '../data/mockData'
import {
  fetchOffers,
  createOffer as createOfferService,
  updateOffer as updateOfferService,
  deleteOffer as deleteOfferService,
} from '../services/offerService'

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchOffers()
      setOffers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (offer: Offer) => {
    try {
      const created = await createOfferService(offer)
      setOffers(prev => [...prev, created])
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer')
    }
  }, [])

  const update = useCallback(async (id: string, updates: Partial<Offer>) => {
    try {
      const updated = await updateOfferService(id, updates)
      setOffers(prev => prev.map(o => o.id === id ? updated : o))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer')
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteOfferService(id)
      setOffers(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete offer')
    }
  }, [])

  const patch = useCallback((id: string, updated: Offer) => {
    setOffers(prev => prev.map(o => o.id === id ? updated : o))
  }, [])

  return { offers, loading, error, refetch: load, create, update, patch, remove }
}
