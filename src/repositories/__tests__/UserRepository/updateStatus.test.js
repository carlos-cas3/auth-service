const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("updateStatus", () => {
    it("returns updated user with new status", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 1, status: "ACTIVE" },
            error: null,
        });

        const result = await userRepository.updateStatus(1, "ACTIVE");

        expect(mockChain.update).toHaveBeenCalledWith({ status: "ACTIVE" });
        expect(result.status).toBe("ACTIVE");
    });

    it("throws on error", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { message: "update failed" },
        });

        await expect(userRepository.updateStatus(1, "ACTIVE")).rejects.toThrow(
            "update failed",
        );
    });
});
