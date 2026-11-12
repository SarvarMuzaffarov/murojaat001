/**
 * Safe fetch utility with guaranteed JSON parsing and friendly Uzbek error messages.
 * Prevents "Unexpected token 'T', "The page c"... is not valid JSON" crashes.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  retries = 2
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 700));
      return safeFetchJson<T>(url, options, retries - 1);
    }
    throw new Error('Internet yoki server bilan aloqa uzildi. Iltimos, internet ulanishingizni tekshirib qaytadan urinib ko‘ring.');
  }

  const rawText = await response.text();
  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (_parseErr) {
    // If we received non-JSON HTML (404/502/503/warmup page) during server reload, retry!
    if (retries > 0 && (response.status === 404 || response.status >= 500)) {
      await new Promise((r) => setTimeout(r, 800));
      return safeFetchJson<T>(url, options, retries - 1);
    }

    if (response.status === 413) {
      throw new Error('Biriktirilgan fayllar hajmi juda katta (server chegarasidan oshdi). Iltimos, fayllar umumiy hajmini 10 MB dan oshirmang.');
    }
    if (response.status === 429) {
      throw new Error('Qisqa vaqt ichida juda ko‘p murojaat yuborildi. Iltimos, biroz kutib qaytadan urinib ko‘ring.');
    }
    if (response.status === 404) {
      throw new Error('Server API xizmati vaqtincha javob bermadi (404). Iltimos, 2-3 soniyadan so‘ng qaytadan urinib ko‘ring.');
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
