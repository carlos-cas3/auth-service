const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("findById", () => {
    it("returns user by id", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 1 },
            error: null,
        });

        const result = await userRepository.findById(1);

        expect(mockChain.eq).toHaveBeenCalledWith("user_id", 1);
        expect(result.user_id).toBe(1);
    });

    it("returns null when not found (PGRST116)", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
        });

        expect(await userRepository.findById(999)).toBeNull();
    });

    it("throws on DB error", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { message: "fail" },
        });

        await expect(userRepository.findById(1)).rejects.toThrow("fail");
    });
});
