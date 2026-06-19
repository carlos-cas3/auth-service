// repositories/__tests__/UserRepository/fallbackClient.test.js


jest.mock
// Mock definido ANTES de cualquier require
jest.mock("../../../config/supabase", () => ({
    supabase:      { from: jest.fn() },
    supabaseAdmin: null, // ← falsy desde el inicio
}));

const { supabase } = require("../../../config/supabase");
const userRepository = require("../../UserRepository");

// Cadena mínima necesaria
const mockChain = {
    select: jest.fn(),
    eq:     jest.fn(),
    order:  jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    single: jest.fn(),
};

beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnValue(mockChain);
    mockChain.eq.mockReturnValue(mockChain);
    mockChain.order.mockReturnValue(mockChain);
    mockChain.insert.mockReturnValue(mockChain);
    mockChain.update.mockReturnValue(mockChain);
    mockChain.delete.mockReturnValue(mockChain);
    supabase.from.mockReturnValue(mockChain);
});

// Un test por método — solo verificamos que usa supabase (no supabaseAdmin)
describe("Fallback: usa supabase cuando supabaseAdmin es null", () => {
    it("findByEmail usa supabase", async () => {
        mockChain.single.mockResolvedValue({ data: { user_id: 1 }, error: null });

        await userRepository.findByEmail("test@test.com");

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("findById usa supabase", async () => {
        mockChain.single.mockResolvedValue({ data: { user_id: 1 }, error: null });

        await userRepository.findById(1);

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("findByVendorId usa supabase", async () => {
        mockChain.single.mockResolvedValue({ data: { user_id: 1 }, error: null });

        await userRepository.findByVendorId(42);

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("create usa supabase", async () => {
        mockChain.single.mockResolvedValue({ data: { user_id: 1 }, error: null });

        await userRepository.create({
            first_name: "John", last_name: "Doe",
            email: "j@test.com", personal_phone: "123",
            password: "pw", role_id: 2, status: "PENDING",
        });

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("updateStatus usa supabase", async () => {
        mockChain.single.mockResolvedValue({ data: { user_id: 1 }, error: null });

        await userRepository.updateStatus(1, "ACTIVE");

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("updateVendorId usa supabase", async () => {
        mockChain.single.mockResolvedValue({ data: { user_id: 1 }, error: null });

        await userRepository.updateVendorId(1, 99);

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("update usa supabase", async () => {
        mockChain.single.mockResolvedValue({ data: { user_id: 1 }, error: null });

        await userRepository.update(1, { first_name: "Jane" });

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("findAllPending usa supabase", async () => {
        mockChain.order.mockResolvedValue({ data: [], error: null });

        await userRepository.findAllPending();

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("findAll usa supabase", async () => {
        mockChain.order.mockResolvedValue({ data: [], error: null });

        await userRepository.findAll();

        expect(supabase.from).toHaveBeenCalledWith("users");
    });

    it("delete usa supabase", async () => {
        mockChain.eq.mockResolvedValue({ error: null });

        await userRepository.delete(1);

        expect(supabase.from).toHaveBeenCalledWith("users");
    });
});