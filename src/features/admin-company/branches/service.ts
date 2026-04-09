import { mapBranchDetail, mapBranchListItem } from "./mapper";
import { validateUpsertBranchInput } from "./schema";
import type {
  BranchDetail,
  BranchListFilters,
  BranchListItem,
  UpsertBranchInput,
} from "./types";

const RAW_BRANCHES = [
  {
    branch_id: 1,
    company_id: 1,
    name: "Makis Premium - VES",
    description: "Sucursal principal con mayor flujo de pedidos.",
    address: "Av. Revolución 451, Villa El Salvador",
    phone: "+51 999 111 111",
    email: "ves@makispremium.pe",
    district_name: "Villa El Salvador",
    is_main: true,
    is_active: true,
    final_score: 91.3,
    visits_30d: 4120,
    avg_rating_90d: 4.8,
  },
  {
    branch_id: 2,
    company_id: 1,
    name: "Makis Premium - SJM",
    description: "Sucursal enfocada en cobertura delivery.",
    address: "Av. Los Héroes 998, San Juan de Miraflores",
    phone: "+51 999 222 222",
    email: "sjm@makispremium.pe",
    district_name: "San Juan de Miraflores",
    is_main: false,
    is_active: true,
    final_score: 86.7,
    visits_30d: 3588,
    avg_rating_90d: 4.6,
  },
  {
    branch_id: 3,
    company_id: 1,
    name: "Makis Premium - Chorrillos",
    description: "Sucursal con crecimiento reciente.",
    address: "Av. Huaylas 2100, Chorrillos",
    phone: "+51 999 333 333",
    email: "chorrillos@makispremium.pe",
    district_name: "Chorrillos",
    is_main: false,
    is_active: false,
    final_score: 82.9,
    visits_30d: 2140,
    avg_rating_90d: 4.5,
  },
];

export async function listBranches(
  filters: BranchListFilters = {}
): Promise<BranchListItem[]> {
  let items = RAW_BRANCHES;

  if (filters.search) {
    const search = filters.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.address.toLowerCase().includes(search) ||
        item.district_name.toLowerCase().includes(search)
    );
  }

  if (filters.status === "active") {
    items = items.filter((item) => item.is_active);
  }

  if (filters.status === "inactive") {
    items = items.filter((item) => !item.is_active);
  }

  return items.map(mapBranchListItem);
}

export async function getBranchById(branchId: number): Promise<BranchDetail> {
  const found = RAW_BRANCHES.find((item) => item.branch_id === branchId);

  if (!found) {
    throw new Error("Sucursal no encontrada.");
  }

  const raw = {
    ...found,
    lat: -12.213,
    lon: -76.937,
    schedules: [
      {
        schedule_id: 1,
        day_name: "Lunes",
        opening: "12:00",
        closing: "22:00",
        shift_number: 1,
      },
      {
        schedule_id: 2,
        day_name: "Martes",
        opening: "12:00",
        closing: "22:00",
        shift_number: 1,
      },
    ],
    services: [
      {
        service_id: 1,
        code: "delivery",
        name: "Delivery",
        is_available: true,
      },
      {
        service_id: 2,
        code: "pickup",
        name: "Recojo en tienda",
        is_available: true,
      },
    ],
    contacts: [
      {
        contact_id: 1,
        type_label: "WhatsApp",
        value: found.phone ?? "",
        label: "Atención principal",
        is_primary: true,
        is_public: true,
      },
      {
        contact_id: 2,
        type_label: "Correo",
        value: found.email ?? "",
        label: null,
        is_primary: false,
        is_public: true,
      },
    ],
    media: [
      {
        media_id: 1,
        type_label: "Portada",
        url: "https://placehold.co/640x360?text=Sucursal",
      },
    ],
  };

  return mapBranchDetail(raw);
}

export async function createBranch(
  input: UpsertBranchInput
): Promise<BranchListItem> {
  const validation = validateUpsertBranchInput(input);

  if (!validation.success) {
    throw new Error("Datos inválidos para crear la sucursal.");
  }

  return mapBranchListItem({
    branch_id: 999,
    company_id: 1,
    name: input.name,
    description: input.description,
    address: input.address,
    phone: input.phone,
    email: input.email,
    district_name: "Distrito temporal",
    is_main: input.isMain,
    is_active: input.isActive,
    final_score: 0,
    visits_30d: 0,
    avg_rating_90d: 0,
  });
}

export async function updateBranch(
  branchId: number,
  input: UpsertBranchInput
): Promise<BranchListItem> {
  const validation = validateUpsertBranchInput(input);

  if (!validation.success) {
    throw new Error("Datos inválidos para actualizar la sucursal.");
  }

  return mapBranchListItem({
    branch_id: branchId,
    company_id: 1,
    name: input.name,
    description: input.description,
    address: input.address,
    phone: input.phone,
    email: input.email,
    district_name: "Distrito temporal",
    is_main: input.isMain,
    is_active: input.isActive,
    final_score: 0,
    visits_30d: 0,
    avg_rating_90d: 0,
  });
}