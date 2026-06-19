const { setupMocks } = require("./helpers/mockSetup");

const { mockChain, supabaseAdmin } = setupMocks();
const userRepository = require("../../UserRepository");

describe("findByEmail", () => {
    it("returns user when found", async () => {
        const user = { user_id: 1, email: "test@test.com" };
        mockChain.single.mockResolvedValue({ data: user, error: null });

        const result = await userRepository.findByEmail("test@test.com");

        expect(supabaseAdmin.from).toHaveBeenCalledWith("users");
        expect(mockChain.eq).toHaveBeenCalledWith("email", "test@test.com");
        expect(result).toEqual(user);
    });

    it("returns null on PGRST116", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
        });

        expect(await userRepository.findByEmail("missing@test.com")).toBeNull();
    });

    it("throws on unexpected DB error", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST500", message: "DB error" },
        });

        await expect(
            userRepository.findByEmail("test@test.com"),
        ).rejects.toThrow("DB error");
    });
});
