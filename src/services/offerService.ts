import { supabase } from '../lib/supabase'
import { mapOfferRow, mapOfferToRow } from '../lib/mappers'
import type { Offer } from '../data/mockData'

export async function fetchOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapOfferRow)
}

export async function createOffer(offer: Offer): Promise<Offer> {
  const row = mapOfferToRow(offer)
  const { data, error } = await supabase
    .from('offers')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return mapOfferRow(data)
}

export async function updateOffer(id: string, updates: Partial<Offer>): Promise<Offer> {
  const row = mapOfferToRow(updates)
  const { data, error } = await supabase
    .from('offers')
    .update(row)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapOfferRow(data)
}

export async function deleteOffer(id: string): Promise<void> {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id)

  if (error) throw error
}
