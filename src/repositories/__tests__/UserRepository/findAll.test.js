const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("findAll", () => {
    it("returns all users ordered by created_at desc", async () => {
        mockChain.order.mockResolvedValue({
            data: [{ user_id: 1 }, { user_id: 2 }],
            error: null,
        });

        const result = await userRepository.findAll();

        expect(mockChain.order).toHaveBeenCalledWith("created_at", {
            ascending: false,
        });
        expect(result).toHaveLength(2);
    });

    it("throws on error", async () => {
        mockChain.order.mockResolvedValue({
            data: null,
            error: { message: "All fetch error" },
        });

        await expect(userRepository.findAll()).rejects.toThrow(
            "All fetch error",
        );
    });
});
