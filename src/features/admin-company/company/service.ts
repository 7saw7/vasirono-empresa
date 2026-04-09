import { mapCompanyProfile } from "./mapper";
import { validateUpdateCompanyProfileInput } from "./schema";
import type { CompanyProfile, UpdateCompanyProfileInput } from "./types";

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const raw = {
    company_id: 1,
    name: "Makis Premium Perú",
    description:
      "Cadena de comida japonesa con foco en delivery, experiencia rápida y presencia digital consistente.",
    address: "Av. Principal 123, Lima",
    phone: "+51 999 888 777",
    email: "contacto@makispremium.pe",
    website: "https://makispremium.pe",
    verification_status: "En revisión",
    price_label: "S/ 25 - S/ 60",
    media: [
      {
        media_id: 1,
        url: "https://placehold.co/640x360?text=Logo",
        type_label: "Logo",
      },
      {
        media_id: 2,
        url: "https://placehold.co/640x360?text=Portada",
        type_label: "Portada",
      },
    ],
    contacts: [
      {
        id: 1,
        type_label: "WhatsApp",
        value: "+51 999 888 777",
        is_primary: true,
        is_public: true,
      },
      {
        id: 2,
        type_label: "Correo",
        value: "contacto@makispremium.pe",
        is_primary: false,
        is_public: true,
      },
    ],
    categories: [
      {
        subcategory_id: 10,
        subcategory_name: "Makis",
        category_name: "Restaurantes",
        price_label: "S/ 25 - S/ 60",
      },
      {
        subcategory_id: 11,
        subcategory_name: "Comida japonesa",
        category_name: "Restaurantes",
        price_label: "S/ 25 - S/ 60",
      },
    ],
  };

  return mapCompanyProfile(raw);
}

export async function updateCompanyProfile(
  input: UpdateCompanyProfileInput
): Promise<CompanyProfile> {
  const validation = validateUpdateCompanyProfileInput(input);

  if (!validation.success) {
    throw new Error("Datos inválidos para actualizar el perfil del negocio.");
  }

  return getCompanyProfile();
}