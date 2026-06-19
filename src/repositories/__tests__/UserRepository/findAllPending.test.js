const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("findAllPending", () => {
    it("returns pending users ordered by created_at desc", async () => {
        mockChain.order.mockResolvedValue({
            data: [{ user_id: 2 }, { user_id: 1 }],
            error: null,
        });

        const result = await userRepository.findAllPending();

        expect(mockChain.eq).toHaveBeenCalledWith("status", "PENDING");
        expect(mockChain.eq).toHaveBeenCalledWith("role_id", 2);
        expect(mockChain.order).toHaveBeenCalledWith("created_at", {
            ascending: false,
        });
        expect(result).toHaveLength(2);
    });

    it("throws on error", async () => {
        mockChain.order.mockResolvedValue({
            data: null,
            error: { message: "Pending fetch error" },
        });

        await expect(userRepository.findAllPending()).rejects.toThrow(
            "Pending fetch error",
        );
    });
});
