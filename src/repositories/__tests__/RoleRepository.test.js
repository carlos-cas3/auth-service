// 1. Importamos el repositorio (Sube un nivel desde __tests__)
const roleRepository = require("../RoleRepository");

// 2. Creamos un objeto de cadena unificado
const mockChain = {
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
};

// Configuramos el Fluent API (que todos los métodos de filtrado regresen la cadena)
mockChain.select.mockReturnValue(mockChain);
mockChain.eq.mockReturnValue(mockChain);

// 3. Mockeamos el archivo de configuración con la ruta correcta para este archivo
jest.mock("../../config/supabase", () => {
    const mockFrom = jest.fn(() => mockChain);
    return {
        supabase: { from: mockFrom },
        supabaseAdmin: { from: mockFrom },
    };
});

// 4. Traemos la instancia para verificar las llamadas en los asserts si es necesario
const { supabaseAdmin } = require("../../config/supabase");

beforeEach(() => {
    jest.clearAllMocks();

    // Re-vinculamos los métodos encadenados por si algún test alteró su comportamiento
    mockChain.select.mockReturnValue(mockChain);
    mockChain.eq.mockReturnValue(mockChain);
});

describe("findByName", () => {
    it("returns role when found", async () => {
        const role = { role_id: 1, role_name: "SUPER_ADMIN" };

        // Hacemos que el método final de la cadena devuelva el resultado
        mockChain.single.mockResolvedValue({ data: role, error: null });

        const result = await roleRepository.findByName("SUPER_ADMIN");

        expect(supabaseAdmin.from).toHaveBeenCalledWith("roles");
        expect(mockChain.eq).toHaveBeenCalledWith("role_name", "SUPER_ADMIN");
        expect(result).toEqual(role);
    });

    it("returns null when role not found (PGRST116)", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
        });

        const result = await roleRepository.findByName("NONEXISTENT");

        expect(result).toBeNull();
    });

    it("throws error on unexpected DB failure", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST500", message: "Fatal DB Error" },
        });

        await expect(roleRepository.findByName("SUPER_ADMIN")).rejects.toThrow(
            "Fatal DB Error",
        );
    });
});

describe("findById", () => {
    it("returns role by id", async () => {
        const role = { role_id: 2, role_name: "VENDOR_ADMIN" };
        mockChain.single.mockResolvedValue({ data: role, error: null });

        const result = await roleRepository.findById(2);

        expect(mockChain.eq).toHaveBeenCalledWith("role_id", 2);
        expect(result).toEqual(role);
    });

    it("returns null when role not found by id (PGRST116)", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
        });

        const result = await roleRepository.findById(999);
        expect(result).toBeNull();
    });

    it("throws error on unexpected DB failure by id", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST500", message: "ID Fetch Error" },
        });

        await expect(roleRepository.findById(1)).rejects.toThrow("ID Fetch Error");
    });
});

describe("findAll", () => {
    it("returns all roles", async () => {
        const roles = [
            { role_id: 1, role_name: "SUPER_ADMIN" },
            { role_id: 2, role_name: "VENDOR_ADMIN" },
        ];

        // Ojo aquí: findAll() termina en .select(), no en .single()
        mockChain.select.mockResolvedValue({ data: roles, error: null });

        const result = await roleRepository.findAll();

        expect(supabaseAdmin.from).toHaveBeenCalledWith("roles");
        expect(result).toHaveLength(2);
        expect(result[0].role_name).toBe("SUPER_ADMIN");
    });

    it("throws error when findAll fails", async () => {
        mockChain.select.mockResolvedValue({
            data: null,
            error: { message: "Read failure" },
        });

        await expect(roleRepository.findAll()).rejects.toThrow("Read failure");
    });
});