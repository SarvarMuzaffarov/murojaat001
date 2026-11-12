/**
 * Safe fetch utility with guaranteed JSON parsing and friendly Uzbek error messages.
 * Prevents "Unexpected token 'T', "The page c"... is not valid JSON" crashes.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error('Internet yoki server bilan aloqa uzildi. Iltimos, internet ulanishingizni tekshirib qaytadan urinib ko‘ring.');
  }

  const rawText = await response.text();
  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (_parseErr) {
    // Non-JSON response received (e.g. 413 Payload Too Large HTML page, 502/504 Bad Gateway, 429 Too Many Requests)
    if (response.status === 413) {
      throw new Error('Biriktirilgan fayllar hajmi juda katta (server chegarasidan oshdi). Iltimos, fayllar umumiy hajmini 10 MB dan oshirmang.');
    }
    if (response.status === 429) {
      throw new Error('Qisqa vaqt ichida juda ko‘p murojaat yuborildi. Iltimos, biroz kutib qaytadan urinib ko‘ring.');
    }
    if (response.status === 404) {
      throw new Error('So‘ralgan server manzili topilmadi yoki server qayta yuklanmoqda (404). Iltimos, bir ozdan so‘ng qayta urinib ko‘ring.');
    }
    if (response.status >= 500) {
      throw new Error(`Serverda vaqtinchalik texnik xatolik (${response.status}). Iltimos, 1-2 daqiqadan so‘ng qayta urinib ko‘ring.`);
    }
    throw new Error(`Serverdan kutilmagan javob keldi (status: ${response.status}). Iltimos, qaytadan urinib ko‘ring.`);
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Amalni bajarishda xatolik yuz berdi (kod: ${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}
